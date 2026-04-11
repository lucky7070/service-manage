import { ServiceCategory } from "../models/index.js";

export const SEED_CATEGORIES = [
    {
        slug: "plumber",
        name: "Plumber",
        nameHi: "प्लंबर",
        displayOrder: 10,
        image: "",
        description: "Leak repairs, installations & maintenance"
    },
    {
        slug: "electrician",
        name: "Electrician",
        nameHi: "इलेक्ट्रीशियन",
        displayOrder: 9,
        image: "",
        description: "Wiring, fixtures & electrical repairs"
    },
    {
        slug: "cleaning",
        name: "Cleaning",
        nameHi: "सफाई",
        displayOrder: 8,
        image: "",
        description: "Deep cleaning, sanitization & pest removal"
    },
    {
        slug: "air-conditioner-repair",
        name: "Air Conditioner Repair",
        nameHi: "एयर कंडीशनर मरम्मत",
        displayOrder: 7,
        image: "",
        description: "AC, refrigerator, washing machine & more"
    },
    {
        slug: "cleaning-pest-control",
        name: "Cleaning & Pest Control",
        nameHi: "सफाई & पीस्ट कंट्रोल",
        displayOrder: 6,
        image: "",
        description: "Furniture assembly, repairs & installations"
    },
    {
        slug: "appliance-repair",
        name: "Appliance Repair",
        nameHi: "एप्लियांस रिपेयर",
        displayOrder: 5,
        image: "",
        description: "AC, refrigerator, washing machine & more"
    },
    {
        slug: "painting",
        name: "Painting",
        nameHi: "पेंटिंग",
        displayOrder: 4,
        image: "",
        description: "Interior, exterior & texture painting"
    },
    {
        slug: "home-renovation",
        name: "Home Renovation",
        nameHi: "होम रेनोवेशन",
        displayOrder: 3,
        image: "",
        description: "Kitchen, bathroom & full home makeovers"
    },
    {
        slug: "packers-movers",
        name: "Packers & Movers",
        nameHi: "पैकर्स & मोवर्स",
        displayOrder: 2,
        image: "",
        description: "Relocation, packing & transportation"
    },
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
