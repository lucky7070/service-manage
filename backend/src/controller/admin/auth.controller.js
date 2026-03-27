import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { config } from "../../config/index.js";
import { Admin, Role, Notification } from "../../models/index.js";

const cookieOptions = {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000
};

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
        res.cookie("admin_token", token, cookieOptions);

        return res.success({ admin }, "Admin login successful");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const adminProfile = async (req, res) => {
    try {

        const admins = await Admin.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(String(req.admin.id)) } },
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
        const admin = await Admin.findById(req.admin.id);
        if (!admin) return res.noRecords(false, "Admin not found");

        const vData = req.getBody(["name", "mobile", "email"]);

        const conflict = await Admin.findOne({
            _id: { $ne: admin._id },
            deletedAt: null,
            $or: [{ mobile: vData.mobile }, { email: vData.email }]
        });
        if (conflict) throw new Error("Admin with same mobile/email already exists.");

        await Admin.updateOne({ _id: req.admin.id }, vData);
        const updated = await Admin.findById(req.admin.id);
        return res.successUpdate(updated, "Profile updated");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const updateAdminProfileImage = async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin.id);
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

export const createDefaultAdmin = async (req, res) => {
    try {
        const { name, email, mobile, password } = req.body;
        if (!name || !password || (!email && !mobile)) {
            return res.someThingWentWrong({ message: "Name, password and email/mobile are required" });
        }

        const existing = await Admin.findOne({ $or: [{ email: email || null }, { mobile: mobile || null }] });
        if (existing) return res.someThingWentWrong({ message: "Admin already exists" });

        const role = await Role.create({ name: "Super Admin", isActive: 1 });
        const hashed = await bcrypt.hash(password, 10);
        const admin = await Admin.create({ name, email: email || null, mobile: mobile || null, password: hashed, roleId: role._id });
        return res.successInsert(admin, "Default admin created");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};
