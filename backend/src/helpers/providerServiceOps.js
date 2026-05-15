import { ProviderService, ServiceType } from "../models/index.js";
import { ObjectId, escapeRegex } from "./utils.js";

export const parseProviderServicePrice = (value) => {
    const n = Number(value);
    return Number.isFinite(n) && n >= 0 ? n : null;
};

export const providerServicesAggregation = (providerId) => [
    { $match: { providerId } },
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
];

export async function loadServiceTypeForProviderCategory(serviceTypeId, serviceCategoryId) {
    const typeId = ObjectId(serviceTypeId);
    if (!typeId) return { error: { status: 422, message: "Service type is required.", field: "serviceTypeId" } };

    const serviceType = await ServiceType.findOne({ _id: typeId, deletedAt: null, isActive: true }).lean();
    if (!serviceType) return { error: { status: 404, message: "Service type not found." } };

    if (!serviceCategoryId || String(serviceType.categoryId) !== String(serviceCategoryId)) {
        return { error: { status: 422, message: "Service type must belong to your service category.", field: "serviceTypeId" } };
    }

    return { serviceType };
}

export async function listActiveServiceTypesForCategory(serviceCategoryId, { query = "", limit = 20 } = {}) {
    const filter = { categoryId: ObjectId(serviceCategoryId), deletedAt: null, isActive: true };
    const q = String(query || "").trim();
    if (q) filter.name = { $regex: escapeRegex(q), $options: "i" };

    const cap = Number.isFinite(Number(limit)) ? Math.min(Math.max(Number(limit), 1), 50) : 20;
    return ServiceType.find(filter, "_id name basePrice estimatedTimeMinutes")
        .sort({ name: 1 })
        .limit(cap)
        .lean();
}

export async function aggregateProviderServices(providerId) {
    return ProviderService.aggregate(providerServicesAggregation(providerId));
}
