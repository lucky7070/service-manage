import moment from "moment";
import { City, ServiceCategory, ServiceProvider, ServiceProviderPhoto, ProviderService, AssignedSubscription } from "../../models/index.js";
import { escapeRegex, ObjectId } from "../../helpers/utils.js";
import { resolveAreaIdsForCity } from "../../helpers/providerAreas.js";
import { SERVICE_PROVIDER_PROFILE_STATUSES } from "../../config/constants.js";
import { deleteFile } from "../../libraries/storage.js";
import { aggregateProviderServices, listActiveServiceTypesForCategory, loadServiceTypeForProviderCategory, parseProviderServicePrice } from "../../helpers/providerServiceOps.js";
import { buildAssignedSubscriptionListPipeline, getActiveSubscriptionFilter } from "../../helpers/subscriptionAssignment.js";

const ownedFilter = (franchiseId, extra = {}) => ({ franchiseId, deletedAt: null, ...extra });

const findOwnedProvider = async (franchiseId, providerId, projection = null) => {
    const query = ServiceProvider.findOne(ownedFilter(franchiseId, { _id: ObjectId(providerId) }));
    if (projection) query.select(projection);
    return query.lean();
};

export const getFranchiseDashboard = async (req, res) => {
    try {
        const base = ownedFilter(req.franchise._id);
        const [serviceProviders, pending, approved, rejected, referredProviders] = await Promise.all([
            ServiceProvider.countDocuments(base),
            ServiceProvider.countDocuments({ ...base, profileStatus: "pending" }),
            ServiceProvider.countDocuments({ ...base, profileStatus: "approved" }),
            ServiceProvider.countDocuments({ ...base, profileStatus: "rejected" }),
            ServiceProvider.countDocuments({ franchiseId: req.franchise._id, deletedAt: null, registerFrom: "front" })
        ]);

        return res.success({ serviceProviders, pending, approved, rejected, referredProviders, referralCode: req.franchise.userId || null }, "Dashboard stats fetched successfully");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const listFranchiseServiceProviders = async (req, res) => {
    try {
        let { limit, pageNo, query, profileStatus, sortBy = "createdAt", sortOrder = "desc" } = req.query;

        limit = limit ? parseInt(limit, 10) : 10;
        pageNo = pageNo ? parseInt(pageNo, 10) : 1;
        sortBy = ["name", "mobile", "email", "userId", "profileStatus", "createdAt"].includes(String(sortBy)) ? String(sortBy) : "createdAt";
        sortOrder = ["asc", "desc"].includes(String(sortOrder).toLowerCase()) ? String(sortOrder).toLowerCase() : "desc";

        const filter = ownedFilter(req.franchise._id);
        if (query) {
            const q = escapeRegex(String(query));
            filter.$or = [
                { name: { $regex: q, $options: "i" } },
                { mobile: { $regex: q, $options: "i" } },
                { email: { $regex: q, $options: "i" } },
                { userId: { $regex: q, $options: "i" } }
            ];
        }

        if (profileStatus && SERVICE_PROVIDER_PROFILE_STATUSES.includes(String(profileStatus))) {
            filter.profileStatus = String(profileStatus);
        }

        const pipeline = [
            { $match: filter },
            { $lookup: { from: "cities", localField: "cityId", foreignField: "_id", as: "city" } },
            { $lookup: { from: "servicecategories", localField: "serviceCategoryId", foreignField: "_id", as: "serviceCategory" } },
            { $unwind: { path: "$city", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$serviceCategory", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "assignedsubscriptions",
                    localField: "_id",
                    foreignField: "providerId",
                    as: "subscription",
                    pipeline: [
                        { $match: getActiveSubscriptionFilter() },
                        { $sort: { createdAt: -1 } },
                        { $limit: 1 }
                    ]
                }
            },
            { $unwind: { path: "$subscription", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    userId: 1,
                    name: 1,
                    mobile: 1,
                    email: 1,
                    image: 1,
                    cityId: 1,
                    serviceCategoryId: 1,
                    panCardNumber: 1,
                    aadharNumber: 1,
                    panCardDocument: 1,
                    aadharDocument: 1,
                    policeVerification: 1,
                    experienceYears: 1,
                    experienceDescription: 1,
                    cityName: { $ifNull: ["$city.name", ""] },
                    serviceCategoryName: { $ifNull: ["$serviceCategory.name", ""] },
                    currentSubscription: { $ifNull: ["$subscription.voucherNo", null] },
                    profileStatus: 1,
                    isVerified: 1,
                    isFeatured: 1,
                    isActive: 1,
                    registerFrom: 1,
                    createdAt: 1
                }
            }
        ];

        const [results, totalCount] = await Promise.all([
            ServiceProvider.aggregate([
                ...pipeline,
                { $sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 } },
                { $skip: (pageNo - 1) * limit },
                { $limit: limit }
            ]),
            ServiceProvider.aggregate([...pipeline, { $count: "total_count" }])
        ]);
        const total_count = totalCount.length > 0 ? totalCount[0].total_count : 0;

        if (results.length > 0) return res.pagination(results, total_count, limit, pageNo);
        return res.datatableNoRecords();
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const getFranchiseServiceProvider = async (req, res) => {
    try {
        const doc = await ServiceProvider.findOne(ownedFilter(req.franchise._id, { _id: ObjectId(req.params.id) })).lean();
        if (!doc) return res.noRecords();

        const photos = await ServiceProviderPhoto.find({ providerId: doc._id }, "_id photoUrl displayOrder").sort({ displayOrder: 1 }).lean();
        return res.success({ ...doc, photos });
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const createFranchiseServiceProvider = async (req, res) => {
    try {
        const { name, mobile, email, cityId, serviceCategoryId, panCardNumber, aadharNumber, experienceYears, experienceDescription = "" } = req.body;

        const checkExist = await ServiceProvider.findOne({ deletedAt: null, $or: [{ mobile }, { email }, { panCardNumber }, { aadharNumber }] });
        if (checkExist) {
            if (checkExist.mobile === mobile) throw new Error("Service provider with this mobile already exists.");
            if (checkExist.email === email) throw new Error("Service provider with this email already exists.");
            if (checkExist.panCardNumber === panCardNumber) throw new Error("This PAN is already registered.");
            throw new Error("This Aadhar number is already registered.");
        }

        const city = await City.findOne({ _id: ObjectId(cityId), deletedAt: null });
        if (!city) throw new Error("City not found.");

        const serviceCategory = await ServiceCategory.findOne({ _id: ObjectId(serviceCategoryId), deletedAt: null });
        if (!serviceCategory) throw new Error("Service category not found.");

        const files = req.files || {};
        let image = "/service-provider/default.png";
        let panCardDocument = null;
        let aadharDocument = null;
        let policeVerification = null;
        if (files?.image?.[0]?.filename) image = `/service-provider/${files.image[0].filename}`;
        if (files?.panCardDocument?.[0]?.filename) panCardDocument = `/service-provider/${files.panCardDocument[0].filename}`;
        if (files?.aadharDocument?.[0]?.filename) aadharDocument = `/service-provider/${files.aadharDocument[0].filename}`;
        if (files?.policeVerification?.[0]?.filename) policeVerification = `/service-provider/${files.policeVerification[0].filename}`;

        const record = await ServiceProvider.create({
            name: String(name).trim(),
            mobile,
            email,
            panCardNumber,
            cityId,
            serviceCategoryId,
            aadharNumber,
            image,
            panCardDocument,
            aadharDocument,
            policeVerification,
            experienceYears: experienceYears ?? 0,
            experienceDescription: String(experienceDescription || "").trim() || null,
            franchiseId: req.franchise._id,
            registerFrom: "franchise",
            profileStatus: "approved",
            isActive: true,
            isVerified: true
        });

        return res.successInsert(record);
    } catch (error) {
        if (error.code === 11000) {
            return res.clientError("Duplicate mobile, email, PAN, or Aadhar.", 409);
        }
        return res.someThingWentWrong(error);
    }
};

export const updateFranchiseServiceProvider = async (req, res) => {
    try {
        const record = await ServiceProvider.findOne(ownedFilter(req.franchise._id, { _id: ObjectId(req.params.id) }));
        if (!record) return res.noRecords();

        const { name, mobile, email, cityId, serviceCategoryId, panCardNumber, aadharNumber, experienceYears, experienceDescription = "" } = req.body;

        const checkExist = await ServiceProvider.findOne({
            _id: { $ne: record._id },
            deletedAt: null,
            $or: [{ mobile }, { email }, { panCardNumber }, { aadharNumber }]
        });
        if (checkExist) {
            if (checkExist.mobile === mobile) throw new Error("Service provider with this mobile already exists.");
            if (checkExist.email === email) throw new Error("Service provider with this email already exists.");
            if (checkExist.panCardNumber === panCardNumber) throw new Error("This PAN is already registered.");
            throw new Error("This Aadhar number is already registered.");
        }

        const city = await City.findOne({ _id: ObjectId(cityId), deletedAt: null });
        if (!city) throw new Error("City not found.");

        const serviceCategory = await ServiceCategory.findOne({ _id: ObjectId(serviceCategoryId), deletedAt: null });
        if (!serviceCategory) throw new Error("Service category not found.");

        const files = req.files || {};
        let image = record.image;
        let panCardDocument = record.panCardDocument;
        let aadharDocument = record.aadharDocument;
        let policeVerification = record.policeVerification;

        if (files?.image?.[0]?.filename) image = `/service-provider/${files.image[0].filename}`;
        if (files?.panCardDocument?.[0]?.filename) panCardDocument = `/service-provider/${files.panCardDocument[0].filename}`;
        if (files?.aadharDocument?.[0]?.filename) aadharDocument = `/service-provider/${files.aadharDocument[0].filename}`;
        if (files?.policeVerification?.[0]?.filename) policeVerification = `/service-provider/${files.policeVerification[0].filename}`;

        await ServiceProvider.updateOne(
            { _id: record._id },
            {
                name: String(name).trim(),
                cityId,
                serviceCategoryId,
                mobile,
                email,
                panCardNumber,
                aadharNumber,
                image,
                panCardDocument,
                aadharDocument,
                policeVerification,
                experienceYears: experienceYears ?? 0,
                experienceDescription: String(experienceDescription || "").trim() || null
            }
        );

        return res.successUpdate(record);
    } catch (error) {
        if (error.code === 11000) {
            return res.clientError("Duplicate mobile, email, PAN, or Aadhar.", 409);
        }
        return res.someThingWentWrong(error);
    }
};

export const updateFranchiseServiceProviderAreas = async (req, res) => {
    try {
        const record = await ServiceProvider.findOne(ownedFilter(req.franchise._id, { _id: ObjectId(req.params.id) }));
        if (!record) return res.noRecords();
        if (!record.cityId) return res.clientError("Provider city is not set.", 422, [{ field: "cityId", message: "City must be set before assigning areas." }]);

        const areaIds = await resolveAreaIdsForCity(req.body.areaIds, record.cityId);
        await ServiceProvider.updateOne({ _id: record._id }, { areaIds });
        return res.successUpdate(undefined, "Service areas updated.");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const deleteFranchiseServiceProvider = async (req, res) => {
    try {
        const doc = await ServiceProvider.findOne(ownedFilter(req.franchise._id, { _id: ObjectId(req.params.id) }));
        if (!doc) return res.noRecords();

        await doc.updateOne({ deletedAt: moment().toISOString() });
        return res.successDelete(doc);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const getFranchiseServiceProviderPhotos = async (req, res) => {
    try {
        const provider = await findOwnedProvider(req.franchise._id, req.params.id);
        if (!provider) return res.noRecords();

        const rows = await ServiceProviderPhoto.find({ providerId: provider._id }).sort({ displayOrder: 1, createdAt: 1 }).lean();
        return res.success({ record: rows });
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const uploadFranchiseServiceProviderPhotos = async (req, res) => {
    try {
        const provider = await findOwnedProvider(req.franchise._id, req.params.id);
        if (!provider) return res.noRecords();

        const files = req.files || [];
        if (!Array.isArray(files) || files.length === 0) {
            return res.clientError("No image files were uploaded.", 422, [{ field: "files", message: "No image files were uploaded." }]);
        }

        const last = await ServiceProviderPhoto.findOne({ providerId: provider._id }, "displayOrder").sort({ displayOrder: -1 }).lean();
        let nextOrder = (last?.displayOrder ?? -1) + 1;

        const created = [];
        for (const file of files) {
            if (!file?.filename) continue;
            const doc = await ServiceProviderPhoto.create({
                providerId: provider._id,
                photoUrl: `/service-provider-work/${file.filename}`,
                displayOrder: nextOrder++
            });
            created.push(doc.toObject());
        }

        if (!created.length) return res.clientError("No valid images were saved.", 422);
        return res.successInsert({ record: created }, "Photos uploaded.");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const deleteFranchiseServiceProviderPhoto = async (req, res) => {
    try {
        const provider = await findOwnedProvider(req.franchise._id, req.params.id);
        if (!provider) return res.noRecords();

        const doc = await ServiceProviderPhoto.findOne({ _id: ObjectId(req.params.photoId), providerId: provider._id });
        if (!doc) return res.noRecords();

        if (doc.photoUrl) deleteFile(doc.photoUrl);
        await doc.deleteOne();
        return res.successDelete(undefined, "Photo removed.");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const reorderFranchiseServiceProviderPhotos = async (req, res) => {
    try {
        const provider = await findOwnedProvider(req.franchise._id, req.params.id);
        if (!provider) return res.noRecords();

        const { orderedIds } = req.body || {};
        if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
            return res.clientError("orderedIds must be a non-empty array.", 422, [{ field: "orderedIds", message: "Must be a non-empty array." }]);
        }

        const ids = orderedIds.map((x) => ObjectId(x)).filter(Boolean);
        if (ids.length !== orderedIds.length) {
            return res.clientError("Invalid photo id in orderedIds.", 422, [{ field: "orderedIds", message: "Invalid photo id in orderedIds." }]);
        }

        const existing = await ServiceProviderPhoto.find({ providerId: provider._id }, "_id").lean();
        if (existing.length !== ids.length) return res.clientError("Photo list does not match server state.", 409);

        const idSet = new Set(existing.map((r) => String(r._id)));
        for (const id of ids) {
            if (!idSet.has(String(id))) {
                return res.clientError("Unknown photo id in orderedIds.", 422, [{ field: "orderedIds", message: "Unknown photo id." }]);
            }
        }

        await Promise.all(ids.map((photoId, index) =>
            ServiceProviderPhoto.updateOne({ _id: photoId, providerId: provider._id }, { $set: { displayOrder: index } })
        ));

        const rows = await ServiceProviderPhoto.find({ providerId: provider._id }).sort({ displayOrder: 1, createdAt: 1 }).lean();
        return res.success(rows, "Order updated.");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const listFranchiseServiceTypeOptions = async (req, res) => {
    try {
        const categoryId = String(req.query.categoryId || "").trim();
        if (!ObjectId(categoryId)) {
            return res.clientError("Category is required.", 422, [{ field: "categoryId", message: "Category is required." }]);
        }

        const rows = await listActiveServiceTypesForCategory(categoryId, {
            query: req.query.query,
            limit: req.query.limit
        });
        return res.success(rows);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const getFranchiseProviderServices = async (req, res) => {
    try {
        const provider = await findOwnedProvider(req.franchise._id, req.params.id, "_id name mobile email cityId serviceCategoryId");
        if (!provider) return res.noRecords();

        const rows = await aggregateProviderServices(provider._id);
        return res.success({ provider, record: rows });
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const createFranchiseProviderService = async (req, res) => {
    try {
        const provider = await findOwnedProvider(req.franchise._id, req.params.id, "_id name mobile email cityId serviceCategoryId");
        if (!provider) return res.noRecords();

        const typeCheck = await loadServiceTypeForProviderCategory(req.body.serviceTypeId, provider.serviceCategoryId);
        if (typeCheck.error) {
            const e = typeCheck.error;
            return res.clientError(e.message, e.status, e.field ? [{ field: e.field, message: e.message }] : []);
        }

        const serviceTypeId = typeCheck.serviceType._id;
        const price = parseProviderServicePrice(req.body.price);
        if (price === null) return res.clientError("Valid price is required.", 422, [{ field: "price", message: "Valid price is required." }]);

        const exists = await ProviderService.findOne({ providerId: provider._id, serviceTypeId });
        if (exists) throw new Error("This service type is already added for the provider.");

        const doc = await ProviderService.create({
            providerId: provider._id,
            serviceTypeId,
            price,
            isActive: Number(req.body.status ?? 1) === 1
        });

        return res.successInsert(doc, "Provider service added.");
    } catch (error) {
        if (error.code === 11000) return res.clientError("This service type is already added for the provider.", 409);
        return res.someThingWentWrong(error);
    }
};

export const updateFranchiseProviderService = async (req, res) => {
    try {
        const provider = await findOwnedProvider(req.franchise._id, req.params.id, "_id name mobile email cityId serviceCategoryId");
        if (!provider) return res.noRecords();

        const doc = await ProviderService.findOne({ _id: ObjectId(req.params.serviceId), providerId: provider._id });
        if (!doc) return res.noRecords();

        const typeCheck = await loadServiceTypeForProviderCategory(req.body.serviceTypeId, provider.serviceCategoryId);
        if (typeCheck.error) {
            const e = typeCheck.error;
            return res.clientError(e.message, e.status, e.field ? [{ field: e.field, message: e.message }] : []);
        }

        const serviceTypeId = typeCheck.serviceType._id;
        const dup = await ProviderService.findOne({ _id: { $ne: doc._id }, providerId: provider._id, serviceTypeId });
        if (dup) throw new Error("This service type is already added for the provider.");

        const price = parseProviderServicePrice(req.body.price);
        if (price === null) return res.clientError("Valid price is required.", 422, [{ field: "price", message: "Valid price is required." }]);

        await doc.updateOne({ serviceTypeId, price, isActive: Number(req.body.status ?? 1) === 1 });
        return res.successUpdate(doc, "Provider service updated.");
    } catch (error) {
        if (error.code === 11000) return res.clientError("This service type is already added for the provider.", 409);
        return res.someThingWentWrong(error);
    }
};

export const deleteFranchiseProviderService = async (req, res) => {
    try {
        const provider = await findOwnedProvider(req.franchise._id, req.params.id, "_id");
        if (!provider) return res.noRecords();

        const doc = await ProviderService.findOne({ _id: ObjectId(req.params.serviceId), providerId: provider._id });
        if (!doc) return res.noRecords();

        await doc.deleteOne();
        return res.successDelete(undefined, "Provider service removed.");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const getFranchiseProviderSubscriptions = async (req, res) => {
    try {
        const provider = await findOwnedProvider(req.franchise._id, req.params.id, "_id name mobile email cityId serviceCategoryId");
        if (!provider) return res.noRecords();

        const record = await AssignedSubscription.aggregate([
            ...buildAssignedSubscriptionListPipeline({ providerId: ObjectId(provider._id) }),
            { $sort: { createdAt: -1 } }
        ]);
        return res.success({ provider, record });
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

