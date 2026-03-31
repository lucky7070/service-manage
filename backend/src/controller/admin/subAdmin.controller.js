import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import moment from "moment";
import { Admin, Role } from "../../models/index.js";
import { escapeRegex } from "../../helpers/utils.js";

export const listAdmins = async (req, res) => {
    try {

        let { limit, pageNo, query, status, sortBy = "createdAt", sortOrder = "desc" } = req.query;

        limit = limit ? parseInt(limit) : 10;
        pageNo = pageNo ? parseInt(pageNo) : 1;
        sortBy = ["name", "status", "roleName", "mobile", "email", "createdAt"].includes(String(sortBy)) ? String(sortBy) : "createdAt";
        sortOrder = ["asc", "desc"].includes(String(sortOrder).toLowerCase()) ? String(sortOrder).toLowerCase() : "desc";

        const filter = { deletedAt: null };
        if (query) {
            const q = escapeRegex(String(query));
            filter.$or = [
                { userId: { $regex: q, $options: "i" } },
                { name: { $regex: q, $options: "i" } },
                { mobile: { $regex: q, $options: "i" } },
                { email: { $regex: q, $options: "i" } },
                { roleName: { $regex: q, $options: "i" } }
            ];
        }

        if (status !== null && status !== undefined && status !== "") {
            filter.isActive = Number(status) === 1;
        }

        const pipeline = [
            { $project: { userId: 1, name: 1, mobile: 1, email: 1, image: 1, roleId: 1, isActive: 1, createdAt: 1 } },
            { $lookup: { from: "roles", localField: "roleId", foreignField: "_id", as: "roleName" } },
            {
                $addFields: {
                    roleName: { $ifNull: [{ $first: "$roleName.name" }, '--'] },
                    status: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] },
                }
            },
            { $match: filter }
        ];

        // Clone the pipeline and append `$count` for total count
        const totalCountPipeline = [...pipeline, { $count: 'total_count' }];

        // Query to get paginated results
        const resultsPipeline = [...pipeline, { $sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 } }, { $skip: (pageNo - 1) * limit }, { $limit: limit }];

        // Execute both pipelines
        const [results, totalCount] = await Promise.all([Admin.aggregate(resultsPipeline), Admin.aggregate(totalCountPipeline)]);

        const total_count = totalCount.length > 0 ? totalCount[0].total_count : 0;
        if (results.length > 0) {
            return res.pagination(results, total_count, limit, pageNo);
        } else {
            return res.datatableNoRecords();
        }
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const getSingleAdmin = async (req, res) => {
    try {
        const admin = await Admin.findOne({ _id: new mongoose.Types.ObjectId(String(req.params.id)), deletedAt: null });
        if (!admin) return res.noRecords();

        return res.success(admin);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const createAdmin = async (req, res) => {
    try {
        const { name, mobile, email = null, password, roleId, status = 1 } = req.body;

        const existing = await Admin.findOne({ deletedAt: null, $or: [{ mobile }, ...(email ? [{ email }] : [])] });
        if (existing) throw new Error("Admin with same mobile/email already exists.");

        const role = await Role.findOne({ _id: roleId, deletedAt: null });
        if (!role) throw new Error("Selected role not found.");

        const hashed = await bcrypt.hash(password, 10);
        const admin = await Admin.create({ name, mobile, email, roleId, password: hashed, permissions: [], isActive: Number(status) === 1 });

        admin.password = undefined;
        return res.successInsert(admin);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const updateAdmin = async (req, res) => {
    try {
        const admin = await Admin.findOne({ _id: new mongoose.Types.ObjectId(String(req.params.id)), deletedAt: null });
        if (!admin) return res.noRecords();

        const { name, mobile, email = null, password = null, roleId, status = 1 } = req.body;

        const conflict = await Admin.findOne({ _id: { $ne: admin._id }, deletedAt: null, $or: [{ mobile }, ...(email ? [{ email }] : [])] });
        if (conflict) throw new Error("Admin with same mobile/email already exists.");

        const role = await Role.findOne({ _id: roleId, deletedAt: null });
        if (!role) throw new Error("Selected role not found.");

        admin.name = name;
        admin.mobile = mobile;
        admin.email = email;
        admin.roleId = roleId;
        admin.isActive = Number(status) === 1;
        if (password) admin.password = await bcrypt.hash(password, 10);

        await admin.save();
        admin.password = undefined;
        return res.successUpdate(admin);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const addAdminPermission = async (req, res) => {
    try {
        const admin = await Admin.findOne({ _id: new mongoose.Types.ObjectId(String(req.params.id)), deletedAt: null });
        if (!admin) return res.noRecords();

        if (req.body.permissions === undefined || !Array.isArray(req.body.permissions)) {
            throw new Error("Permissions array is required.");
        }

        await Admin.updateOne({ _id: admin._id }, { permissions: req.body.permissions });
        admin.permissions = req.body.permissions;
        admin.password = undefined;
        return res.successUpdate(admin);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const deleteAdmin = async (req, res) => {
    try {
        const admin = await Admin.findOne({ _id: new mongoose.Types.ObjectId(String(req.params.id)), deletedAt: null });
        if (!admin) return res.noRecords();

        await admin.updateOne({ deletedAt: moment().toISOString() });
        return res.successDelete(admin);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

