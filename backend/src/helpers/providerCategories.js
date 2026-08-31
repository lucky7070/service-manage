import { ServiceCategory } from "../models/index.js";
import { ObjectId } from "./utils.js";
import { parseIdList } from "./providerAreas.js";

export const getProviderCategoryIds = (provider) => {
    const fromArray = Array.isArray(provider?.serviceCategoryIds)
        ? provider.serviceCategoryIds.map((id) => ObjectId(id)).filter(Boolean)
        : [];
    if (fromArray.length > 0) return fromArray;

    const primary = ObjectId(provider?.serviceCategoryId);
    return primary ? [primary] : [];
};

export const syncPrimaryCategoryInList = (primaryId, categoryIds = []) => {
    const primary = ObjectId(primaryId);
    if (!primary) return categoryIds.map(ObjectId).filter(Boolean);

    const normalized = [...new Set(categoryIds.map((id) => String(ObjectId(id))).filter(Boolean))];
    const primaryStr = String(primary);
    const withoutPrimary = normalized.filter((id) => id !== primaryStr);
    return [primary, ...withoutPrimary.map(ObjectId).filter(Boolean)];
};

export const providerCategoryMatchFilter = (categoryId) => {
    const categoryObjectId = ObjectId(categoryId);
    if (!categoryObjectId) return {};

    return {
        $or: [
            { serviceCategoryIds: categoryObjectId },
            {
                serviceCategoryId: categoryObjectId,
                $or: [{ serviceCategoryIds: { $exists: false } }, { serviceCategoryIds: { $size: 0 } }]
            }
        ]
    };
};

export const applyProviderCategoryFilter = (filter, categoryId) => {
    const categoryFilter = providerCategoryMatchFilter(categoryId);
    if (!categoryFilter.$or) return filter;

    if (filter.$or) {
        filter.$and = [...(filter.$and || []), { $or: filter.$or }, categoryFilter];
        delete filter.$or;
    } else {
        Object.assign(filter, categoryFilter);
    }

    return filter;
};

export const providerServiceTypeCategoryMatch = (categoryIds) => {
    const ids = (Array.isArray(categoryIds) ? categoryIds : [categoryIds]).map(ObjectId).filter(Boolean);
    if (ids.length === 0) return { "serviceType.categoryId": null };

    return { "serviceType.categoryId": { $in: ids } };
};

/**
 * Resolve and validate service category ObjectIds.
 * @param {unknown} rawCategoryIds
 * @returns {Promise<import("mongoose").Types.ObjectId[]>}
 */
export const resolveServiceCategoryIds = async (rawCategoryIds) => {
    const ids = parseIdList(rawCategoryIds).map(ObjectId).filter(Boolean);
    if (ids.length === 0) throw new Error("At least one service category is required.");

    const categories = await ServiceCategory.find({ _id: { $in: ids }, deletedAt: null, isActive: true }).select("_id").lean();
    if (categories.length !== ids.length) throw new Error("One or more service categories are invalid.");

    return ids;
};
