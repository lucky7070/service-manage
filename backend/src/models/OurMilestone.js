import mongoose from "mongoose";

const Schema = new mongoose.Schema(
    {
        year: { type: String, required: true, trim: true, maxlength: 20 },
        event: { type: String, required: true, trim: true, maxlength: 5000 },
        displayOrder: { type: Number, default: 0, min: 0, index: true },
        isActive: { type: Boolean, default: true, index: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },
        deletedAt: { type: Date, default: null, index: true }
    },
    { timestamps: true }
);

export const OurMilestone = mongoose.model("OurMilestone", Schema);

