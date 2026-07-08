import mongoose from "mongoose";
import dns from 'dns';
import { config } from "../config/index.js";

export const connectDb = async (connectFor = "startup") => {

    if (config.enableGoogleDns) dns.setServers(['8.8.8.8', '8.8.4.4']);

    await mongoose.connect(config.mongoUri);
    console.log(`[${connectFor}] MongoDB connected`);
};
