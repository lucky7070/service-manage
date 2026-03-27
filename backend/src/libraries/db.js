import mongoose from "mongoose";
import { config } from "../config/index.js";

export const connectDb = async () => {
    await mongoose.connect(config.mongoUri);
    console.log("MongoDB connected");
};
