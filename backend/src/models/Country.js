import mongoose from "mongoose";

const Schema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true, index: true, default: null },
        isActive: { type: Boolean, default: true },
        deletedAt: { type: Date, default: null }
    },
    { timestamps: true }
);

export const Country = mongoose.model("Country", Schema);
