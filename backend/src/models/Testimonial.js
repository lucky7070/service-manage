import mongoose from "mongoose";

const Schema = new mongoose.Schema(
    {
        form: { type: String, default: 'customer', enum: ["customer", "provider"], required: true, trim: true },
        name: { type: String, required: true, trim: true },
        designation: { type: String, required: true, trim: true },
        image: { type: String, default: '/testimonials/default.png' },
        rating: { type: Number, required: true, default: 0 },
        review: { type: String, required: true, trim: true },
        isActive: { type: Boolean, default: true },
        deletedAt: { type: Date, default: null }
    },
    { timestamps: true }
);

export const Testimonial = mongoose.model("Testimonial", Schema);
