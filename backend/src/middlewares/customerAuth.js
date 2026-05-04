import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import { Customer } from "../models/index.js";

export const requireCustomerAuth = async (req, res, next) => {
    try {
        const token = req.cookies?.customer_token;
        if (!token) return res.status(401).json({ status: false, message: "Unauthorized Access..!!", data: [] });

        const payload = jwt.verify(token, config.customerJwtSecret);
        if (payload.role !== "customer") return res.status(403).json({ status: false, message: "Forbidden Access..!!", data: [] });

        const customer = await Customer.findOne({ _id: payload.id, deletedAt: null, isActive: true }, "_id userId name mobile email image dateOfBirth preferredLanguage balance referralCode");
        if (!customer) return res.status(401).json({ status: false, message: "User not found", data: [] });

        req.customer = customer;
        return next();
    } catch (error) {
        return res.status(401).json({ status: false, message: "Invalid customer session", data: [] });
    }
};
