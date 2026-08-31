import moment from "moment";
import { City, ServiceProvider, ServiceCategory, ServiceProviderPhoto } from "../../models/index.js";
import { escapeRegex, ObjectId, toBoolean } from "../../helpers/utils.js";
import { resolveAreaIdsForCity } from "../../helpers/providerAreas.js";
import { applyProviderCategoryFilter, getProviderCategoryIds, resolveServiceCategoryIds, syncPrimaryCategoryInList } from "../../helpers/providerCategories.js";
import { SERVICE_PROVIDER_PROFILE_STATUSES } from "../../config/constants.js";
import { getActiveSubscriptionFilter } from "../../helpers/subscriptionAssignment.js";
import { formatExportDateTime, sendExcelResponse } from "../../helpers/excelExport.js";

const buildServiceProviderListPipeline = (query) => {
    let { query: searchQuery, profileStatus, cityId, serviceCategoryId, franchise, franchiseId, deleted, sortBy = "createdAt", sortOrder = "desc" } = query;

    const showDeleted = Number(deleted) === 1 || String(deleted) === "true";
    const allowedSort = showDeleted ? ["name", "mobile", "email", "userId", "profileStatus", "createdAt", "deletedAt"] : ["name", "mobile", "email", "userId", "profileStatus", "createdAt", "currentSubscription", "referredCount", "isFeatured", "isVerified"];
    sortBy = allowedSort.includes(String(sortBy)) ? String(sortBy) : (showDeleted ? "deletedAt" : "createdAt");
    sortOrder = ["asc", "desc"].includes(String(sortOrder).toLowerCase()) ? String(sortOrder).toLowerCase() : "desc";

    const filter = showDeleted ? { deletedAt: { $exists: true, $ne: null } } : { deletedAt: null };
    if (searchQuery) {
        const q = escapeRegex(String(searchQuery));
        filter.$or = [
            { name: { $regex: q, $options: "i" } },
            { mobile: { $regex: q, $options: "i" } },
            { email: { $regex: q, $options: "i" } },
            { userId: { $regex: q, $options: "i" } },
            { aadharNumber: { $regex: q, $options: "i" } },
            { panCardNumber: { $regex: q, $options: "i" } }
        ];
    }

    if (profileStatus !== null && profileStatus !== undefined && profileStatus !== "") {
        if (SERVICE_PROVIDER_PROFILE_STATUSES.includes(String(profileStatus))) {
            filter.profileStatus = String(profileStatus);
        }
    }

    if (cityId !== null && cityId !== undefined && cityId !== "") {
        filter.cityId = ObjectId(cityId);
    }

    if (serviceCategoryId !== null && serviceCategoryId !== undefined && serviceCategoryId !== "") {
        applyProviderCategoryFilter(filter, ObjectId(serviceCategoryId));
    }

    const franchiseFilterId = ObjectId(franchise || franchiseId);
    if (franchiseFilterId) filter.franchiseId = franchiseFilterId;

    const pipeline = [
        { $match: filter },
        { $lookup: { from: "cities", localField: "cityId", foreignField: "_id", as: "city" } },
        { $lookup: { from: "servicecategories", localField: "serviceCategoryId", foreignField: "_id", as: "serviceCategory" } },
        { $unwind: { path: "$city", preserveNullAndEmptyArrays: showDeleted } },
        { $unwind: { path: "$serviceCategory", preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: "assignedsubscriptions", localField: "_id", foreignField: "providerId", as: "subscription", pipeline: [
                    { $match: getActiveSubscriptionFilter() },
                    { $sort: { createdAt: -1 } },
                    { $limit: 1 },
                ]
            }
        },
        { $unwind: { path: "$subscription", preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: "serviceproviders",
                localField: "_id",
                foreignField: "referredBy",
                as: "referredProviders",
                pipeline: [{ $match: { deletedAt: null } }, { $count: "n" }]
            }
        },
        { $project: { userId: 1, slug: 1, currentSubscription: { $ifNull: ["$subscription.voucherNo", null] }, referredCount: { $ifNull: [{ $first: "$referredProviders.n" }, 0] }, name: 1, mobile: 1, email: 1, panCardNumber: 1, aadharNumber: 1, cityId: 1, areaIds: 1, serviceCategoryId: 1, serviceCategoryIds: 1, stateId: "$city.stateId", countryId: "$city.countryId", cityName: "$city.name", serviceCategoryName: "$serviceCategory.name", profileStatus: 1, rejectionReason: 1, registerFrom: 1, isVerified: 1, isActive: 1, isFeatured: 1, experienceYears: 1, experienceDescription: 1, image: 1, panCardDocument: 1, aadharDocument: 1, policeVerification: 1, totalCompletedServices: 1, totalRating: 1, ratingCount: 1, createdAt: 1, deletedAt: 1 } }
    ];

    return { pipeline, sortBy, sortOrder };
};

export const createServiceProvider = async (req, res) => {
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
        if (files?.image?.[0]?.filename) image = `/service-provider/${files?.image?.[0]?.filename}`;
        if (files?.panCardDocument?.[0]?.filename) panCardDocument = `/service-provider/${files?.panCardDocument?.[0]?.filename}`;
        if (files?.aadharDocument?.[0]?.filename) aadharDocument = `/service-provider/${files?.aadharDocument?.[0]?.filename}`;
        if (files?.policeVerification?.[0]?.filename) policeVerification = `/service-provider/${files?.policeVerification?.[0]?.filename}`;

        const categoryObjectId = ObjectId(serviceCategoryId);
        const record = await ServiceProvider.create({
            name: name.trim(),
            mobile, email, panCardNumber, cityId, serviceCategoryId: categoryObjectId, serviceCategoryIds: [categoryObjectId], aadharNumber, image, panCardDocument, aadharDocument, policeVerification,
            experienceYears: experienceYears ?? 0,
            experienceDescription: experienceDescription?.trim() || null,
            registerFrom: "admin",
            profileStatus: "approved",
            isActive: true,
            isVerified: true,
            isFeatured: toBoolean(req.body.isFeatured),
        });
        return res.successInsert(record);
    } catch (error) {
        if (error.code === 11000) {
            return res.clientError("Duplicate mobile, email, PAN, or Aadhar.", 409);
        }
        return res.someThingWentWrong(error);
    }
};

export const updateServiceProvider = async (req, res) => {
    try {
        const record = await ServiceProvider.findOne({ _id: ObjectId(req.params.id), deletedAt: null });
        if (!record) return res.noRecords();

        const { name, mobile, email, cityId, serviceCategoryId, panCardNumber, aadharNumber, experienceYears, experienceDescription = "" } = req.body;

        const checkExist = await ServiceProvider.findOne({ _id: { $ne: record._id }, deletedAt: null, $or: [{ mobile }, { email }, { panCardNumber }, { aadharNumber }] });
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

        if (files?.image?.[0]?.filename) image = `/service-provider/${files?.image?.[0]?.filename}`;
        if (files?.panCardDocument?.[0]?.filename) panCardDocument = `/service-provider/${files?.panCardDocument?.[0]?.filename}`;
        if (files?.aadharDocument?.[0]?.filename) aadharDocument = `/service-provider/${files?.aadharDocument?.[0]?.filename}`;
        if (files?.policeVerification?.[0]?.filename) policeVerification = `/service-provider/${files?.policeVerification?.[0]?.filename}`;

        const categoryObjectId = ObjectId(serviceCategoryId);
        const serviceCategoryIds = syncPrimaryCategoryInList(categoryObjectId, getProviderCategoryIds(record));

        await ServiceProvider.updateOne(
            { _id: record._id },
            { name: name.trim(), cityId, serviceCategoryId: categoryObjectId, serviceCategoryIds, mobile, email, panCardNumber, aadharNumber, image, panCardDocument, aadharDocument, policeVerification, experienceYears: experienceYears ?? 0, experienceDescription: experienceDescription?.trim() || null, isFeatured: toBoolean(req.body.isFeatured) }
        );
        return res.successUpdate(record);
    } catch (error) {
        if (error.code === 11000) {
            return res.clientError("Duplicate mobile, email, PAN, or Aadhar.", 409);
        }
        return res.someThingWentWrong(error);
    }
};

export const updateServiceProviderCategories = async (req, res) => {
    try {
        const record = await ServiceProvider.findOne({ _id: ObjectId(req.params.id), deletedAt: null });
        if (!record) return res.noRecords();
        if (!record.serviceCategoryId) {
            return res.clientError("Provider primary service category is not set.", 422, [{ field: "serviceCategoryId", message: "Set a primary category before assigning additional categories." }]);
        }

        const serviceCategoryIds = await resolveServiceCategoryIds(req.body.serviceCategoryIds);
        const primaryId = ObjectId(record.serviceCategoryId);
        if (!serviceCategoryIds.some((id) => String(id) === String(primaryId))) {
            return res.clientError("Primary service category must remain assigned.", 422, [{ field: "serviceCategoryIds", message: "Primary service category cannot be removed here. Change the primary category in provider edit first." }]);
        }

        await ServiceProvider.updateOne({ _id: record._id }, { serviceCategoryIds });
        return res.successUpdate(undefined, "Service categories updated.");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const updateServiceProviderAreas = async (req, res) => {
    try {
        const record = await ServiceProvider.findOne({ _id: ObjectId(req.params.id), deletedAt: null });
        if (!record) return res.noRecords();
        if (!record.cityId) return res.clientError("Provider city is not set.", 422, [{ field: "cityId", message: "City must be set before assigning areas." }]);

        const areaIds = await resolveAreaIdsForCity(req.body.areaIds, record.cityId);
        await ServiceProvider.updateOne({ _id: record._id }, { areaIds });
        return res.successUpdate(undefined, "Service areas updated.");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const updateServiceProviderStatus = async (req, res) => {
    try {
        const record = await ServiceProvider.findOne({ _id: ObjectId(req.params.id), deletedAt: null });
        if (!record) return res.noRecords();

        const nextProfileStatus = String(req.body.profileStatus);
        const nextIsVerified = [1, "1", true, "true"].includes(req.body.isVerified);

        if (!SERVICE_PROVIDER_PROFILE_STATUSES.includes(nextProfileStatus))
            return res.clientError("Invalid profile status.", 422, [{ field: "profileStatus", message: "Invalid profile status." }]);

        const updateDoc = { profileStatus: nextProfileStatus, isVerified: nextIsVerified, approvedBy: req.admin._id, approvedAt: moment().toISOString(), rejectionReason: null };
        if (nextProfileStatus === "rejected" || nextProfileStatus === "suspended") {
            const rejectionReason = String(req.body.rejectionReason || "").trim();
            if (!rejectionReason) {
                const label = nextProfileStatus === "suspended" ? "Suspension" : "Rejection";
                return res.clientError(`${label} reason is required.`, 422, [{ field: "rejectionReason", message: `${label} reason is required.` }]);
            }

            updateDoc.rejectionReason = rejectionReason;
        }

        await record.updateOne(updateDoc);
        return res.successUpdate(undefined, "Provider status updated.");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const deleteServiceProvider = async (req, res) => {
    try {
        const doc = await ServiceProvider.findOne({ _id: ObjectId(req.params.id), deletedAt: null });
        if (!doc) return res.noRecords();

        // if (doc.image) deleteFile(doc.image);
        // if (doc.panCardDocument) deleteFile(doc.panCardDocument);
        // if (doc.aadharDocument) deleteFile(doc.aadharDocument);
        await doc.updateOne({ deletedAt: moment().toISOString() });
        return res.successDelete(doc);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const getServiceProvider = async (req, res) => {
    try {
        let { limit, pageNo } = req.query;
        const { pipeline, sortBy, sortOrder } = buildServiceProviderListPipeline(req.query);

        limit = limit ? parseInt(limit, 10) : 10;
        pageNo = pageNo ? parseInt(pageNo, 10) : 1;

        const totalCountPipeline = [...pipeline, { $count: "total_count" }];
        const resultsPipeline = [...pipeline, { $sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 } }, { $skip: (pageNo - 1) * limit }, { $limit: limit }];

        const [results, totalCount] = await Promise.all([ServiceProvider.aggregate(resultsPipeline), ServiceProvider.aggregate(totalCountPipeline)]);
        const total_count = totalCount.length > 0 ? totalCount[0].total_count : 0;

        if (results.length > 0) {
            return res.pagination(results, total_count, limit, pageNo);
        }
        return res.datatableNoRecords();
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const exportServiceProviders = async (req, res) => {
    try {
        const { pipeline, sortBy, sortOrder } = buildServiceProviderListPipeline(req.query);
        const results = await ServiceProvider.aggregate([...pipeline, { $sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 } }]);

        const rows = results.map((row) => ({
            userId: row.userId || "",
            name: row.name || "",
            mobile: row.mobile || "",
            email: row.email || "",
            cityName: row.cityName || "",
            serviceCategoryName: row.serviceCategoryName || "",
            panCardNumber: row.panCardNumber || "",
            aadharNumber: row.aadharNumber || "",
            profileStatus: row.profileStatus || "",
            isVerified: row.isVerified ? "Yes" : "No",
            isFeatured: row.isFeatured ? "Yes" : "No",
            experienceYears: row.experienceYears ?? "",
            currentSubscription: row.currentSubscription || "",
            referredCount: row.referredCount ?? 0,
            registerFrom: row.registerFrom || "",
            createdAt: formatExportDateTime(row.createdAt)
        }));

        return sendExcelResponse(res, {
            filename: `service-providers-${moment().format("YYYY-MM-DD")}.xlsx`,
            sheetName: "Service Providers",
            columns: [
                { header: "User ID", key: "userId", width: 14 },
                { header: "Name", key: "name", width: 24 },
                { header: "Mobile", key: "mobile", width: 14 },
                { header: "Email", key: "email", width: 28 },
                { header: "City", key: "cityName", width: 16 },
                { header: "Service Category", key: "serviceCategoryName", width: 20 },
                { header: "PAN", key: "panCardNumber", width: 16 },
                { header: "Aadhar", key: "aadharNumber", width: 16 },
                { header: "Profile Status", key: "profileStatus", width: 14 },
                { header: "Verified", key: "isVerified", width: 10 },
                { header: "Featured", key: "isFeatured", width: 10 },
                { header: "Experience (Years)", key: "experienceYears", width: 16 },
                { header: "Subscription", key: "currentSubscription", width: 16 },
                { header: "Referred Count", key: "referredCount", width: 14 },
                { header: "Registered From", key: "registerFrom", width: 14 },
                { header: "Created At", key: "createdAt", width: 22 }
            ],
            rows
        });
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const getSingleServiceProvider = async (req, res) => {
    try {
        const doc = await ServiceProvider.findOne({ _id: ObjectId(req.params.id), deletedAt: null }).lean();
        if (!doc) return res.noRecords();

        doc.photos = await ServiceProviderPhoto.find({ providerId: doc._id }, '_id photoUrl displayOrder').sort({ displayOrder: 1 }).lean();
        const categoryRows = await ServiceCategory.find({ _id: { $in: getProviderCategoryIds(doc) } }, { name: 1 }).lean();
        const categoryNameById = new Map(categoryRows.map((row) => [String(row._id), row.name]));

        return res.success({
            _id: doc._id,
            userId: doc.userId,
            name: doc.name,
            mobile: doc.mobile,
            email: doc.email ?? "",
            cityId: doc.cityId,
            areaIds: Array.isArray(doc.areaIds) ? doc.areaIds : [],
            serviceCategoryId: doc.serviceCategoryId,
            serviceCategoryIds: getProviderCategoryIds(doc).map(String),
            serviceCategoryNames: getProviderCategoryIds(doc).map((id) => categoryNameById.get(String(id)) || "").filter(Boolean),
            panCardNumber: doc.panCardNumber ?? "",
            aadharNumber: doc.aadharNumber ?? "",
            image: doc.image,
            panCardDocument: doc.panCardDocument,
            aadharDocument: doc.aadharDocument,
            policeVerification: doc.policeVerification,
            experienceYears: doc.experienceYears ?? "",
            experienceDescription: doc.experienceDescription ?? "",
            profileStatus: doc.profileStatus,
            rejectionReason: doc.rejectionReason,
            approvedBy: doc.approvedBy,
            approvedAt: doc.approvedAt,
            isAvailable: doc.isAvailable,
            currentLatitude: doc.currentLatitude,
            currentLongitude: doc.currentLongitude,
            totalCompletedServices: doc.totalCompletedServices,
            totalRating: doc.totalRating,
            ratingCount: doc.ratingCount,
            isActive: doc.isActive,
            isFeatured: Boolean(doc.isFeatured),
            isVerified: doc.isVerified,
            lastLogin: doc.lastLogin,
            createdAt: doc.createdAt,
            photos: doc.photos,
        });
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};
