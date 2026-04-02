import mongoose from "mongoose";

const Schema = new mongoose.Schema({
    phoneNumber: { type: String, required: true, index: true, default: null },
    otpCode: { type: String, required: true, default: null },
    purpose: { type: String, enum: ["login", "registration", "password_reset", "booking_completion"], required: true, default: null },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null },
    expiresAt: { type: Date, required: true, default: null },
    isUsed: { type: Boolean, default: false }
}, { timestamps: true });

export const OtpVerification = mongoose.model("OtpVerification", Schema);
