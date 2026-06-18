import { ServiceCategory, ServiceType } from "../models/index.js";
import { SEED_CATEGORIES, seedServiceCategories } from "./serviceCategory.seeder.js";

const optionalString = (value) => {
    const text = typeof value === "string" ? value.trim() : "";
    return text || null;
};

const optionalNumber = (value) => {
    if (value === undefined || value === null || value === "") return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
};

/**
 * Seeds service types from `SEED_CATEGORIES[].services` (idempotent upserts per category + name).
 * @param {{ seedCategoriesFirst?: boolean }} [options]
 * @returns {Promise<{ count: number, upserted: number, modified: number }>}
 */
export async function seedServiceTypes({ seedCategoriesFirst = true } = {}) {
    if (seedCategoriesFirst) {
        await seedServiceCategories();
    }

    const slugs = SEED_CATEGORIES.map((row) => row.slug);
    const categories = await ServiceCategory.find({ slug: { $in: slugs }, deletedAt: null }).lean();
    const slugToId = new Map(categories.map((category) => [category.slug, category._id]));

    const ops = [];
    for (const category of SEED_CATEGORIES) {
        const categoryId = slugToId.get(category.slug);
        if (!categoryId) continue;

        for (const service of category.services ?? []) {
            const name = service.name?.trim();
            if (!name) continue;

            ops.push({
                updateOne: {
                    filter: { categoryId, name, deletedAt: null },
                    update: {
                        $set: {
                            categoryId,
                            name,
                            nameHi: optionalString(service.nameHi),
                            estimatedTimeMinutes: optionalNumber(service.estimatedTimeMinutes),
                            basePrice: optionalNumber(service.basePrice),
                            description: optionalString(service.description),
                            isActive: true,
                            deletedAt: null
                        }
                    },
                    upsert: true
                }
            });
        }
    }

    const writeResult = ops.length ? await ServiceType.bulkWrite(ops) : { upsertedCount: 0, modifiedCount: 0 };

    const count = await ServiceType.countDocuments({ deletedAt: null });
    return {
        count,
        upserted: writeResult.upsertedCount ?? 0,
        modified: writeResult.modifiedCount ?? 0
    };
}
