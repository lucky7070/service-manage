import mongoose from "mongoose";
import { getter, orderId, slugify, generateOtp, setter } from "../helpers/utils.js";
import { Counter } from "./Counter.js";
import { config } from "../config/index.js";

const Schema = new mongoose.Schema(
    {
        subscriptionId: { type: String, unique: true, index: true, default: null },
        razorpayPlanId: { type: String, index: true, required: true },
        name: { type: String, required: true, trim: true, unique: true },
        slug: { type: String, required: true, trim: true, unique: true },
        image: { type: String, default: '/subscriptions/default.png' },
        description: { type: String, required: true, trim: true },
        price: { type: Number, required: true, min: 0, set: setter, get: getter },
        interval: { type: String, enum: ['day', 'month', 'year'], required: true },
        intervalCount: { type: Number, default: 1 },
        features: [{
            name: { type: String, required: true, trim: true },
            description: { type: String, required: true, trim: true },
            included: { type: Boolean, default: true },
        }],
        isActive: { type: Boolean, default: true },
        deletedAt: { type: Date, default: null }
    },
    { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

Schema.pre("save", async function onSave(next) {
    if (this.isNew && !this.subscriptionId) {
        const options = this.$session() ? { session: this.$session() } : {};
        const counter = await Counter.findByIdAndUpdate({ _id: "Subscription" }, { $inc: { seq: 1 } }, { upsert: true, new: true, ...options });
        this.subscriptionId = orderId(counter.seq, "S", 6);
        this.slug = slugify(this.name) + "-" + generateOtp(4);
    }

    next();
});

Schema.virtual("taxPercentage").get(() => config.taxPercentage || 0);
Schema.virtual("priceWithTax").get(function () { return this.price + (this.price * (this.taxPercentage || 0) / 100); });

export const Subscription = mongoose.model("Subscription", Schema);
