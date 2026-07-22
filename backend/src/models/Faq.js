import mongoose from "mongoose";

const Schema = new mongoose.Schema(
    {
        question: { type: String, required: true, trim: true },
        answer: { type: String, required: true, trim: true },
        displayOrder: { type: Number, default: 0, index: true },
        isActive: { type: Boolean, default: true, index: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },
        deletedAt: { type: Date, default: null }
    },
    { timestamps: true }
);

export const Faq = mongoose.model("Faq", Schema);
