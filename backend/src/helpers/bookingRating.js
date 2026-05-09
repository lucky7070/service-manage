import mongoose from "mongoose";
import { Customer, PredefinedRatingTag, Rating, ServiceProvider } from "../models/index.js";

/**
 * @param {unknown} rawQuickTags
 * @param {"customer" | "provider"} expectedTagFor - tags shown when rating an entity of that type (rate provider → tagFor "provider")
 * @returns {Promise<mongoose.Types.ObjectId[]>}
 */
export async function resolveQuickTagIds(rawQuickTags, expectedTagFor) {
    if (rawQuickTags == null) return [];
    if (!Array.isArray(rawQuickTags)) {
        const err = new Error("quickTags must be an array.");
        err.statusCode = 422;
        throw err;
    }

    const unique = [...new Set(rawQuickTags.map((x) => String(x)).filter(Boolean))];
    if (unique.length === 0) return [];
    if (unique.length > 10) {
        const err = new Error("At most 10 quick tags are allowed.");
        err.statusCode = 422;
        throw err;
    }

    for (const id of unique) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            const err = new Error("Invalid quick tag id.");
            err.statusCode = 422;
            throw err;
        }
    }

    const objectIds = unique.map((id) => new mongoose.Types.ObjectId(id));
    const found = await PredefinedRatingTag.find({ _id: { $in: objectIds }, tagFor: expectedTagFor, isActive: true, deletedAt: null }).select("_id").lean();
    if (found.length !== unique.length) {
        const err = new Error("One or more quick tags are invalid or not allowed for this feedback.");
        err.statusCode = 422;
        throw err;
    }
    return found.map((f) => f._id);
}

export async function incrementProviderRatingTotals(providerId, starRating) {
    await ServiceProvider.updateOne(
        { _id: providerId },
        { $inc: { totalRating: Number(starRating), ratingCount: 1 } }
    );
}

export async function refreshCustomerAverageRating(customerId) {
    const id = new mongoose.Types.ObjectId(String(customerId));
    const [row] = await Rating.aggregate([
        { $match: { ratedTo: id, ratingType: "provider_to_customer" } },
        { $group: { _id: null, sum: { $sum: "$starRating" }, n: { $sum: 1 } } },
    ]);
    
    const avg = row && row.n > 0 ? Math.round((row.sum / row.n) * 10) / 10 : 0;
    await Customer.updateOne({ _id: id }, { $set: { averageRating: avg } });
}
