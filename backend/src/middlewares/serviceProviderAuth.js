import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import { ServiceProvider } from "../models/index.js";

export const requireServiceProviderAuth = async (req, res, next) => {
    try {
        const token = req.cookies?.['service-provider-token'];
        if (!token) return res.status(401).json({ status: false, message: "Unauthorized Access..!!", data: [] });

        const payload = jwt.verify(token, config.serviceProviderJwtSecret);
        if (payload.role !== "service-provider") return res.status(403).json({ status: false, message: "Forbidden Access..!!", data: [] });

        const serviceProvider = await ServiceProvider.findOne({ _id: payload.id, deletedAt: null, isActive: true }, "_id name mobile email image");
        if (!serviceProvider) return res.status(404).json({ status: false, message: "Service Provider not found", data: [] });

        req.serviceProvider = serviceProvider;
        return next();
    } catch (error) {
        return res.status(401).json({ status: false, message: "Invalid service provider session", data: [] });
    }
};
