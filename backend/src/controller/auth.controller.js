import jwt from "jsonwebtoken";
import moment from "moment";
import { config } from "../config/index.js";
import { COOKIE_OPTIONS, PHONE_REGEXP } from "../config/constants.js";
import { generateOtp, now, nowPlusMinutes } from "../helpers/utils.js";
import { OtpVerification, Customer } from "../models/index.js";

export const sendOtp = async (req, res) => {
    try {

        const environment = process.env.NODE_ENV || "production";

        let { mobile, purpose = "login", bookingId } = req.body;
        if (!mobile) return res.someThingWentWrong({ message: "Mobile is required" });
        if (!PHONE_REGEXP.test(String(mobile).trim())) return res.someThingWentWrong({ message: "Enter a valid Indian mobile number." });

        let user = await Customer.findOne({ mobile, deletedAt: null });
        if (!user && purpose === "login") return res.someThingWentWrong({ message: "User not registered..!!" });

        const otp = generateOtp();
        await OtpVerification.create({ phoneNumber: mobile, otpCode: otp, purpose, bookingId, expiresAt: nowPlusMinutes(config.otpExpiryMinutes) });

        return res.success(environment === "development" ? otp : "", "OTP sent");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const register = async (req, res) => {
    try {
        const { name = `New Customer ${moment().format("DDMMYYYYHHmmss").toUpperCase()}`, mobile, otp } = req.body;
        if (!name || !mobile) return res.someThingWentWrong({ message: "Name and mobile are required" });
        if (!PHONE_REGEXP.test(String(mobile).trim())) return res.someThingWentWrong({ message: "Enter a valid Indian mobile number." });

        const verify = await OtpVerification.findOne({ phoneNumber: mobile, otpCode: otp, purpose: { $in: ["registration", "login"] } }).sort({ createdAt: -1 });
        if (!verify || moment(verify.expiresAt).isBefore(moment())) return res.someThingWentWrong({ message: "Invalid or expired OTP" });

        let user = await Customer.findOne({ mobile: verify.phoneNumber, deletedAt: null });
        if (!user && verify.purpose === "login") return res.someThingWentWrong({ message: "User not registered..!!" });

        if (!user) user = await Customer.create({ mobile: verify.phoneNumber, name, isVerified: true });

        await user.updateOne({ lastLogin: now() });
        await verify.deleteOne();

        const token = jwt.sign({ id: user._id, role: "customer" }, config.customerJwtSecret, { expiresIn: "7d" });
        res.cookie("customer_token", token, COOKIE_OPTIONS);

        return res.success({ _id: user._id, name: user.name, mobile: user.mobile, email: user.email, image: user.image }, "Success..!!");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const profile = async (req, res) => {
    try {
        const { id } = req.customer;

        const user = await Customer.findById(id, "_id name mobile email image");
        return res.success({ _id: user._id, name: user.name, mobile: user.mobile, email: user.email, image: user.image }, "User profile fetched successfully");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie("customer_token");
        return res.success([], "Logged out");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};