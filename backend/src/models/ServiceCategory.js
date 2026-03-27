import mongoose from "mongoose";

const Schema = new mongoose.Schema({
    slug: { type: String, required: true, unique: true, default: null },
    name: { type: String, required: true, index: true, default: null },
    nameHi: { type: String, default: null },
    image: { type: String, default: null },
    description: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
    deletedAt: { type: Date, default: null }
}, { timestamps: true });

export const ServiceCategory = mongoose.model("ServiceCategory", Schema);
