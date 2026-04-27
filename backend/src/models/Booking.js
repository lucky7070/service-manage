import mongoose from "mongoose";
import { Counter } from "./Counter.js";
import { orderId } from "../helpers/utils.js";

const Schema = new mongoose.Schema({
    bookingNumber: { type: String, required: true, unique: true, index: true, default: null },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true, index: true, default: null },
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceProvider", required: true, index: true, default: null },
    serviceCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceCategory", required: true, default: null },
    serviceTypeId: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: "ServiceType" }],
        required: true,
        default: [],
        validate: {
            validator: (value) => Array.isArray(value) && value.length > 0,
            message: "At least one service type is required."
        }
    },
    cityId: { type: mongoose.Schema.Types.ObjectId, ref: "City", required: true, default: null },
    status: {
        type: String,
        enum: ["pending", "price_pending", "price_agreed", "confirmed", "in_progress", "completed", "cancelled"],
        default: "pending",
        index: true
    },
    issueDescription: { type: String, default: null },
    bookingTime: { type: Date, default: Date.now },
    quotedPrice: { type: Number, default: null },
    agreedPrice: { type: Number, default: null },
    finalPrice: { type: Number, default: null },
    scheduledTime: { type: Date, default: null },
    startTime: { type: Date, default: null },
    completionTime: { type: Date, default: null },
    cancellationReason: { type: String, default: null },
    cancelledBy: { type: String, enum: ["customer", "provider", "admin"], default: null },
    addressId: { type: mongoose.Schema.Types.ObjectId, ref: "Address", required: true, default: null },
    location: {
        addressLine1: { type: String, default: null },
        addressLine2: { type: String, default: null },
        landmark: { type: String, default: null },
        city: { type: String, default: null },
        state: { type: String, default: null },
        pincode: { type: String, default: null },
        latitude: { type: Number, default: null },
        longitude: { type: Number, default: null },
        locationType: { type: String, enum: ["home", "office", "other"], default: "home" }
    }
}, { timestamps: true });

Schema.pre("save", async function onSave(next) {
    if (this.isNew && !this.userId) {
        const options = this.$session() ? { session: this.$session() } : {};
        const counter = await Counter.findByIdAndUpdate({ _id: "Booking" }, { $inc: { seq: 1 } }, { upsert: true, new: true, ...options });
        this.bookingNumber = orderId(counter.seq, "TXN", 7);
    }

    next();
});

export const Booking = mongoose.model("Booking", Schema);
