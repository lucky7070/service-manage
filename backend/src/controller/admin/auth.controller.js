import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import moment from "moment";
import mongoose from "mongoose";
import { config } from "../../config/index.js";
import { Admin, OtpVerification, Notification } from "../../models/index.js";
import { generateOtp, nowPlusMinutes } from "../../helpers/utils.js";
import { passwordResetMail, sendSmtpMail } from "../../libraries/mail.js";
import { COOKIE_OPTIONS } from "../../config/constants.js";

export const adminLogin = async (req, res) => {
    try {
        const { identifier, password } = req.body;
        if (!identifier || !password) return res.someThingWentWrong({ message: "Identifier and password are required" });

        const admin = await Admin.findOne({
            $or: [{ email: identifier }, { mobile: identifier }],
            deletedAt: null,
            isActive: true
        }).select("+password");
        if (!admin) return res.someThingWentWrong({ message: "Invalid credentials" });

        const ok = await bcrypt.compare(password, admin.password);
        if (!ok) return res.someThingWentWrong({ message: "Invalid credentials" });

        const token = jwt.sign({ id: admin._id, role: "admin" }, config.jwtSecret, { expiresIn: "7d" });
        res.cookie("admin_token", token, COOKIE_OPTIONS);

        return res.success({ admin }, "Admin login successful");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const adminProfile = async (req, res) => {
    try {

        const admins = await Admin.aggregate([
            { $match: { _id: req.admin._id } },
            { $project: { userId: 1, name: 1, mobile: 1, email: 1, image: 1, roleId: 1, permissions: 1, createdAt: 1 } },
            { $lookup: { from: "roles", localField: "roleId", foreignField: "_id", as: "roleName" } },
            { $addFields: { roleName: { $ifNull: [{ $first: "$roleName.name" }, '--'] } } },
        ]);

        if (admins.length === 0) return res.noRecords(false, "Admin not found");

        const notifications = await Notification.find({ userType: "admin" }, '_id title message isRead readAt createdAt').sort({ createdAt: -1 }).limit(10);
        return res.success({ ...admins[0], notifications });
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const markAllAdminNotificationsRead = async (req, res) => {
    try {
        const now = new Date();
        await Notification.updateMany(
            { userType: "admin", isRead: false },
            { $set: { isRead: true, readAt: now } }
        );

        const notifications = await Notification.find(
            { userType: "admin" },
            "_id title message isRead readAt createdAt"
        ).sort({ createdAt: -1 }).limit(10);

        return res.success({ notifications }, "All notifications marked as read.");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const updateAdminProfile = async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin._id);
        if (!admin) return res.noRecords(false, "Admin not found");

        const vData = req.getBody(["name", "mobile", "email"]);

        const conflict = await Admin.findOne({
            _id: { $ne: admin._id },
            deletedAt: null,
            $or: [{ mobile: vData.mobile }, { email: vData.email }]
        });
        if (conflict) throw new Error("Admin with same mobile/email already exists.");

        await Admin.updateOne({ _id: req.admin._id }, vData);
        const updated = await Admin.findById(req.admin._id);
        return res.successUpdate(updated, "Profile updated");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const updateAdminProfileImage = async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin._id);
        if (!admin) return res.noRecords(false, "Admin not found");

        if (!req.file) throw new Error("Profile image is required.");

        admin.image = `/admins/${req.file.filename}`;
        await admin.save();

        return res.successUpdate(admin, "Profile image updated");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const adminLogout = async (req, res) => {
    res.clearCookie("admin_token");
    return res.success([], "Logged out");
};

export const updateAdminPassword = async (req, res) => {
    try {
        const { current_password, new_password } = req.body;

        const admin = await Admin.findById(req.admin._id).select("+password");
        if (!admin) return res.noRecords(false, "Admin not found");

        const ok = await bcrypt.compare(String(current_password), admin.password);
        if (!ok) return res.someThingWentWrong({ message: "Current password is incorrect." });

        admin.password = await bcrypt.hash(String(new_password), 10);
        await admin.save();

        return res.successUpdate({}, "Password updated successfully.");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const requestAdminForgotPassword = async (req, res) => {
    try {
        const email = String(req.body.email || "").trim().toLowerCase();
        if (!email) return res.someThingWentWrong({ message: "Email is required" });

        const admin = await Admin.findOne({ email, deletedAt: null, isActive: true }).select("_id email name");
        if (!admin) return res.success({}, "If an account exists for this email, a verification code has been sent.!");

        const otp = generateOtp();
        await OtpVerification.deleteMany({ phoneNumber: email });
        await OtpVerification.create({ phoneNumber: email, purpose: "password_reset", expiresAt: nowPlusMinutes(config.otpExpiryMinutes), otpCode: otp });

        const { subject, html } = passwordResetMail({ name: admin.name, otp });
        await sendSmtpMail({ to: email, subject, html, subHeading: "Verify your identity to create a new password" });
        return res.success([], "If an account exists for this email, a verification code has been sent.");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const resetAdminPasswordWithToken = async (req, res) => {
    try {
        const { email, otp, new_password } = req.body;

        const record = await OtpVerification.findOne({ phoneNumber: email.trim().toLowerCase(), otpCode: otp, purpose: "password_reset" }).sort({ createdAt: -1 });
        if (!record || moment(record.expiresAt).isBefore(moment())) {
            return res.someThingWentWrong({ message: "Invalid or expired code." });
        }

        const admin = await Admin.findOne({ email: record.phoneNumber.trim().toLowerCase(), deletedAt: null, isActive: true }).select("+password");
        if (!admin) return res.someThingWentWrong({ message: "Invalid or expired reset session. Please start again." });

        admin.password = await bcrypt.hash(String(new_password), 10);
        await admin.save();

        return res.success({}, "Password updated successfully. You can sign in now.");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};
