import mongoose from "mongoose";

const Schema = new mongoose.Schema(
    {
        name: { type: String, default: null },
        email: { type: String, default: null },
        phone: { type: String, default: null },
        message: { type: String, default: null }
    },
    { timestamps: true }
);

export const Enquiry = mongoose.model("Enquiry", Schema);
