import cron from "node-cron";
import { syncRazorpayPendingPayments } from "../jobs/syncRazorpayPendingPayments.js";

export const startCronJobs = () => {

    // Razorpay pending payments sync
    cron.schedule("*/5 * * * *", syncRazorpayPendingPayments);
}