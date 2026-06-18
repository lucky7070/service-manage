import { OurMilestone } from "../models/index.js";

export const SEED_OUR_MILESTONES = [
    {
        year: "2024",
        event: "Serva Services was founded to make booking trusted home professionals simple and reliable.",
        displayOrder: 1
    },
    {
        year: "2025",
        event: "Launched verified service providers across major cities with real-time booking and chat support.",
        displayOrder: 2
    },
    {
        year: "2025",
        event: "Crossed 10,000 successful service bookings on the platform.",
        displayOrder: 3
    },
    {
        year: "2026",
        event: "Expanded to 100+ service types covering repair, maintenance, cleaning, and more.",
        displayOrder: 4
    }
];

/**
 * Seed about-page milestones (idempotent upserts by year + event).
 * @returns {Promise<{ count: number, upserted: number, modified: number }>}
 */
export async function seedOurMilestones() {
    const ops = SEED_OUR_MILESTONES.map((row) => ({
        updateOne: {
            filter: { year: row.year, event: row.event, deletedAt: null },
            update: {
                $set: {
                    year: row.year,
                    event: row.event,
                    displayOrder: row.displayOrder ?? 0,
                    isActive: true,
                    deletedAt: null
                }
            },
            upsert: true
        }
    }));

    const writeResult = await OurMilestone.bulkWrite(ops);
    const count = await OurMilestone.countDocuments({ deletedAt: null });
    return {
        count,
        upserted: writeResult.upsertedCount ?? 0,
        modified: writeResult.modifiedCount ?? 0
    };
}
