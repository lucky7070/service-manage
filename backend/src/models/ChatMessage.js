import mongoose from "mongoose";

const Schema = new mongoose.Schema({
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true, index: true, default: null },
    senderId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true, default: null },
    senderType: { type: String, enum: ["customer", "provider"], required: true, default: null },
    message: { type: String, default: null },
    attachmentUrl: { type: String, default: null },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date, default: null }
}, { timestamps: true });

export const ChatMessage = mongoose.model("ChatMessage", Schema);
