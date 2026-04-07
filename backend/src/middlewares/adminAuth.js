import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import { Admin } from "../models/index.js";

export const requireAdminAuth = async (req, res, next) => {
    try {
        const token = req.cookies?.admin_token;
        if (!token) return res.status(401).json({ status: false, message: "Unauthorized Access..!!", data: [] });

        const payload = jwt.verify(token, config.jwtSecret);
        if (payload.role !== "admin") return res.status(403).json({ status: false, message: "Forbidden Access..!!", data: [] });

        const admin = await Admin.findOne({ _id: payload.id, deletedAt: null, isActive: true }, "_id name mobile email image");
        if (!admin) return res.status(404).json({ status: false, message: "Admin not found", data: [] });

        req.admin = admin;
        return next();
    } catch (error) {
        return res.status(401).json({ status: false, message: "Invalid admin session", data: [] });
    }
};
