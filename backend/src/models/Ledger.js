import mongoose from "mongoose";
import { Counter } from "./Counter.js";
import { orderId } from "../helpers/utils.js";

const Schema = new mongoose.Schema({
    voucherNo: { type: String, trim: true, index: true, default: null },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true, index: true, default: null },
    amount: { type: Number, required: true, default: 0 },
    currentBalance: { type: Number, required: true, default: 0 },
    updatedBalance: { type: Number, required: true, default: 0 },
    paymentType: { type: Number, enum: [1, 2], required: true, index: true, default: null }, // 1: Credit, 2: Debit
    paymentMethod: { type: Number, enum: [1, 2, 3, 4, 5, 6], required: true, index: true, default: null }, // 1: Wallet Load, 2: Refer Bonus, 3: Service Charge, 4: Service Charge Refund, 5: Admin Credit / Debit, 6: Signup Reward
    requestId: { type: mongoose.Schema.Types.ObjectId, default: null }, // if paymentMethod is 1, 4, 5 then requestId is required
    particulars: { type: String, default: null },
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null }
}, { timestamps: true });

Schema.index({ customerId: 1, createdAt: -1 });

Schema.pre("save", async function onSave(next) {
    if (this.isNew && !this.voucherNo) {
        const options = this.$session() ? { session: this.$session() } : {};
        const counter = await Counter.findByIdAndUpdate({ _id: "Ledger" }, { $inc: { seq: 1 } }, { upsert: true, new: true, ...options });
        this.voucherNo = orderId(counter.seq, "TR", 8);
    }

    next();
});

export const Ledger = mongoose.model("Ledger", Schema);
