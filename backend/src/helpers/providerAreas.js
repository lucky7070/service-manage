import { Area } from "../models/index.js";
import { ObjectId } from "./utils.js";

export const parseIdList = (raw) => {
    if (raw == null || raw === "") return [];
    let list = raw;
    if (typeof raw === "string") {
        try {
            const parsed = JSON.parse(raw);
            list = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
            list = raw.includes(",") ? raw.split(",") : [raw];
        }
    } else if (!Array.isArray(raw)) {
        list = [raw];
    }

    return [...new Set(list.map((id) => String(id).trim()).filter(Boolean))];
};

/**
 * Resolve and validate area ObjectIds for a city.
 * @param {unknown} rawAreaIds
 * @param {import("mongoose").Types.ObjectId|string} cityId
 * @returns {Promise<import("mongoose").Types.ObjectId[]>}
 */
export const resolveAreaIdsForCity = async (rawAreaIds, cityId) => {
    const ids = parseIdList(rawAreaIds).map(ObjectId).filter(Boolean);
    if (ids.length === 0) return [];

    const cityObjectId = ObjectId(cityId);
    if (!cityObjectId) throw new Error("City is required to assign areas.");

    const areas = await Area.find({ _id: { $in: ids }, cityId: cityObjectId, deletedAt: null, isActive: true }).select("_id").lean();
    if (areas.length !== ids.length) throw new Error("One or more areas are invalid for the selected city.");

    return ids;
};
