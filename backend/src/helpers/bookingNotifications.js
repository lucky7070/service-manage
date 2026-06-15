import logger from "./logger.js";
import { formatBookingStatus } from "./emailTemplates.js";
import { notifyUser, pushToUser } from "../services/notificationPush.service.js";
import { getBookingPresence } from "../socket/index.js";

const ACTOR_LABELS = {
    customer: "The customer",
    provider: "The service provider",
    admin: "Admin"
};

const buildStatusMessage = (status, actorType, recipientType, bookingNumber) => {
    const ref = bookingNumber ? `booking ${bookingNumber}` : "your booking";
    const actor = ACTOR_LABELS[actorType] || "Someone";
    const label = formatBookingStatus(status);

    if (status === "price_pending") {
        return recipientType === "provider" ? `New ${ref} is awaiting your quote.` : `${actor} updated ${ref}. Status: ${label}.`;
    }

    if (status === "confirmed") return `${actor} confirmed ${ref}. Status: ${label}.`;
    if (status === "in_progress") return `${actor} started work on ${ref}. Status: ${label}.`;
    if (status === "completed") return `${ref} has been marked as ${label}.`;
    if (status === "cancelled") return `${actor} cancelled ${ref}.`;
    return `${actor} updated ${ref}. Status: ${label}.`;
};

/**
 * Notify the other party when booking status changes (not the actor who performed the action).
 * @param {{ booking: { _id, customerId, providerId, bookingNumber?, status }, previousStatus?: string|null, actorType: "customer"|"provider"|"admin" }} params
 */
export const notifyBookingStatusChange = async ({ booking, previousStatus = null, actorType }) => {
    try {
        if (!booking?._id) return;

        const newStatus = booking.status;
        if (previousStatus != null && previousStatus === newStatus) return;

        const bookingNumber = booking.bookingNumber || "";
        const title = bookingNumber ? `Booking ${bookingNumber}` : "Booking update";
        const data = {
            bookingId: String(booking._id),
            status: String(newStatus),
            bookingNumber: String(bookingNumber)
        };

        const tasks = [];

        if (actorType !== "customer" && booking.customerId) {
            tasks.push(
                notifyUser({
                    userId: booking.customerId,
                    userType: "customer",
                    title,
                    message: buildStatusMessage(newStatus, actorType, "customer", bookingNumber),
                    type: "booking",
                    relatedId: booking._id,
                    data
                })
            );
        }

        if (actorType !== "provider" && booking.providerId) {
            tasks.push(
                notifyUser({
                    userId: booking.providerId,
                    userType: "provider",
                    title,
                    message: buildStatusMessage(newStatus, actorType, "provider", bookingNumber),
                    type: previousStatus === null ? "new-booking" : "booking",
                    relatedId: booking._id,
                    data
                })
            );
        }

        await Promise.all(tasks);
    } catch (error) {
        logger.error(`Booking push notification failed: ${error?.message || error}`);
    }
};

const buildChatPreview = (message) => {
    if (message?.attachmentUrl) {
        const text = String(message?.message || "").trim();
        return text || "Sent an image";
    }

    return String(message?.message || "").trim() || "New message";
};

/**
 * Push-only chat alert when the other party is not in the booking chat room (no DB notification row).
 * @param {{ booking: { _id, customerId?, providerId?, bookingNumber? }, message: { message?, attachmentUrl? }, senderType: "customer"|"provider", senderName?: string }} params
 */
export const notifyBookingChatMessage = async ({ booking, message, senderType, senderName = "" }) => {
    try {
        if (!booking?._id || !message || !["customer", "provider"].includes(senderType)) return;

        const recipientType = senderType === "customer" ? "provider" : "customer";
        const presence = getBookingPresence(booking._id);
        const recipientOnline = recipientType === "customer" ? presence.customerOnline : presence.providerOnline;
        if (recipientOnline) return;

        const recipientId = recipientType === "customer" ? booking.customerId : booking.providerId;
        if (!recipientId) return;

        const name = String(senderName || "").trim();
        const bookingNumber = booking.bookingNumber || "";
        const title = name ? `Message from ${name}` : bookingNumber ? `Booking ${bookingNumber}` : "New chat message";
        const body = buildChatPreview(message);

        await pushToUser({
            userId: recipientId,
            userType: recipientType,
            title,
            message: body,
            type: "chat",
            relatedId: booking._id,
            data: {
                bookingId: String(booking._id),
                bookingNumber: String(bookingNumber),
                senderType: String(senderType),
                event: "chat_message"
            }
        });
    } catch (error) {
        logger.error(`Booking chat push notification failed: ${error?.message || error}`);
    }
};

/**
 * Provider sent or updated a quote (status may already be price_pending).
 */
export const notifyBookingQuoteSent = async ({ booking, actorType = "provider" }) => {
    try {
        if (!booking?._id || !booking.customerId || actorType === "customer") return;

        const bookingNumber = booking.bookingNumber || "";
        const price = Number(booking.quotedPrice);
        const priceText = Number.isFinite(price) && price > 0 ? ` Quote: ₹${price.toLocaleString("en-IN")}.` : "";

        await notifyUser({
            userId: booking.customerId,
            userType: "customer",
            title: bookingNumber ? `Quote for ${bookingNumber}` : "New service quote",
            message: `The service provider sent a quote for ${bookingNumber ? `booking ${bookingNumber}` : "your booking"}.${priceText}`,
            type: "booking",
            relatedId: booking._id,
            data: {
                bookingId: String(booking._id),
                status: String(booking.status || ""),
                bookingNumber: String(bookingNumber),
                event: "quote_sent"
            }
        });
    } catch (error) {
        logger.error(`Booking quote push notification failed: ${error?.message || error}`);
    }
};
