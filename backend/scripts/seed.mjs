#!/usr/bin/env node
/**
 * CLI database seeder (same logic as Laravel `php artisan db:seed`).
 *
 * Usage:
 *   npm run seed                    # all registered seeders
 *   npm run seed -- serviceCategories
 *   npm run seed -- serviceCategories serviceTypes
 *   npm run seed -- --only=settings
 *
 * Production (default): refuses to run unless ALLOW_DB_SEED=true
 */
import "dotenv/config";
import { connectDb } from "../src/libraries/db.js";
import mongoose from "mongoose";
import { runDatabaseSeeder, SEEDER_NAMES } from "../src/seeders/databaseSeeder.js";

const args = process.argv.slice(2);
let only = null;

const positional = [];
for (const a of args) {
    if (a.startsWith("--only=")) {
        only = a.slice("--only=".length).split(",").map((s) => s.trim()).filter(Boolean);
    } else if (!a.startsWith("--")) {
        positional.push(a);
    }
}
if (positional.length) only = positional;

if (only?.length) {
    const unknown = only.filter((n) => !SEEDER_NAMES.includes(n));
    if (unknown.length) {
        console.error(`Unknown seeder(s): ${unknown.join(", ")}`);
        console.error(`Valid: ${SEEDER_NAMES.join(", ")}`);
        process.exit(1);
    }
}

if (process.env.NODE_ENV === "production" && process.env.ALLOW_DB_SEED !== "true") {
    console.error(
        "[seed] Refusing to run in NODE_ENV=production. Set ALLOW_DB_SEED=true to run (e.g. staging deploy or one-off migration)."
    );
    process.exit(1);
}

try {
    await connectDb();
    console.log("[seed] Running seeders...", only?.length ? `only: ${only.join(", ")}` : "(all)");
    const results = await runDatabaseSeeder({ only: only?.length ? only : null });
    console.log("[seed] Done.");
    console.log(JSON.stringify(results, null, 2));
} catch (err) {
    console.error("[seed] Failed:", err);
    process.exit(1);
} finally {
    await mongoose.connection.close();
    console.log("[seed] MongoDB disconnected.");
}
