import cron from "node-cron";
import { syncRazorpayPendingPayments } from "../jobs/syncRazorpayPendingPayments.js";
import { autoCancelStaleInProgressBookings } from "../jobs/autoCancelStaleInProgressBookings.js";

export const startCronJobs = () => {
    // Razorpay pending payments sync
    cron.schedule("*/5 * * * *", syncRazorpayPendingPayments);

    // Auto-cancel jobs left in progress too long (hourly)
    cron.schedule("15 * * * *", autoCancelStaleInProgressBookings);
};
