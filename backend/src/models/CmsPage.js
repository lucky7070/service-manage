import mongoose from "mongoose";

const Schema = new mongoose.Schema(
    {
        pageSlug: { type: String, required: true, unique: true, trim: true, maxlength: 150 },
        pageTitle: { type: String, required: true, trim: true, maxlength: 255 },
        pageTitleHi: { type: String, default: null, trim: true, maxlength: 255 },
        metaDescription: { type: String, default: null },
        metaKeywords: { type: String, default: null },
        content: { type: String, default: null },
        contentHi: { type: String, default: null },
        viewCount: { type: Number, default: 0, min: 0, index: true },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },
        deletedAt: { type: Date, default: null }
    },
    { timestamps: true }
);

export const CmsPage = mongoose.model("CmsPage", Schema);
