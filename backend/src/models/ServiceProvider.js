import mongoose from "mongoose";
import { orderId } from "../helpers/utils.js";
import { Counter } from "./Counter.js";
import { SERVICE_PROVIDER_PROFILE_STATUSES } from "../config/constants.js";

const Schema = new mongoose.Schema(
    {
        userId: { type: String, unique: true, index: true, default: null },
        name: { type: String, required: true, default: null },
        mobile: { type: String, required: true, unique: true, index: true, default: null },
        email: { type: String, unique: true, sparse: true, index: true, default: null },
        image: { type: String, default: "/service-provider/default.png" },
        panCardNumber: { type: String, unique: true, sparse: true, default: null },
        aadharNumber: { type: String, unique: true, sparse: true, default: null },
        panCardDocument: { type: String, default: null },
        aadharDocument: { type: String, default: null },
        experienceYears: { type: Number, default: 0 },
        experienceDescription: { type: String, default: null },
        profileStatus: {
            type: String,
            enum: SERVICE_PROVIDER_PROFILE_STATUSES,
            default: "pending",
            index: true
        },
        rejectionReason: { type: String, default: null },
        approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },
        approvedAt: { type: Date, default: null },
        isAvailable: { type: Boolean, default: false },
        currentLatitude: { type: Number, default: null },
        currentLongitude: { type: Number, default: null },
        totalCompletedServices: { type: Number, default: 0 },
        totalRating: { type: Number, default: 0 },
        ratingCount: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
        isVerified: { type: Boolean, default: false },
        lastLogin: { type: Date, default: null },
        deletedAt: { type: Date, default: null }
    },
    { timestamps: true }
);

Schema.pre("save", async function onSave(next) {
    if (this.isNew && !this.userId) {
        const options = this.$session() ? { session: this.$session() } : {};
        const counter = await Counter.findByIdAndUpdate({ _id: "ServiceProvider" }, { $inc: { seq: 1 } }, { upsert: true, new: true, ...options });
        this.userId = orderId(counter.seq, "SP", 6);
    }
    
    next();
});

Schema.index({ currentLatitude: 1, currentLongitude: 1 });

export const ServiceProvider = mongoose.model("ServiceProvider", Schema);
