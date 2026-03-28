import jwt from "jsonwebtoken";
import moment from "moment";
import { config } from "../config/index.js";
import { PHONE_REGEXP } from "../config/constants.js";
import { generateOtp, now, nowPlusMinutes } from "../helpers/utils.js";
import { OtpVerification, Customer } from "../models/index.js";

export const sendOtp = async (req, res) => {
    try {
        let { mobile, purpose = "login", bookingId } = req.body;
        if (!mobile) return res.someThingWentWrong({ message: "Mobile is required" });
        if (!PHONE_REGEXP.test(String(mobile).trim())) return res.someThingWentWrong({ message: "Enter a valid Indian mobile number." });

        const otp = generateOtp();
        await OtpVerification.create({ phoneNumber: mobile, otpCode: otp, purpose, bookingId, expiresAt: nowPlusMinutes(config.otpExpiryMinutes) });

        return res.success({ otpPreview: otp }, "OTP sent");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const verifyOtp = async (req, res) => {
    try {
        const { mobile, otp, role = "customer", name = "New Customer" } = req.body;
        if (!mobile || !otp) return res.someThingWentWrong({ message: "Mobile and OTP are required" });
        if (!PHONE_REGEXP.test(String(mobile).trim())) return res.someThingWentWrong({ message: "Enter a valid Indian mobile number." });

        const entry = await OtpVerification.findOne({ phoneNumber: mobile, otpCode: otp, isUsed: false }).sort({ createdAt: -1 });
        if (!entry || moment(entry.expiresAt).isBefore(moment())) {
            return res.someThingWentWrong({ message: "Invalid or expired OTP" });
        }

        entry.isUsed = true;
        await entry.save();

        let user = await Customer.findOne({ mobile });
        if (!user) user = await Customer.create({ mobile, role, name, isVerified: true });

        user.lastLogin = now();
        await user.save();

        const token = jwt.sign({ id: user._id, role: user.role }, config.jwtSecret, { expiresIn: "30d" });
        return res.success({ token, user }, "OTP verified");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};
