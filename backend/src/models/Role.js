import mongoose from "mongoose";

const Schema = new mongoose.Schema({
    name: { type: String, required: true, default: null },
    permissions: { type: [Number], default: [] },  // 101, 102
    isActive: { type: Boolean, default: true },
    deletedAt: { type: Date, default: null }
}, { timestamps: true });

export const Role = mongoose.model("Role", Schema);
