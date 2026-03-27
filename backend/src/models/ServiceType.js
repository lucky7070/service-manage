import mongoose from "mongoose";

const Schema = new mongoose.Schema({
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceCategory", required: true, index: true, default: null },
    name: { type: String, required: true, index: true, default: null },
    nameHi: { type: String, default: null },
    estimatedTimeMinutes: { type: Number, default: null },
    basePrice: { type: Number, default: null },
    description: { type: String, default: null },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const ServiceType = mongoose.model("ServiceType", Schema);
