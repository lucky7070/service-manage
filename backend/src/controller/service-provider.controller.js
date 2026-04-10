import jwt from "jsonwebtoken";
import moment from "moment";
import { config } from "../config/index.js";
import { COOKIE_OPTIONS, PHONE_REGEXP } from "../config/constants.js";
import { generateOtp, now, nowPlusMinutes } from "../helpers/utils.js";
import { OtpVerification, ServiceProvider } from "../models/index.js";
import { sendOTP } from "../libraries/sms.js";

export const sendOtp = async (req, res) => {
    try {

        const environment = process.env.NODE_ENV || "production";

        let { mobile, purpose = "login" } = req.body;
        if (!mobile) return res.someThingWentWrong({ message: "Mobile is required" });
        if (!PHONE_REGEXP.test(String(mobile).trim())) return res.someThingWentWrong({ message: "Enter a valid Indian mobile number." });

        let user = await ServiceProvider.findOne({ mobile, deletedAt: null });
        if (!user && purpose === "login") return res.someThingWentWrong({ message: "Service Provider not registered..!!" });
        if (user && purpose === "registration") return res.someThingWentWrong({ message: "Service Provider already registered..!!" });

        const otp = generateOtp();
        const isSent = await sendOTP(mobile, otp);
        if (!isSent) return res.someThingWentWrong({ message: "Failed to send OTP" });

        await OtpVerification.deleteMany({ phoneNumber: mobile });
        await OtpVerification.create({ phoneNumber: mobile, otpCode: otp, purpose, expiresAt: nowPlusMinutes(config.otpExpiryMinutes) });

        return res.success(environment === "development" ? otp : "", "OTP sent");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const login = async (req, res) => {
    try {
        const { mobile, otp } = req.body;
        if (!otp || !mobile) return res.someThingWentWrong({ message: "Mobile and otp are required" });
        if (!PHONE_REGEXP.test(String(mobile).trim())) return res.someThingWentWrong({ message: "Enter a valid Indian mobile number." });

        const verify = await OtpVerification.findOne({ phoneNumber: mobile, otpCode: otp, purpose: "login" }).sort({ createdAt: -1 });
        if (!verify || moment(verify.expiresAt).isBefore(moment())) return res.someThingWentWrong({ message: "Invalid or expired OTP" });

        let user = await ServiceProvider.findOne({ mobile: verify.phoneNumber, deletedAt: null });
        if (!user) return res.someThingWentWrong({ message: "User not registered..!!" });

        await user.updateOne({ lastLogin: now() });
        await verify.deleteOne();

        const token = jwt.sign({ id: user._id, role: "service-provider" }, config.serviceProviderJwtSecret, { expiresIn: "7d" });
        res.cookie("service-provider-token", token, COOKIE_OPTIONS);

        return res.success({ _id: user._id, name: user.name, mobile: user.mobile }, "Success..!!");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const register = async (req, res) => {
    try {
        const { name, mobile, email, cityId, serviceCategoryId, panCardNumber, aadharNumber, experienceYears, experienceDescription = "", otp } = req.body;

        const verify = await OtpVerification.findOne({
            phoneNumber: String(mobile).trim(),
            otpCode: String(otp).trim(),
            purpose: "registration"
        }).sort({ createdAt: -1 });
        if (!verify || moment(verify.expiresAt).isBefore(moment())) {
            return res.someThingWentWrong({ message: "Invalid or expired OTP" });
        }

        const existing = await ServiceProvider.findOne({
            deletedAt: null,
            $or: [
                { mobile: String(mobile).trim() },
                { email: String(email).trim().toLowerCase() },
                { panCardNumber: String(panCardNumber).trim().toUpperCase() },
                { aadharNumber: String(aadharNumber).trim() }
            ]
        });
        if (existing) {
            if (existing.mobile === String(mobile).trim()) {
                return res.someThingWentWrong({ message: "Service provider with this mobile already exists." });
            }

            if (existing.email === String(email).trim().toLowerCase()) {
                return res.someThingWentWrong({ message: "Service provider with this email already exists." });
            }

            if (existing.panCardNumber === String(panCardNumber).trim().toUpperCase()) {
                return res.someThingWentWrong({ message: "This PAN is already registered." });
            }

            return res.someThingWentWrong({ message: "This Aadhar number is already registered." });
        }

        const files = req.files || {};
        const image = `/service-provider/${files?.image?.[0]?.filename}`;
        const panCardDocument = `/service-provider/${files?.panCardDocument?.[0]?.filename}`;
        const aadharDocument = `/service-provider/${files?.aadharDocument?.[0]?.filename}`;

        await ServiceProvider.create({
            name: String(name).trim(),
            mobile: String(mobile).trim(),
            email: String(email).trim().toLowerCase(),
            cityId,
            serviceCategoryId,
            image,
            panCardNumber: String(panCardNumber).trim().toUpperCase(),
            aadharNumber: String(aadharNumber).trim(),
            panCardDocument,
            aadharDocument,
            experienceYears: Number(experienceYears ?? 0),
            experienceDescription: String(experienceDescription).trim() || null,
            registerFrom: "front",
            profileStatus: "pending",
            isVerified: false,
            isActive: true
        });

        await verify.deleteOne();

        return res.successInsert({}, "Registration submitted successfully. Our team will contact you soon.");
    } catch (error) {
        if (error?.code === 11000) {
            return res.someThingWentWrong({ message: "Duplicate mobile, email, PAN, or Aadhar." });
        }
        return res.someThingWentWrong(error);
    }
};

export const profile = async (req, res) => {
    try {
        const { id } = req.serviceProvider;

        const user = await ServiceProvider.findById(id, "_id name mobile email image");
        return res.success({ _id: user._id, name: user.name, mobile: user.mobile, email: user.email, image: user.image }, "User profile fetched successfully");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie("service-provider-token");
        return res.success([], "Logged out");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};
