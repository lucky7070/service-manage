import jwt from "jsonwebtoken";
import moment from "moment";
import { config } from "../config/index.js";
import { JWT_CONFIG, PHONE_REGEXP } from "../config/constants.js";
import { generateOtp, now, nowPlusMinutes } from "../helpers/utils.js";
import { OtpVerification, Customer } from "../models/index.js";
import { sendOTP } from "../libraries/sms.js";
import { getSettings } from "../helpers/database.js";

export const sendOtp = async (req, res) => {
    try {

        let { mobile, purpose = "login", bookingId } = req.body;
        if (!mobile) return res.clientError("Mobile is required.", 422, [{ field: "mobile", message: "Required" }]);
        if (!PHONE_REGEXP.test(String(mobile).trim())) return res.clientError("Enter a valid Indian mobile number.", 422, [{ field: "mobile", message: "Enter a valid Indian mobile number." }]);

        let user = await Customer.findOne({ mobile, deletedAt: null });
        if (!user && purpose === "login") return res.clientError("User not registered..!!", 404);
        if (user && purpose === "register") return res.clientError("User already registered..!!", 409);

        const otp = generateOtp();
        const isSent = await sendOTP(mobile, otp);
        if (!isSent) return res.clientError("Failed to send OTP", 502);

        await OtpVerification.deleteMany({ phoneNumber: mobile });
        await OtpVerification.create({ phoneNumber: mobile, otpCode: otp, purpose, bookingId, expiresAt: nowPlusMinutes(config.otpExpiryMinutes) });

        return res.success(config.isDevelopment ? otp : "", "OTP sent");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const register = async (req, res) => {
    try {
        const { name = "New Customer", mobile, otp, referralCode = "" } = req.body;
        if (!String(name ?? "").trim()) return res.clientError("Name is required.", 422, [{ field: "name", message: "Required" }]);
        if (!mobile) return res.clientError("Mobile is required.", 422, [{ field: "mobile", message: "Required" }]);
        if (!PHONE_REGEXP.test(String(mobile).trim())) return res.clientError("Enter a valid Indian mobile number.", 422, [{ field: "mobile", message: "Enter a valid Indian mobile number." }]);

        const verify = await OtpVerification.findOne({ phoneNumber: mobile, otpCode: otp, purpose: { $in: ["register", "login"] } }).sort({ createdAt: -1 });
        if (!verify || moment(verify.expiresAt).isBefore(moment())) return res.clientError("Invalid or expired OTP", 422, [{ field: "otp", message: "Invalid or expired OTP" }]);

        let user = await Customer.findOne({ mobile: verify.phoneNumber, deletedAt: null });
        if (!user) {

            if (verify.purpose === "login") return res.clientError("User not registered..!!", 404);

            let referrer = null;
            let referredBy = null;
            const normalizedReferralCode = String(referralCode || "").trim().toUpperCase();
            if (normalizedReferralCode) {
                referrer = await Customer.findOne({ referralCode: normalizedReferralCode, deletedAt: null, isActive: true });
                if (!referrer) return res.clientError("Invalid referral code", 422, [{ field: "referralCode", message: "Invalid referral code" }]);

                referredBy = referrer._id;
            }

            user = await Customer.create({ mobile: verify.phoneNumber, name, isVerified: true, referredBy });

            const settings = await getSettings(["signup_rewards", "refer_amount"]);
            const signupReward = Number(settings.signup_rewards || 0);
            if (signupReward > 0) {
                await user.addLedger({ amount: signupReward, paymentType: 1, paymentMethod: 6, particulars: "Signup reward" });
            }

            const referralReward = Number(settings.refer_amount || 0);
            if (referrer && referralReward > 0 && String(referrer._id) !== String(user._id)) {
                await referrer.addLedger({
                    amount: referralReward,
                    paymentType: 1,
                    paymentMethod: 2,
                    requestId: user._id,
                    particulars: `Referral reward for ${user.userId}`
                });
            }
        }

        await user.updateOne({ lastLogin: now() });
        await verify.deleteOne();

        const token = jwt.sign({ id: user._id, role: "customer" }, config.customerJwtSecret, JWT_CONFIG);
        res.setCookie("customer_token", token);

        return res.success({ _id: user._id, name: user.name, mobile: user.mobile, email: user.email, image: user.image, balance: user.balance, referralCode: user.referralCode }, "Success..!!");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const profile = async (req, res) => {
    try {
        const { id } = req.customer;

        const user = await Customer.findById(id, "_id userId name mobile email image dateOfBirth preferredLanguage balance referralCode");
        return res.success({
            _id: user._id,
            userId: user.userId,
            name: user.name,
            mobile: user.mobile,
            email: user.email,
            image: user.image,
            balance: user.balance || 0,
            referralCode: user.referralCode || "",
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
            if (duplicate) return res.clientError("Customer with this email already exists.", 409, [{ field: "email", message: "Customer with this email already exists." }]);
        }

        const dob = dateOfBirth ? new Date(dateOfBirth) : null;
        if (dateOfBirth && Number.isNaN(dob.getTime())) return res.clientError("Invalid date of birth.", 422, [{ field: "dateOfBirth", message: "Invalid date of birth." }]);

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