import mongoose from "mongoose";

const Schema = new mongoose.Schema({
    countryId: { type: mongoose.Schema.Types.ObjectId, ref: "Country", required: true, default: null },
    stateId: { type: mongoose.Schema.Types.ObjectId, ref: "State", required: true, default: null },
    name: { type: String, required: true, default: null },
    slug: { type: String, trim: true, lowercase: true, default: null },
    isActive: { type: Boolean, default: true },
    deletedAt: { type: Date, default: null }
}, { timestamps: true });

Schema.index({ countryId: 1, stateId: 1, name: 1 }, { unique: true });
Schema.index({ slug: 1 }, { unique: true, partialFilterExpression: { deletedAt: null, slug: { $exists: true, $gt: "" } } });

export const City = mongoose.model("City", Schema);
