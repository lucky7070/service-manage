import mongoose from "mongoose";

const Schema = new mongoose.Schema({
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true, index: true, default: null },
    ratedBy: { type: mongoose.Schema.Types.ObjectId, required: true, default: null },
    ratedTo: { type: mongoose.Schema.Types.ObjectId, required: true, index: true, default: null },
    ratingType: { type: String, enum: ["customer_to_provider", "provider_to_customer"], required: true, default: null },
    starRating: { type: Number, min: 1, max: 5, required: true, default: 1 },
    reviewText: { type: String, default: null },
    quickTags: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: "PredefinedRatingTag" }], default: [] }
}, { timestamps: true });

Schema.index({ bookingId: 1, ratingType: 1 }, { unique: true });

export const Rating = mongoose.model("Rating", Schema);
