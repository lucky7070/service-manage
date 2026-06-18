import { Subscription } from "../models/index.js";

const PROVIDER_PLAN_FEATURES = [
    {
        name: "Accept bookings",
        description: "Receive and manage customer booking requests on the platform.",
        included: true
    },
    {
        name: "Provider profile",
        description: "Showcase your services, experience, and work photos to customers.",
        included: true
    },
    {
        name: "Booking chat",
        description: "Chat with customers in real time for active bookings.",
        included: true
    },
    {
        name: "Dashboard & earnings",
        description: "Track bookings, job status, and performance from your provider dashboard.",
        included: true
    }
];

/** Provider subscription plans (upsert by unique `name`). */
export const SEED_SUBSCRIPTIONS = [
    {
        name: "Weekly Plan",
        description: "Short-term access for service providers — ideal for trying Serva or covering a busy week.",
        price: 99,
        interval: "day",
        intervalCount: 7,
        image: "/subscriptions/default.png",
        features: PROVIDER_PLAN_FEATURES
    },
    {
        name: "Monthly Plan",
        description: "Standard monthly plan for active service providers on Serva.",
        price: 999,
        interval: "month",
        intervalCount: 1,
        image: "/subscriptions/default.png",
        features: PROVIDER_PLAN_FEATURES
    },
    {
        name: "Yearly Plan",
        description: "Best value annual plan for committed service providers on Serva.",
        price: 5999,
        interval: "year",
        intervalCount: 1,
        image: "/subscriptions/default.png",
        features: [
            ...PROVIDER_PLAN_FEATURES,
            {
                name: "Priority listing",
                description: "Improved visibility in customer search results.",
                included: true
            }
        ]
    }
];

/**
 * Seed provider subscription plans (idempotent upserts by name).
 * Weekly billing uses interval `day` with intervalCount `7` (model has no `week` enum).
 * @returns {Promise<{ count: number, created: number, updated: number }>}
 */
export async function seedSubscriptions() {
    let created = 0;
    let updated = 0;

    for (const row of SEED_SUBSCRIPTIONS) {
        const existing = await Subscription.findOne({ name: row.name, deletedAt: null });
        const payload = {
            description: row.description,
            price: row.price,
            interval: row.interval,
            intervalCount: row.intervalCount,
            image: row.image,
            features: row.features,
            isActive: true,
            deletedAt: null
        };

        if (existing) {
            await Subscription.updateOne({ _id: existing._id }, { $set: payload });
            updated += 1;
            continue;
        }

        await Subscription.create({
            name: row.name,
            slug: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            ...payload
        });
        created += 1;
    }

    const count = await Subscription.countDocuments({ deletedAt: null });
    return { count, created, updated };
}
