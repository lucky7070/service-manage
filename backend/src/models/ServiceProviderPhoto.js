import mongoose from "mongoose";

const Schema = new mongoose.Schema(
    {
        providerId: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceProvider", required: true, index: true, default: null },
        photoUrl: { type: String, required: true, trim: true },
        displayOrder: { type: Number, default: 0 }
    },
    { timestamps: true }
);

export const ServiceProviderPhoto = mongoose.model("ServiceProviderPhoto", Schema);
