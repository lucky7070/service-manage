import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true, default: null },
    userType: { type: String, enum: ["customer", "provider", "admin"], required: true, default: null },
    title: { type: String, required: true, default: null },
    message: { type: String, required: true, default: null },
    type: { type: String, enum: ["booking", "chat", "system", "promotion"], required: true, default: null },
    relatedId: { type: mongoose.Schema.Types.ObjectId, default: null },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date, default: null }
}, { timestamps: true });

export const Notification = mongoose.model("Notification", notificationSchema);
