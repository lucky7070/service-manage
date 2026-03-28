import { seedSettings } from "./settings.seeder.js";
import { seedServiceCategories } from "./serviceCategory.seeder.js";
import { seedServiceTypes } from "./serviceType.seeder.js";

/**
 * Registered seeders in execution order (dependencies first).
 * Add new entries here — same pattern as Laravel's `DatabaseSeeder::call()`.
 */
export const SEEDER_REGISTRY = [
    { name: "settings", description: "Application settings defaults", run: seedSettings },
    { name: "serviceCategories", description: "Service category trade groups", run: seedServiceCategories },
    { name: "serviceTypes", description: "Sample service types under categories", run: () => seedServiceTypes({ seedCategoriesFirst: true }) }
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
