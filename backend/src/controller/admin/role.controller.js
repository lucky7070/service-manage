import mongoose from "mongoose";
import moment from "moment";
import { Role } from "../../models/index.js";
import { escapeRegex } from "../../helpers/utils.js";

export const createRole = async (req, res) => {
    try {
        const { name, status = 1 } = req.body;
        if (!name?.trim()) return res.someThingWentWrong({ message: "Role name is required." });

        const exists = await Role.findOne({ name: name.trim(), deletedAt: null });
        if (exists) throw new Error(`Role with name "${name}" already exists.`);

        const role = await Role.create({ name: name.trim(), isActive: Number(status) === 1 });
        return res.successInsert(role);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const updateRole = async (req, res) => {
    try {
        const role = await Role.findOne({ _id: new mongoose.Types.ObjectId(`${req.params.id}`), deletedAt: null });
        if (!role) return res.noRecords();

        const { name, status = 1 } = req.body;
        if (!name?.trim()) return res.someThingWentWrong({ message: "Role name is required." });

        const exists = await Role.findOne({ _id: { $ne: role._id }, name: name.trim(), deletedAt: null });
        if (exists) throw new Error(`Role with name "${name}" already exists.`);

        await Role.updateOne({ _id: role._id }, { name: name.trim(), isActive: Number(status) === 1 });
        return res.successUpdate(role);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const deleteRole = async (req, res) => {
    try {
        const role = await Role.findOne({ _id: new mongoose.Types.ObjectId(`${req.params.id}`), deletedAt: null });
        if (!role) return res.noRecords();

        await role.updateOne({ deletedAt: moment().toISOString() });
        return res.successDelete(role);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const getRole = async (req, res) => {
    try {
        let { limit, pageNo, query, status, sortBy = "createdAt", sortOrder = "desc" } = req.query;

        limit = limit ? parseInt(limit) : 10;
        pageNo = pageNo ? parseInt(pageNo) : 1;
        sortBy = ["name", "status", "createdAt"].includes(String(sortBy)) ? String(sortBy) : "createdAt";
        sortOrder = ["asc", "desc"].includes(String(sortOrder).toLowerCase()) ? String(sortOrder).toLowerCase() : "desc";

        const filter = { deletedAt: null };
        if (query) filter.name = { $regex: escapeRegex(String(query)), $options: "i" };
        if (status !== null && status !== undefined && status !== "") {
            filter.isActive = Number(status) === 1;
        }

        const pipeline = [
            { $match: filter },
            { $project: { name: 1, status: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }, permissions: { $ifNull: ['$permissions', []] }, createdAt: 1 } }
        ];

        // Clone the pipeline and append `$count` for total count
        const totalCountPipeline = [...pipeline, { $count: 'total_count' }];

        // Query to get paginated results
        const resultsPipeline = [...pipeline, { $sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 } }, { $skip: (pageNo - 1) * limit }, { $limit: limit }];

        // Execute both pipelines
        const [results, totalCount] = await Promise.all([Role.aggregate(resultsPipeline), Role.aggregate(totalCountPipeline)]);

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

export const addPermission = async (req, res) => {
    try {
        const role = await Role.findOne({ _id: new mongoose.Types.ObjectId(`${req.params.id}`), deletedAt: null });
        if (!role) return res.noRecords();

        if (req.body.permissions === undefined || !Array.isArray(req.body.permissions)) {
            throw new Error("Permissions array is required.");
        }

        await Role.updateOne({ _id: role._id }, { permissions: req.body.permissions });
        return res.successUpdate(role);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const getSingleRole = async (req, res) => {
    try {
        const role = await Role.findOne({ _id: new mongoose.Types.ObjectId(`${req.params.id}`), deletedAt: null });
        if (!role) return res.noRecords();

        return res.success({ _id: role._id, name: role.name, status: role.isActive ? 1 : 0, permissions: role.permissions || [], createdAt: role.createdAt });
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};
