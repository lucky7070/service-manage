import mongoose from "mongoose";

const Schema = new mongoose.Schema(
    {
        icon: { type: String, required: true },
        title: { type: String, required: true, trim: true, maxlength: 200 },
        description: { type: String, required: true, trim: true, maxlength: 5000 },
        displayOrder: { type: Number, default: 0, min: 0, index: true },
        isActive: { type: Boolean, default: true, index: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },
        deletedAt: { type: Date, default: null, index: true }
    },
    { timestamps: true }
);

export const OurValue = mongoose.model("OurValue", Schema);

