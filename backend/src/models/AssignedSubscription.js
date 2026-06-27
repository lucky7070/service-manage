import mongoose from "mongoose";
import { Counter } from "./Counter.js";
import { orderId } from "../helpers/utils.js";

const Schema = new mongoose.Schema({
    voucherNo: { type: String, trim: true, index: true, default: null },
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceProvider", required: true, index: true },
    subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription", required: true, index: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ["active", "inactive"], default: "active", index: true },
    amount: { type: Number, required: true, default: 0 },
    taxAmount: { type: Number, required: true, default: 0 },
    taxPercentage: { type: Number, required: true, default: 0 },
    paymentAmount: { type: Number, required: true, default: 0 },
    paymentGatewayOrderId: { type: String, trim: true, index: true, default: null },
    paymentGatewayTransactionId: { type: String, trim: true, index: true, default: null },
    paymentGatewayTransactionStatus: { type: String, enum: ["success", "failed", "pending"], default: "pending", index: true },
    paymentGatewayTransactionMessage: { type: String, default: null },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null }
}, { timestamps: true });

Schema.index({ providerId: 1, createdAt: -1 });
Schema.index({ providerId: 1, status: 1 });

Schema.pre("save", async function onSave(next) {
    if (this.isNew && !this.voucherNo) {
        const options = this.$session() ? { session: this.$session() } : {};
        const counter = await Counter.findByIdAndUpdate({ _id: "AssignedSubscription" }, { $inc: { seq: 1 } }, { upsert: true, new: true, ...options });
        this.voucherNo = orderId(counter.seq, "PLAN", 8);
    }

    next();
});

export const AssignedSubscription = mongoose.model("AssignedSubscription", Schema);
