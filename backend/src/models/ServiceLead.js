import mongoose from "mongoose";
import { Counter } from "./Counter.js";
import { orderId } from "../helpers/utils.js";

const Schema = new mongoose.Schema({
    leadNumber: { type: String, unique: true, index: true, default: null },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true, index: true },
    cityId: { type: mongoose.Schema.Types.ObjectId, ref: "City", required: true, index: true },
    serviceCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceCategory", required: true, index: true },
    serviceTypeId: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: "ServiceType" }],
        required: true,
        default: [],
        validate: {
            validator: (value) => Array.isArray(value) && value.length > 0,
            message: "At least one service type is required."
        }
    },
    addressId: { type: mongoose.Schema.Types.ObjectId, ref: "Address", required: true },
    scheduledTime: { type: Date, required: true },
    issueDescription: { type: String, default: null },
    status: {
        type: String,
        enum: ["open", "assigned", "cancelled"],
        default: "open",
        index: true
    },
    assignedProviderId: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceProvider", default: null },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null },
    assignedAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null }
}, { timestamps: true });

Schema.pre("save", async function onSave(next) {
    if (this.isNew && !this.leadNumber) {
        const options = this.$session() ? { session: this.$session() } : {};
        const counter = await Counter.findByIdAndUpdate({ _id: "ServiceLead" }, { $inc: { seq: 1 } }, { upsert: true, new: true, ...options });
        this.leadNumber = orderId(counter.seq, "LD", 7);
    }
    next();
});

export const ServiceLead = mongoose.model("ServiceLead", Schema);
