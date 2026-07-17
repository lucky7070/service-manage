import moment from "moment";
import logger from "../helpers/logger.js";
import { Booking } from "../models/index.js";
import { bookingStatusMail } from "../libraries/mail.js";
import { notifyBookingStatusChange } from "../helpers/bookingNotifications.js";

const DEFAULT_STALE_HOURS = 12;
const BATCH_SIZE = 50;
const CANCELLATION_REASON = "Automatically cancelled by system: job was left in progress too long without being completed.";

/**
 * Auto-cancel bookings stuck in `in_progress` longer than DEFAULT_STALE_HOURS.
 * Notifies both customer and provider; clears startTime.
 */
export const autoCancelStaleInProgressBookings = async () => {
    try {
        const cutoff = moment().subtract(DEFAULT_STALE_HOURS, "hours").toDate();
        const staleBookings = await Booking.find({ status: "in_progress", deletedAt: null, startTime: { $ne: null, $lte: cutoff } })
            .sort({ startTime: 1 })
            .limit(BATCH_SIZE)
            .select("_id bookingNumber")
            .lean();

        if (!staleBookings.length) {
            logger.info(`[cron] autoCancelStaleInProgressBookings: none older than ${DEFAULT_STALE_HOURS}h`);
            return { cancelled: 0, hours: DEFAULT_STALE_HOURS };
        }

        let cancelled = 0;
        for (const row of staleBookings) {
            const booking = await Booking.findOneAndUpdate(
                { _id: row._id, status: "in_progress", deletedAt: null, startTime: { $ne: null, $lte: cutoff } },
                { $set: { status: "cancelled", cancelledBy: "system", cancellationReason: CANCELLATION_REASON, startTime: null } },
                { new: true }
            );

            if (!booking) continue;

            await bookingStatusMail(booking._id);
            await notifyBookingStatusChange({ booking, previousStatus: "in_progress", actorType: "system" });
            cancelled += 1;
            logger.info(`[cron] Auto-cancelled stale booking ${booking.bookingNumber || booking._id}`);
        }

        logger.info(`[cron] autoCancelStaleInProgressBookings: cancelled ${cancelled}/${staleBookings.length} (threshold ${DEFAULT_STALE_HOURS}h)`);
        return { cancelled, hours: DEFAULT_STALE_HOURS };
    } catch (error) {
        logger.error(`[cron] autoCancelStaleInProgressBookings failed: ${error?.message || error}`);
        throw error;
    }
};
