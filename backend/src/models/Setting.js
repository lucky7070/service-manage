import mongoose from "mongoose";

const Schema = new mongoose.Schema(
    {
        setting_type: { type: Number, required: true },
        setting_name: { type: String, required: true, unique: true, index: true },
        filed_label: { type: String, required: true },
        filed_type: { type: String, required: true, enum: ["text", "file", "number", "textarea", "check"] },
        filed_value: { type: String, default: "" },
        status: { type: Number, default: 1 }
    },
    { timestamps: true }
);

export const Setting = mongoose.model("Setting", Schema);

