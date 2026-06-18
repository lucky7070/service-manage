import { PredefinedRatingTag } from "../models/index.js";

/** Quick feedback tags for customer ↔ provider ratings after completed bookings. */
export const SEED_PREDEFINED_RATING_TAGS = [
    // Customer rates provider
    { tagFor: "provider", tagName: "Professional", tagType: "positive" },
    { tagFor: "provider", tagName: "Punctual", tagType: "positive" },
    { tagFor: "provider", tagName: "Skilled work", tagType: "positive" },
    { tagFor: "provider", tagName: "Good communication", tagType: "positive" },
    { tagFor: "provider", tagName: "Clean work area", tagType: "positive" },
    { tagFor: "provider", tagName: "Fair pricing", tagType: "positive" },
    { tagFor: "provider", tagName: "Late arrival", tagType: "negative" },
    { tagFor: "provider", tagName: "Poor quality", tagType: "negative" },
    { tagFor: "provider", tagName: "Unprofessional behaviour", tagType: "negative" },
    { tagFor: "provider", tagName: "Overcharged", tagType: "negative" },
    { tagFor: "provider", tagName: "Job incomplete", tagType: "negative" },
    // Provider rates customer
    { tagFor: "customer", tagName: "Punctual", tagType: "positive" },
    { tagFor: "customer", tagName: "Clear communication", tagType: "positive" },
    { tagFor: "customer", tagName: "Respectful", tagType: "positive" },
    { tagFor: "customer", tagName: "Easy to work with", tagType: "positive" },
    { tagFor: "customer", tagName: "Prompt payment", tagType: "positive" },
    { tagFor: "customer", tagName: "Unavailable at scheduled time", tagType: "negative" },
    { tagFor: "customer", tagName: "Unclear requirements", tagType: "negative" },
    { tagFor: "customer", tagName: "Rude behaviour", tagType: "negative" },
    { tagFor: "customer", tagName: "Payment issues", tagType: "negative" }
];

/**
 * Seed predefined rating tags (idempotent upserts by tagFor + tagName).
 * @returns {Promise<{ count: number, upserted: number, modified: number }>}
 */
export async function seedPredefinedRatingTags() {
    const ops = SEED_PREDEFINED_RATING_TAGS.map((row) => ({
        updateOne: {
            filter: { tagFor: row.tagFor, tagName: row.tagName, deletedAt: null },
            update: {
                $set: {
                    tagFor: row.tagFor,
                    tagName: row.tagName,
                    tagType: row.tagType,
                    isActive: true,
                    deletedAt: null
                }
            },
            upsert: true
        }
    }));

    const writeResult = await PredefinedRatingTag.bulkWrite(ops);
    const count = await PredefinedRatingTag.countDocuments({ deletedAt: null });
    return {
        count,
        upserted: writeResult.upsertedCount ?? 0,
        modified: writeResult.modifiedCount ?? 0
    };
}
