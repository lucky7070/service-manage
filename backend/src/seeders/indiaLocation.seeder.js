import { City, Country, State } from "../models/index.js";
import { slugify } from "../helpers/utils.js";
import INDIA_LOCATIONS from "../config/locations.js";

const ciRegex = (value) => new RegExp(`^${String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");

function buildUniqueCitySlug(baseName, stateName, usedSlugs) {
    const base = slugify(baseName);
    const stateSlug = slugify(stateName);
    if (!base) return "";

    let candidate = base;
    if (!usedSlugs.has(candidate)) {
        usedSlugs.add(candidate);
        return candidate;
    }

    candidate = `${base}-${stateSlug}`;
    if (!usedSlugs.has(candidate)) {
        usedSlugs.add(candidate);
        return candidate;
    }

    let i = 2;
    while (usedSlugs.has(`${candidate}-${i}`)) i += 1;
    candidate = `${candidate}-${i}`;
    usedSlugs.add(candidate);
    return candidate;
}

export async function seedIndiaLocations() {
    const countryName = INDIA_LOCATIONS.country.trim();

    await Country.updateOne({ name: ciRegex(countryName) }, { $set: { name: countryName, isActive: true, deletedAt: null } }, { upsert: true });

    const country = await Country.findOne({ name: ciRegex(countryName) }).lean();
    if (!country) throw new Error("Could not upsert/find India country row.");

    const stateNameToId = new Map();
    for (const row of INDIA_LOCATIONS.states) {
        const stateName = row.name.trim();
        await State.updateOne(
            { countryId: country._id, name: ciRegex(stateName) },
            { $set: { countryId: country._id, name: stateName, isActive: true, deletedAt: null } },
            { upsert: true }
        );
    }

    const allStates = await State.find({ countryId: country._id, deletedAt: null }).lean();
    for (const st of allStates) {
        stateNameToId.set(st.name.toLowerCase(), st._id);
    }

    const existingSlugs = await City.find({ deletedAt: null, slug: { $exists: true, $ne: null } }, { slug: 1 }).lean();
    const usedSlugs = new Set(existingSlugs.map((r) => String(r.slug || "").trim()).filter(Boolean));

    const cityOps = [];
    for (const stateRow of INDIA_LOCATIONS.states) {
        const stateId = stateNameToId.get(stateRow.name.toLowerCase());
        if (!stateId) continue;

        for (const cityNameRaw of stateRow.cities) {
            const cityName = cityNameRaw.trim();
            const slug = buildUniqueCitySlug(cityName, stateRow.name, usedSlugs);
            if (!cityName || !slug) continue;

            cityOps.push({
                updateOne: {
                    filter: { countryId: country._id, stateId, name: ciRegex(cityName) },
                    update: { $set: { countryId: country._id, stateId, name: cityName, slug, isActive: true, deletedAt: null } },
                    upsert: true
                }
            });
        }
    }

    if (cityOps.length) await City.bulkWrite(cityOps);

    const [statesCount, citiesCount] = await Promise.all([
        State.countDocuments({ countryId: country._id, deletedAt: null }),
        City.countDocuments({ countryId: country._id, deletedAt: null })
    ]);

    return { country: countryName, statesCount, citiesCount };
}
