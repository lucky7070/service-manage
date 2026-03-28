import { ServiceCategory } from "../models/index.js";

/** Default trade groups (e.g. Plumber, Electrician). Service types are seeded separately. */
export const SEED_CATEGORIES = [
    { slug: "plumber", name: "Plumber", nameHi: "प्लंबर", displayOrder: 10 },
    { slug: "electrician", name: "Electrician", nameHi: "इलेक्ट्रीशियन", displayOrder: 20 },
    { slug: "cleaning", name: "Cleaning", nameHi: "सफाई", displayOrder: 30 },
    { slug: "air-conditioner-repair", name: "Air Conditioner Repair", nameHi: "एयर कंडीशनर मरम्मत", displayOrder: 40 }
];

/**
 * Seed Service Categories (idempotent upserts by slug).
 * @returns {Promise<{ count: number }>}
 */
export async function seedServiceCategories() {
    const ops = SEED_CATEGORIES.map((row) => ({
        updateOne: {
            filter: { slug: row.slug },
            update: {
                $set: {
                    slug: row.slug,
                    name: row.name,
                    nameHi: row.nameHi ?? null,
                    displayOrder: row.displayOrder,
                    isActive: true,
                    deletedAt: null
                }
            },
            upsert: true
        }
    }));

    await ServiceCategory.bulkWrite(ops);
    const count = await ServiceCategory.countDocuments({ deletedAt: null });
    return { count };
}
