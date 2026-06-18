import { seedSettings } from "./settings.seeder.js";
import { seedServiceCategories } from "./serviceCategory.seeder.js";
import { seedServiceTypes } from "./serviceType.seeder.js";
import { seedDefaultAdmin } from "./defaultAdmin.seeder.js";
import { seedIndiaLocations } from "./indiaLocation.seeder.js";
import { seedOurMilestones } from "./ourMilestone.seeder.js";
import { seedOurValues } from "./ourValue.seeder.js";
import { seedFaqs } from "./faq.seeder.js";
import { seedPredefinedRatingTags } from "./predefinedRatingTag.seeder.js";
import { seedSubscriptions } from "./subscription.seeder.js";
import { seedCmsPages } from "./cmsPage.seeder.js";

/**
 * Registered seeders in execution order (dependencies first).
 * Add new entries here — same pattern as Laravel's `DatabaseSeeder::call()`.
 */
export const SEEDER_REGISTRY = [
    { name: "defaultAdmin", description: "Default Super Admin account", run: seedDefaultAdmin },
    { name: "settings", description: "Application settings defaults", run: seedSettings },
    { name: "location", description: "India country/state/city master data", run: seedIndiaLocations },
    { name: "serviceCategories", description: "Service category trade groups", run: seedServiceCategories },
    { name: "serviceTypes", description: "Sample service types under categories", run: () => seedServiceTypes({ seedCategoriesFirst: true }) },
    { name: "ourMilestones", description: "About page milestone timeline", run: seedOurMilestones },
    { name: "ourValues", description: "About page core values", run: seedOurValues },
    { name: "faqs", description: "Frequently asked questions", run: seedFaqs },
    { name: "predefinedRatingTags", description: "Booking feedback quick tags", run: seedPredefinedRatingTags },
    { name: "subscriptions", description: "Provider subscription plans (weekly, monthly, yearly)", run: seedSubscriptions },
    { name: "cmsPages", description: "CMS pages (privacy, terms, cookies, our story)", run: seedCmsPages }
];

export const SEEDER_NAMES = SEEDER_REGISTRY.map((s) => s.name);

/**
 * Run database seeders (Laravel-style orchestrator).
 *
 * @param {{ only?: string[] | null }} [options]
 *   - `only`: if set, run only these seeder names (e.g. `["serviceCategories"]`).
 * @returns {Promise<Record<string, unknown>>} result keyed by seeder name
 */
export async function runDatabaseSeeder({ only = null } = {}) {
    const allow = only ? new Set(only) : null;
    const results = {};

    for (const { name, run } of SEEDER_REGISTRY) {
        if (allow && !allow.has(name)) continue;
        results[name] = await run();
    }

    return results;
}
