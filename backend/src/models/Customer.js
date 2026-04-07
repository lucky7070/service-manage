import mongoose from "mongoose";
import { orderId } from "../helpers/utils.js";
import { Counter } from "./Counter.js";

const Schema = new mongoose.Schema(
    {
        userId: { type: String, unique: true, index: true, default: null },
        name: { type: String, required: true, trim: true, default: null },
        mobile: { type: String, required: true, unique: true, index: true, default: null },
        email: { type: String, sparse: true, index: true, lowercase: true, trim: true, default: null },
        image: { type: String, default: '/customers/default.png' },
        dateOfBirth: { type: Date, default: null },
        preferredLanguage: { type: String, enum: ["en", "hi"], default: "en" },
        cityId: { type: mongoose.Schema.Types.ObjectId, ref: "City", default: null },
        averageRating: { type: Number, default: 0 },
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
    }

    next();
});

export const Customer = mongoose.model("Customer", Schema);
