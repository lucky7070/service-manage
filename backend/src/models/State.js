import mongoose from "mongoose";

const Schema = new mongoose.Schema({
    countryId: { type: mongoose.Schema.Types.ObjectId, ref: "Country", required: true, default: null },
    name: { type: String, required: true, default: null },
    isActive: { type: Boolean, default: true },
    deletedAt: { type: Date, default: null }
}, { timestamps: true });

Schema.index({ countryId: 1, name: 1 }, { unique: true });

export const State = mongoose.model("State", Schema);
