/**
 *
 * Usage:
 *   npm run cron    # sync razorpay pending payments
 *
 */
import "dotenv/config";
import { syncRazorpayPendingPayments } from "../src/jobs/syncRazorpayPendingPayments.js";
import { connectDb } from "../src/libraries/db.js";
import mongoose from "mongoose";

try {

    await connectDb("cron");
    await syncRazorpayPendingPayments();

    console.log("[cron] Done.");
} catch (err) {
    console.error("[cron] Failed:", err);
    process.exit(1);
} finally {
    await mongoose.connection.close();
    console.log("[cron] MongoDB disconnected.");
}