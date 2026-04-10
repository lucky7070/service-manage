import mongoose from "mongoose";

const Schema = new mongoose.Schema(
    {
        name: { type: String, default: null },
        email: { type: String, default: null },
        phone: { type: String, default: null },
        subject: { type: String, default: null },
        message: { type: String, default: null },
        isResolved: { type: Boolean, default: false, index: true },
        resolvedAt: { type: Date, default: null },
        resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },
        deletedAt: { type: Date, default: null }
    },
    { timestamps: true }
);

export const Enquiry = mongoose.model("Enquiry", Schema);
