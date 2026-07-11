import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../../config/index.js";
import { Franchise } from "../../models/index.js";
import { JWT_CONFIG } from "../../config/constants.js";
import { deleteFile } from "../../libraries/storage.js";

const getProfile = async (userId) => {
    const [franchise] = await Franchise.aggregate([
        { $match: { _id: userId } },
        { $project: { userId: 1, name: 1, mobile: 1, email: 1, image: 1, isActive: 1, createdAt: 1, lastLogin: 1 } }
    ]);
    return franchise || null;
};

export const franchiseLogin = async (req, res) => {
    try {
        const { identifier, password } = req.body;
        if (!identifier) return res.clientError("Identifier is required.", 422, [{ field: "identifier", message: "Required" }]);
        if (!password) return res.clientError("Password is required.", 422, [{ field: "password", message: "Required" }]);

        const franchise = await Franchise.findOne({ $or: [{ email: identifier }, { mobile: identifier }], deletedAt: null, isActive: true }).select("+password");
        if (!franchise) return res.clientError("Invalid credentials", 401);

        const ok = await bcrypt.compare(password, franchise.password);
        if (!ok) return res.clientError("Invalid credentials", 401);

        franchise.lastLogin = new Date();
        await franchise.save();

        const token = jwt.sign({ id: franchise._id, role: "franchise" }, config.franchiseJwtSecret, JWT_CONFIG);
        res.setCookie("franchise_token", token);

        return res.success(await getProfile(franchise._id), "Franchise login successful");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const franchiseProfile = async (req, res) => {
    try {
        const profile = await getProfile(req.franchise._id);
        if (!profile) return res.noRecords(false, "Franchise not found");
        return res.success(profile, "Franchise profile fetched successfully");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const updateFranchiseProfile = async (req, res) => {
    try {
        const vData = req.getBody(["name", "mobile", "email"]);
        const conflict = await Franchise.findOne({
            _id: { $ne: req.franchise._id },
            deletedAt: null,
            $or: [{ mobile: vData.mobile }, { email: vData.email }]
        });
        if (conflict) throw new Error("Franchise with same mobile/email already exists.");

        req.franchise.name = String(vData.name).trim();
        req.franchise.mobile = String(vData.mobile).trim();
        req.franchise.email = String(vData.email).trim().toLowerCase();
        await req.franchise.save();

        return res.successUpdate(await getProfile(req.franchise._id), "Profile updated");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const updateFranchiseProfileImage = async (req, res) => {
    try {
        if (!req.file) throw new Error("Profile image is required.");

        const previous = req.franchise.image;
        const nextImage = `/franchises/${req.file.filename}`;
        if (previous && previous !== nextImage && previous !== "/franchises/default.png") {
            deleteFile(previous);
        }

        req.franchise.image = nextImage;
        await req.franchise.save();

        return res.successUpdate(await getProfile(req.franchise._id), "Profile image updated");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const updateFranchisePassword = async (req, res) => {
    try {
        const { current_password, new_password } = req.body;

        const franchise = await Franchise.findById(req.franchise._id).select("+password");
        if (!franchise) return res.noRecords(false, "Franchise not found");

        const ok = await bcrypt.compare(String(current_password), franchise.password);
        if (!ok) return res.clientError("Current password is incorrect.", 400, [{ field: "current_password", message: "Current password is incorrect." }]);

        franchise.password = await bcrypt.hash(String(new_password), 10);
        await franchise.save();

        return res.successUpdate({}, "Password updated successfully.");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const franchiseLogout = async (req, res) => {
    res.deleteCookie("franchise_token");
    return res.success([], "Logged out");
};
