import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import moment from "moment";
import { config } from "../../config/index.js";
import { Admin, OtpVerification, Notification } from "../../models/index.js";
import { generateOtp, nowPlusMinutes } from "../../helpers/utils.js";
import { passwordResetMail, sendSmtpMail } from "../../libraries/mail.js";
import { JWT_CONFIG } from "../../config/constants.js";

const getProfile = async (userId) => {
    const [admin] = await Admin.aggregate([
        { $match: { _id: userId } },
        { $project: { userId: 1, name: 1, mobile: 1, email: 1, image: 1, roleId: 1, permissions: 1, createdAt: 1 } },
        { $lookup: { from: "roles", localField: "roleId", foreignField: "_id", as: "roleName" } },
        { $addFields: { roleName: { $ifNull: [{ $first: "$roleName.name" }, '--'] } } },
    ]);

    if (!admin) return null;

    const notifications = await Notification.find({ userType: "admin" }, '_id title message isRead readAt createdAt').sort({ createdAt: -1 }).limit(10);
    return { ...admin, notifications };
}

export const adminLogin = async (req, res) => {
    try {
        const { identifier, password } = req.body;
        if (!identifier) return res.clientError("Identifier is required.", 422, [{ field: "identifier", message: "Required" }]);
        if (!password) return res.clientError("Password is required.", 422, [{ field: "password", message: "Required" }]);

        const admin = await Admin.findOne({
            $or: [{ email: identifier }, { mobile: identifier }],
            deletedAt: null,
            isActive: true
        }).select("+password");
        if (!admin) return res.clientError("Invalid credentials", 401);

        const ok = await bcrypt.compare(password, admin.password);
        if (!ok) return res.clientError("Invalid credentials", 401);

        const token = jwt.sign({ id: admin._id, role: "admin" }, config.jwtSecret, JWT_CONFIG);
        res.setCookie("admin_token", token);

        return res.success(await getProfile(admin._id), "Admin login successful");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const adminProfile = async (req, res) => {
    try {
        const profile = await getProfile(req.admin._id);
        if (!profile) return res.noRecords(false, "Admin not found");
        return res.success(profile, "Admin profile fetched successfully");
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

        const vData = req.getBody(["name", "mobile", "email"]);
        const conflict = await Admin.findOne({ _id: { $ne: req.admin._id }, deletedAt: null, $or: [{ mobile: vData.mobile }, { email: vData.email }] });
        if (conflict) throw new Error("Admin with same mobile/email already exists.");

        req.admin.name = String(vData.name).trim();
        req.admin.mobile = String(vData.mobile).trim();
        req.admin.email = String(vData.email).trim().toLowerCase();
        await req.admin.save();

        return res.successUpdate(await getProfile(req.admin._id), "Profile updated");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const updateAdminProfileImage = async (req, res) => {
    try {

        if (!req.file) throw new Error("Profile image is required.");

        req.admin.image = `/admins/${req.file.filename}`;
        await req.admin.save();

        return res.successUpdate(await getProfile(req.admin._id), "Profile image updated");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const adminLogout = async (req, res) => {
    res.deleteCookie("admin_token");
    return res.success([], "Logged out");
};

export const updateAdminPassword = async (req, res) => {
    try {
        const { current_password, new_password } = req.body;

        const admin = await Admin.findById(req.admin._id).select("+password");
        if (!admin) return res.noRecords(false, "Admin not found");

        const ok = await bcrypt.compare(String(current_password), admin.password);
        if (!ok) return res.clientError("Current password is incorrect.", 400, [{ field: "current_password", message: "Current password is incorrect." }]);

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
        if (!email) return res.clientError("Email is required.", 422, [{ field: "email", message: "Required" }]);

        const admin = await Admin.findOne({ email, deletedAt: null, isActive: true }).select("_id email name");
        if (!admin) return res.success({}, "If an account exists for this email, a verification code has been sent.!");

        const otp = generateOtp();
        await OtpVerification.deleteMany({ phoneNumber: email });
        await OtpVerification.create({ phoneNumber: email, purpose: "password_reset", expiresAt: nowPlusMinutes(config.otpExpiryMinutes), otpCode: otp });

        const result = await passwordResetMail({ email, name: admin.name, otp });
        if (!result) return res.clientError("Failed to send verification code. Please try again.", 422);
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
            return res.clientError("Invalid or expired code.", 422, [{ field: "otp", message: "Invalid or expired code." }]);
        }

        const admin = await Admin.findOne({ email: record.phoneNumber.trim().toLowerCase(), deletedAt: null, isActive: true }).select("+password");
        if (!admin) return res.clientError("Invalid or expired reset session. Please start again.", 400);

        admin.password = await bcrypt.hash(String(new_password), 10);
        await admin.save();

        return res.success({}, "Password updated successfully. You can sign in now.");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};
