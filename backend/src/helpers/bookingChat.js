/** Statuses where customer and provider may send booking chat messages. */
export const BOOKING_CHAT_OPEN_STATUSES = ["price_pending", "confirmed", "in_progress"];

export const isBookingChatOpen = (status) => BOOKING_CHAT_OPEN_STATUSES.includes(String(status || ""));

export const bookingChatClosedMessage = (status) => {
    if (status === "completed") return "Chat is closed for completed bookings.";
    if (status === "cancelled") return "Chat is closed for cancelled bookings.";
    return "Chat is not available for this booking.";
};

export const parseBookingChatPayload = (req) => {
    const message = String(req.body?.message || "").trim() || null;
    const attachmentUrl = req.file?.filename ? `/booking-chat/${req.file.filename}` : null;

    if (!message && !attachmentUrl) {
        return { error: "Message or image is required." };
    }

    return { message, attachmentUrl };
};
