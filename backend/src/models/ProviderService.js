import mongoose from "mongoose";

const Schema = new mongoose.Schema({
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceProvider", required: true, index: true, default: null },
    serviceTypeId: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceType", required: true, index: true, default: null },
    price: { type: Number, default: null },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

Schema.index({ providerId: 1, serviceTypeId: 1 }, { unique: true });

export const ProviderService = mongoose.model("ProviderService", Schema);
