import mongoose from "mongoose";

const Schema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true, index: true, default: null },
    addressLine1: { type: String, required: true, default: null },
    addressLine2: { type: String, default: null },
    landmark: { type: String, default: null },
    city: { type: String, default: null },
    state: { type: String, default: null },
    pincode: { type: String, default: null },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    locationType: { type: String, enum: ["home", "office", "other"], default: "home" }
  },
  { timestamps: true }
);

export const BookingLocation = mongoose.model("BookingLocation", Schema);
