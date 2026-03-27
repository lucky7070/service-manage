import mongoose from "mongoose";

const Schema = new mongoose.Schema({
    tagFor: { type: String, enum: ["customer", "provider"], required: true, index: true, default: null },
    tagName: { type: String, required: true, default: null },
    tagType: { type: String, enum: ["positive", "negative", "neutral"], default: "positive" },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const PredefinedRatingTag = mongoose.model("PredefinedRatingTag", Schema);
