import jwt from "jsonwebtoken";
import moment from "moment";
import { config } from "../config/index.js";
import { COOKIE_OPTIONS, PHONE_REGEXP } from "../config/constants.js";
import { generateOtp, now, nowPlusMinutes } from "../helpers/utils.js";
import { OtpVerification, Customer } from "../models/index.js";
import { sendOTP } from "../libraries/sms.js";

export const sendOtp = async (req, res) => {
    try {

        const environment = process.env.NODE_ENV || "production";

        let { mobile, purpose = "login", bookingId } = req.body;
        if (!mobile) return res.someThingWentWrong({ message: "Mobile is required" });
        if (!PHONE_REGEXP.test(String(mobile).trim())) return res.someThingWentWrong({ message: "Enter a valid Indian mobile number." });

        let user = await Customer.findOne({ mobile, deletedAt: null });
        if (!user && purpose === "login") return res.someThingWentWrong({ message: "User not registered..!!" });
        if (user && purpose === "register") return res.someThingWentWrong({ message: "User already registered..!!" });

        const otp = generateOtp();
        const isSent = await sendOTP(mobile, otp);
        if (!isSent) return res.someThingWentWrong({ message: "Failed to send OTP" });

        await OtpVerification.deleteMany({ phoneNumber: mobile });
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
        res.setCookie("customer_token", token);

        return res.success({ _id: user._id, name: user.name, mobile: user.mobile, email: user.email, image: user.image }, "Success..!!");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const profile = async (req, res) => {
    try {
        const { id } = req.customer;

        const user = await Customer.findById(id, "_id userId name mobile email image dateOfBirth preferredLanguage");
        return res.success({
            _id: user._id,
            userId: user.userId,
            name: user.name,
            mobile: user.mobile,
            email: user.email,
            image: user.image,
            dateOfBirth: user.dateOfBirth ? moment(user.dateOfBirth).format("YYYY-MM-DD") : "",
            preferredLanguage: user.preferredLanguage || "en"
        }, "User profile fetched successfully");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { name, email = "", dateOfBirth = "", preferredLanguage = "en" } = req.body;
        const customer = await Customer.findOne({ _id: req.customer._id, deletedAt: null, isActive: true });
        if (!customer) return res.noRecords();

        const normalizedEmail = String(email || "").trim().toLowerCase();
        if (normalizedEmail) {
            const duplicate = await Customer.findOne({ _id: { $ne: customer._id }, email: normalizedEmail, deletedAt: null });
            if (duplicate) return res.someThingWentWrong({ message: "Customer with this email already exists." });
        }

        const dob = dateOfBirth ? new Date(dateOfBirth) : null;
        if (dateOfBirth && Number.isNaN(dob.getTime())) return res.someThingWentWrong({ message: "Invalid date of birth." });

        customer.name = String(name).trim();
        customer.email = normalizedEmail;
        customer.dateOfBirth = dob;
        customer.preferredLanguage = preferredLanguage || "en";
        await customer.save();

        return res.successUpdate({
            _id: customer._id,
            userId: customer.userId,
            name: customer.name,
            mobile: customer.mobile,
            email: customer.email,
            image: customer.image,
            dateOfBirth: customer.dateOfBirth ? moment(customer.dateOfBirth).format("YYYY-MM-DD") : "",
            preferredLanguage: customer.preferredLanguage || "en"
        }, "Profile updated successfully.");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const logout = async (req, res) => {
    try {
        res.deleteCookie("customer_token");
        return res.success([], "Logged out");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};