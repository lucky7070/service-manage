import mongoose from "mongoose";

const Schema = new mongoose.Schema({
  _id: { type: String, required: true, default: null },
  seq: { type: Number, default: 0 }
});

export const Counter = mongoose.model("Counter", Schema);
