import jwt from "jsonwebtoken";
import { config } from "../config/index.js";

export const requireAdminAuth = (req, res, next) => {
    try {
        const token = req.cookies?.admin_token;
        if (!token) return res.status(401).json({ status: false, message: "Unauthorized Access..!!", data: [] });

        const payload = jwt.verify(token, config.jwtSecret);
        if (payload.role !== "admin") return res.status(403).json({ status: false, message: "Forbidden Access..!!", data: [] });

        req.admin = payload;
        return next();
    } catch (error) {
        return res.status(401).json({ status: false, message: "Invalid admin session", data: [] });
    }
};
