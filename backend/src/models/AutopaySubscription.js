import mongoose from "mongoose";

const Schema = new mongoose.Schema({
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceProvider", required: true, index: true },
    subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription", required: true, index: true },
    razorpayPlanId: { type: String, trim: true, index: true, default: null },
    razorpaySubscriptionId: { type: String, trim: true, unique: true, sparse: true, index: true, default: null },
    autoRenew: { type: Boolean, default: true, index: true },
    mandateStatus: { type: String, enum: ["pending", "active", "cancelled", "halted"], default: "pending", index: true },
    currentStart: { type: Date, default: null },
    currentEnd: { type: Date, default: null },
    paidCount: { type: Number, default: 0 },
    cancelledAt: { type: Date, default: null },
}, { timestamps: true });

Schema.index({ providerId: 1, mandateStatus: 1 });
Schema.index({ providerId: 1, autoRenew: 1 });

export const AutopaySubscription = mongoose.model("AutopaySubscription", Schema);
