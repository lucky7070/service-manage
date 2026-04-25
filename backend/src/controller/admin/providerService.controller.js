import { ProviderService, ServiceProvider, ServiceType } from "../../models/index.js";
import { ObjectId } from "../../helpers/utils.js";

const parsePrice = (value) => {
    const n = Number(value);
    return Number.isFinite(n) && n >= 0 ? n : null;
};

const getProvider = async (id) => ServiceProvider.findOne({ _id: ObjectId(id), deletedAt: null }, "_id name mobile email cityId serviceCategoryId").lean();

export const getProviderServices = async (req, res) => {
    try {
        const provider = await getProvider(req.params.id);
        if (!provider) return res.noRecords();

        const rows = await ProviderService.aggregate([
            { $match: { providerId: provider._id } },
            { $lookup: { from: "servicetypes", localField: "serviceTypeId", foreignField: "_id", as: "serviceType" } },
            { $unwind: "$serviceType" },
            { $lookup: { from: "servicecategories", localField: "serviceType.categoryId", foreignField: "_id", as: "category" } },
            {
                $project: {
                    _id: 1,
                    providerId: 1,
                    serviceTypeId: 1,
                    serviceTypeName: "$serviceType.name",
                    categoryName: { $ifNull: [{ $first: "$category.name" }, ""] },
                    basePrice: { $ifNull: ["$serviceType.basePrice", null] },
                    estimatedTimeMinutes: { $ifNull: ["$serviceType.estimatedTimeMinutes", null] },
                    price: 1,
                    status: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
                    createdAt: 1
                }
            },
            { $sort: { categoryName: 1, serviceTypeName: 1 } }
        ]);

        return res.success({ provider, record: rows });
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const createProviderService = async (req, res) => {
    try {
        const provider = await getProvider(req.params.id);
        if (!provider) return res.noRecords();

        const serviceTypeId = ObjectId(req.body.serviceTypeId);
        if (!serviceTypeId) return res.someThingWentWrong({ message: "Service type is required." });

        const serviceType = await ServiceType.findOne({ _id: serviceTypeId, deletedAt: null });
        if (!serviceType) return res.someThingWentWrong({ message: "Service type not found." });

        if (String(serviceType.categoryId) !== String(provider.serviceCategoryId)) {
            return res.someThingWentWrong({ message: "Service type must belong to provider service category." });
        }

        const price = parsePrice(req.body.price);
        if (price === null) return res.someThingWentWrong({ message: "Valid price is required." });

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
        if (error.code === 11000) return res.someThingWentWrong({ message: "This service type is already added for the provider." });
        return res.someThingWentWrong(error);
    }
};

export const updateProviderService = async (req, res) => {
    try {
        const provider = await getProvider(req.params.id);
        if (!provider) return res.noRecords();

        const doc = await ProviderService.findOne({ _id: ObjectId(req.params.serviceId), providerId: provider._id });
        if (!doc) return res.noRecords();

        const serviceTypeId = ObjectId(req.body.serviceTypeId);
        if (!serviceTypeId) return res.someThingWentWrong({ message: "Service type is required." });

        const serviceType = await ServiceType.findOne({ _id: serviceTypeId, deletedAt: null });
        if (!serviceType) return res.someThingWentWrong({ message: "Service type not found." });
        if (String(serviceType.categoryId) !== String(provider.serviceCategoryId)) {
            return res.someThingWentWrong({ message: "Service type must belong to provider service category." });
        }

        const dup = await ProviderService.findOne({ _id: { $ne: doc._id }, providerId: provider._id, serviceTypeId });
        if (dup) throw new Error("This service type is already added for the provider.");

        const price = parsePrice(req.body.price);
        if (price === null) return res.someThingWentWrong({ message: "Valid price is required." });

        await doc.updateOne({ serviceTypeId, price, isActive: Number(req.body.status ?? 1) === 1 });
        return res.successUpdate(doc, "Provider service updated.");
    } catch (error) {
        if (error.code === 11000) return res.someThingWentWrong({ message: "This service type is already added for the provider." });
        return res.someThingWentWrong(error);
    }
};

export const deleteProviderService = async (req, res) => {
    try {
        const provider = await getProvider(req.params.id);
        if (!provider) return res.noRecords();

        const doc = await ProviderService.findOne({ _id: ObjectId(req.params.serviceId), providerId: provider._id });
        if (!doc) return res.noRecords();

        await doc.deleteOne();
        return res.successDelete(undefined, "Provider service removed.");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};
