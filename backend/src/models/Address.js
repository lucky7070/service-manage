import mongoose from "mongoose";

const Schema = new mongoose.Schema(
    {
        customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true, index: true, default: null },
        addressLine1: { type: String, required: true, default: null },
        addressLine2: { type: String, default: null },
        landmark: { type: String, default: null },
        city: { type: mongoose.Schema.Types.ObjectId, ref: "City", default: null },
        state: { type: mongoose.Schema.Types.ObjectId, ref: "State", default: null },
        pincode: { type: String, default: null },
        latitude: { type: Number, default: null },
        longitude: { type: Number, default: null },
        isDefault: { type: Boolean, default: false },
        locationType: { type: String, enum: ["home", "office", "other"], default: "home" },
        deletedAt: { type: Date, default: null }
    },
    { timestamps: true }
);

export const Address = mongoose.model("Address", Schema);
