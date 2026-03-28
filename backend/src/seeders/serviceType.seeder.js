import { ServiceCategory, ServiceType } from "../models/index.js";
import { escapeRegex } from "../helpers/utils.js";
import { seedServiceCategories } from "./serviceCategory.seeder.js";

/** Concrete jobs under a category (e.g. Tap repair under Plumber). */
export const SEED_SERVICE_TYPES = [
    { categorySlug: "plumber", name: "Tap Repair" },
    { categorySlug: "plumber", name: "Waste pipe leakage" },
    { categorySlug: "plumber", name: "Jet spray (installation / Repair)" },
    { categorySlug: "plumber", name: "Bathroom tile gap filling" },
    { categorySlug: "air-conditioner-repair", name: "Split AC Repair" },
    { categorySlug: "air-conditioner-repair", name: "Deep clean AC service (window)" },
    { categorySlug: "air-conditioner-repair", name: "Deep clean AC service (split)" },
    { categorySlug: "air-conditioner-repair", name: "Ac Cooling problem" }
];

/**
 * Ensures seed categories exist, then creates missing service types (idempotent per category + name).
 * @param {{ seedCategoriesFirst?: boolean }} [options]
 * @returns {Promise<{ count: number, created: number, skipped: number }>}
 */
export async function seedServiceTypes({ seedCategoriesFirst = true } = {}) {
    if (seedCategoriesFirst) {
        await seedServiceCategories();
    }

    const slugs = [...new Set(SEED_SERVICE_TYPES.map((r) => r.categorySlug))];
    const categories = await ServiceCategory.find({ slug: { $in: slugs }, deletedAt: null }).lean();
    const slugToId = new Map(categories.map((c) => [c.slug, c._id]));

    let created = 0;
    let skipped = 0;
    for (const row of SEED_SERVICE_TYPES) {
        const categoryId = slugToId.get(row.categorySlug);
        if (!categoryId) continue;

        const normalizedName = row.name.trim();
        const exists = await ServiceType.findOne({
            categoryId,
            name: { $regex: `^${escapeRegex(normalizedName)}$`, $options: "i" },
            deletedAt: null
        });
        if (exists) {
            skipped += 1;
            continue;
        }
        await ServiceType.create({
            categoryId,
            name: normalizedName,
            nameHi: row.nameHi?.trim() || null,
            isActive: true
        });
        created += 1;
    }

    const count = await ServiceType.countDocuments({ deletedAt: null });
    return { count, created, skipped };
}
