import mongoose from "mongoose";

const Schema = new mongoose.Schema({
    countryId: { type: mongoose.Schema.Types.ObjectId, ref: "Country", required: true },
    stateId: { type: mongoose.Schema.Types.ObjectId, ref: "State", required: true },
    cityId: { type: mongoose.Schema.Types.ObjectId, ref: "City", required: true },
    name: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
    deletedAt: { type: Date, default: null }
}, { timestamps: true });

Schema.index({ countryId: 1, stateId: 1, cityId: 1, name: 1 }, { unique: true });

export const Area = mongoose.model("Area", Schema);
