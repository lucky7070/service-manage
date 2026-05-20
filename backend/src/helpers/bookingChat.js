export const parseBookingChatPayload = (req) => {
    const message = String(req.body?.message || "").trim() || null;
    const attachmentUrl = req.file?.filename ? `/booking-chat/${req.file.filename}` : null;

    if (!message && !attachmentUrl) {
        return { error: "Message or image is required." };
    }

    return { message, attachmentUrl };
};
