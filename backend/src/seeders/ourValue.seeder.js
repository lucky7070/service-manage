import { OurValue } from "../models/index.js";

export const SEED_OUR_VALUES = [
    {
        icon: "/our-values/trust.png",
        title: "Trust",
        description: "Every professional on Serva is verified so you can book with confidence.",
        displayOrder: 1
    },
    {
        icon: "/our-values/quality.png",
        title: "Quality",
        description: "We focus on skilled workmanship and customer satisfaction on every job.",
        displayOrder: 2
    },
    {
        icon: "/our-values/convenience.png",
        title: "Convenience",
        description: "Book, track, chat, and pay for home services in minutes from your phone.",
        displayOrder: 3
    },
    {
        icon: "/our-values/community.png",
        title: "Community",
        description: "We connect homeowners with local skilled professionals and fair opportunities.",
        displayOrder: 4
    }
];

/**
 * Seed about-page values (idempotent upserts by title).
 * @returns {Promise<{ count: number, upserted: number, modified: number }>}
 */
export async function seedOurValues() {
    const ops = SEED_OUR_VALUES.map((row) => ({
        updateOne: {
            filter: { title: row.title, deletedAt: null },
            update: {
                $set: {
                    icon: row.icon,
                    title: row.title,
                    description: row.description,
                    displayOrder: row.displayOrder ?? 0,
                    isActive: true,
                    deletedAt: null
                }
            },
            upsert: true
        }
    }));

    const writeResult = await OurValue.bulkWrite(ops);
    const count = await OurValue.countDocuments({ deletedAt: null });
    return {
        count,
        upserted: writeResult.upsertedCount ?? 0,
        modified: writeResult.modifiedCount ?? 0
    };
}
