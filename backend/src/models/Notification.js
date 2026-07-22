import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true, default: null },
    userType: { type: String, enum: ["customer", "provider", "admin"], required: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: { type: String, enum: ["booking", "chat", "system", "promotion", "new-booking"], required: true },
    relatedId: { type: mongoose.Schema.Types.ObjectId, default: null },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date, default: null }
}, { timestamps: true });

export const Notification = mongoose.model("Notification", notificationSchema);
