import mongoose from "mongoose";
import { generateRandomString, orderId } from "../helpers/utils.js";
import { Counter } from "./Counter.js";
import { Ledger } from "./Ledger.js";

const Schema = new mongoose.Schema(
    {
        userId: { type: String, unique: true, index: true, default: null },
        name: { type: String, required: true, trim: true, default: null },
        mobile: { type: String, required: true, unique: true, index: true, default: null },
        email: { type: String, sparse: true, index: true, lowercase: true, trim: true, default: null },
        image: { type: String, default: '/customers/default.png' },
        dateOfBirth: { type: Date, default: null },
        preferredLanguage: { type: String, enum: ["en", "hi"], default: "en" },
        balance: { type: Number, default: 0 },
        cityId: { type: mongoose.Schema.Types.ObjectId, ref: "City", default: null },
        averageRating: { type: Number, default: 0 },
        referralCode: { type: String, unique: true, sparse: true, index: true, default: null },
        referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", default: null },
        isActive: { type: Boolean, default: true },
        lastLogin: { type: Date, default: null },
        isVerified: { type: Boolean, default: false },
        deletedAt: { type: Date, default: null }
    },
    { timestamps: true }
);

Schema.pre("save", async function onSave(next) {
    if (this.isNew && !this.userId) {
        const options = this.$session() ? { session: this.$session() } : {};
        const counter = await Counter.findByIdAndUpdate({ _id: "Customer" }, { $inc: { seq: 1 } }, { upsert: true, new: true, ...options });
        this.userId = orderId(counter.seq, "C", 6);
        this.referralCode = generateRandomString(8).toUpperCase();
    }

    next();
});

Schema.method('addLedger', async function addLedgerBalance({
    amount = 0,
    paymentType = 1, // 1: Credit, 2: Debit
    paymentMethod = 5, // 1: Wallet Load, 2: Refer Bonus, 3: Service Charge, 4: Service Charge Refund, 5: Admin Credit / Debit
    requestId = null, // if paymentMethod is 1, 4, 5 then requestId is required
    particulars = "--",
    paidBy = null, // if paymentMethod is 5 then paidBy is required
    session = null
}) {

    const numericAmount = Number(amount);
    const numericPaymentType = Number(paymentType);
    const numericPaymentMethod = Number(paymentMethod);
    const currentBalance = Number(this.balance || 0);

    if (numericAmount === 0) return this;
    if (!Number.isFinite(numericAmount) || numericAmount < 0) throw new Error("Invalid amount.");
    if (![1, 2].includes(numericPaymentType)) throw new Error("Invalid payment type.");
    if (![1, 2, 3, 4, 5, 6].includes(numericPaymentMethod)) throw new Error("Invalid payment method.");
    if (paidBy && !mongoose.Types.ObjectId.isValid(paidBy)) throw new Error("Invalid paid by.");
    if (requestId && !mongoose.Types.ObjectId.isValid(requestId)) throw new Error("Invalid request ID.");
    if (numericPaymentMethod === 5 && !paidBy) throw new Error("Paid by is required for admin credit / debit.");

    const updatedBalance = numericPaymentType === 1 ? currentBalance + numericAmount : currentBalance - numericAmount;
    if (updatedBalance < 0) throw new Error("Debit amount cannot exceed current balance.");

    const activeSession = session || await mongoose.startSession();

    try {
        await activeSession.withTransaction(async () => {
            await Ledger.create([{
                customerId: this._id,
                amount: numericAmount,
                currentBalance,
                updatedBalance,
                paymentType: numericPaymentType,
                paymentMethod: numericPaymentMethod,
                requestId,
                particulars,
                paidBy
            }], { session: activeSession });

            this.balance = updatedBalance;
            await this.save({ session: activeSession });
        });
    } finally {
        if (!session) await activeSession.endSession();
    }

    return this;
});

export const Customer = mongoose.model("Customer", Schema);
