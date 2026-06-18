import { Faq } from "../models/index.js";

export const SEED_FAQS = [
    {
        question: "How do I book a service on Serva?",
        answer: "Choose a service category, select the jobs you need, pick a verified provider, choose your address and preferred time, then confirm the booking from the app or website.",
        displayOrder: 1
    },
    {
        question: "Are service providers verified?",
        answer: "Yes. Providers go through verification before they can accept bookings on Serva. You can view provider profiles, ratings, and reviews before you book.",
        displayOrder: 2
    },
    {
        question: "How does pricing work?",
        answer: "Pricing depends on the service type and scope of work. You may receive a quote before the job starts. The final amount is confirmed after the provider assesses the requirement.",
        displayOrder: 3
    },
    {
        question: "Can I cancel or reschedule a booking?",
        answer: "Yes. You can cancel a booking from your bookings section before the job starts, subject to the booking status. For rescheduling, contact your provider through chat or call.",
        displayOrder: 4
    },
    {
        question: "How do I pay for a service?",
        answer: "Payment options depend on your booking and provider. Follow the payment instructions shown in the app after the service is agreed or completed.",
        displayOrder: 5
    },
    {
        question: "What if I am not satisfied with the service?",
        answer: "Please rate your experience and share feedback after the job is marked complete. Our support team reviews issues and helps resolve genuine service concerns.",
        displayOrder: 6
    },
    {
        question: "Can I chat with my service provider?",
        answer: "Yes. Once a booking is active, you can message your provider in real time from the booking details screen in the app.",
        displayOrder: 7
    },
    {
        question: "Which cities does Serva operate in?",
        answer: "Serva is expanding across India. Available cities are shown when you select your location during booking or in your profile addresses.",
        displayOrder: 8
    }
];

/**
 * Seed FAQs (idempotent upserts by question).
 * @returns {Promise<{ count: number, upserted: number, modified: number }>}
 */
export async function seedFaqs() {
    const ops = SEED_FAQS.map((row) => ({
        updateOne: {
            filter: { question: row.question, deletedAt: null },
            update: {
                $set: {
                    question: row.question,
                    answer: row.answer,
                    displayOrder: row.displayOrder ?? 0,
                    isActive: true,
                    deletedAt: null
                }
            },
            upsert: true
        }
    }));

    const writeResult = await Faq.bulkWrite(ops);
    const count = await Faq.countDocuments({ deletedAt: null });
    return {
        count,
        upserted: writeResult.upsertedCount ?? 0,
        modified: writeResult.modifiedCount ?? 0
    };
}
