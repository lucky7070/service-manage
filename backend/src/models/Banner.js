import mongoose from "mongoose";
import { BANNER_TYPES } from "../config/constants.js";

const Schema = new mongoose.Schema(
    {
        bannerTitle: { type: String, default: null },
        bannerTitleHi: { type: String, default: null },
        bannerSubtitle: { type: String, default: null },
        bannerSubtitleHi: { type: String, default: null },
        bannerImage: { type: String, required: true, default: null },
        bannerType: { type: String, enum: BANNER_TYPES, default: "homepage", index: true },
        link: { type: String, default: null },
        displayOrder: { type: Number, default: 0, index: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },
        deletedAt: { type: Date, default: null }
    },
    { timestamps: true }
);

export const Banner = mongoose.model("Banner", Schema);