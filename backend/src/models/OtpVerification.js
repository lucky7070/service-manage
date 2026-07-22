import mongoose from "mongoose";

const Schema = new mongoose.Schema({
    phoneNumber: { type: String, required: true, index: true, default: null },
    otpCode: { type: String, required: true, trim: true },
    purpose: { type: String, enum: ["login", "register", "password_reset", "booking_completion"], required: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null },
    expiresAt: { type: Date, required: true }
}, { timestamps: true });

export const OtpVerification = mongoose.model("OtpVerification", Schema);
