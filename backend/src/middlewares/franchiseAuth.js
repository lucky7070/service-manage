import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import { Franchise } from "../models/index.js";

export const requireFranchiseAuth = async (req, res, next) => {
    try {
        const token = req.cookies?.franchise_token;
        if (!token) return res.status(401).json({ status: false, message: "Unauthorized Access..!!", data: [] });

        const payload = jwt.verify(token, config.franchiseJwtSecret);
        if (payload.role !== "franchise") return res.status(403).json({ status: false, message: "Forbidden Access..!!", data: [] });

        const franchise = await Franchise.findOne({ _id: payload.id, deletedAt: null, isActive: true });
        if (!franchise) return res.status(404).json({ status: false, message: "Franchise not found", data: [] });

        req.franchise = franchise;
        return next();
    } catch (error) {
        return res.status(401).json({ status: false, message: "Invalid franchise session", data: [] });
    }
};
