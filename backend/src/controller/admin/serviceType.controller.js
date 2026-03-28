import mongoose from "mongoose";
import moment from "moment";
import { ServiceCategory, ServiceType } from "../../models/index.js";
import { escapeRegex } from "../../helpers/utils.js";

const parseOptionalNumber = (v) => {
    if (v === undefined || v === null || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
};

export const createServiceType = async (req, res) => {
    try {
        const { categoryId, name, nameHi, estimatedTimeMinutes, basePrice, description, status = 1 } = req.body;
        if (!categoryId) return res.someThingWentWrong({ message: "Category is required." });
        if (!name?.trim()) return res.someThingWentWrong({ message: "Name is required." });

        const category = await ServiceCategory.findOne({ _id: new mongoose.Types.ObjectId(`${categoryId}`), deletedAt: null });
        if (!category) return res.someThingWentWrong({ message: "Category not found." });

        const normalizedName = name.trim();
        const exists = await ServiceType.findOne({
            categoryId: category._id,
            name: { $regex: `^${escapeRegex(normalizedName)}$`, $options: "i" },
            deletedAt: null
        });
        if (exists) throw new Error(`Service type "${normalizedName}" already exists in this category.`);

        const doc = await ServiceType.create({
            categoryId: category._id,
            name: normalizedName,
            nameHi: nameHi?.trim() || null,
            estimatedTimeMinutes: parseOptionalNumber(estimatedTimeMinutes),
            basePrice: parseOptionalNumber(basePrice),
            description: description?.trim() || null,
            isActive: Number(status) === 1
        });
        return res.successInsert(doc);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const updateServiceType = async (req, res) => {
    try {
        const doc = await ServiceType.findOne({ _id: new mongoose.Types.ObjectId(`${req.params.id}`), deletedAt: null });
        if (!doc) return res.noRecords();

        const { categoryId, name, nameHi, estimatedTimeMinutes, basePrice, description, status = 1 } = req.body;
        if (!categoryId) return res.someThingWentWrong({ message: "Category is required." });
        if (!name?.trim()) return res.someThingWentWrong({ message: "Name is required." });

        const category = await ServiceCategory.findOne({ _id: new mongoose.Types.ObjectId(`${categoryId}`), deletedAt: null });
        if (!category) return res.someThingWentWrong({ message: "Category not found." });

        const normalizedName = name.trim();
        const exists = await ServiceType.findOne({
            _id: { $ne: doc._id },
            categoryId: category._id,
            name: { $regex: `^${escapeRegex(normalizedName)}$`, $options: "i" },
            deletedAt: null
        });
        if (exists) throw new Error(`Service type "${normalizedName}" already exists in this category.`);

        await ServiceType.updateOne(
            { _id: doc._id },
            {
                categoryId: category._id,
                name: normalizedName,
                nameHi: nameHi?.trim() || null,
                estimatedTimeMinutes: parseOptionalNumber(estimatedTimeMinutes),
                basePrice: parseOptionalNumber(basePrice),
                description: description?.trim() || null,
                isActive: Number(status) === 1
            }
        );
        return res.successUpdate(doc);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const deleteServiceType = async (req, res) => {
    try {
        const doc = await ServiceType.findOne({ _id: new mongoose.Types.ObjectId(`${req.params.id}`), deletedAt: null });
        if (!doc) return res.noRecords();

        await doc.updateOne({ deletedAt: moment().toISOString() });
        return res.successDelete(doc);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const getServiceType = async (req, res) => {
    try {
        let { limit, pageNo, query, status, categoryId, sortBy = "createdAt", sortOrder = "desc" } = req.query;

        limit = limit ? parseInt(limit) : 10;
        pageNo = pageNo ? parseInt(pageNo) : 1;
        sortBy = ["name", "categoryName", "status", "createdAt", "estimatedTimeMinutes", "basePrice"].includes(String(sortBy))
            ? String(sortBy)
            : "createdAt";
        sortOrder = ["asc", "desc"].includes(String(sortOrder).toLowerCase()) ? String(sortOrder).toLowerCase() : "desc";

        const filter = { deletedAt: null };
        if (query) filter.name = { $regex: escapeRegex(String(query)), $options: "i" };
        if (status !== null && status !== undefined && status !== "") {
            filter.isActive = Number(status) === 1;
        }
        if (categoryId) {
            filter.categoryId = new mongoose.Types.ObjectId(`${categoryId}`);
        }

        const pipeline = [
            { $match: filter },
            { $lookup: { from: "servicecategories", localField: "categoryId", foreignField: "_id", as: "category" } },
            {
                $project: {
                    _id: 1,
                    categoryId: 1,
                    name: 1,
                    nameHi: 1,
                    estimatedTimeMinutes: 1,
                    basePrice: 1,
                    description: 1,
                    categoryName: { $ifNull: [{ $first: "$category.name" }, ""] },
                    status: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
                    createdAt: 1
                }
            }
        ];

        const totalCountPipeline = [...pipeline, { $count: "total_count" }];
        const resultsPipeline = [...pipeline, { $sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 } }, { $skip: (pageNo - 1) * limit }, { $limit: limit }];

        const [results, totalCount] = await Promise.all([ServiceType.aggregate(resultsPipeline), ServiceType.aggregate(totalCountPipeline)]);
        const total_count = totalCount.length > 0 ? totalCount[0].total_count : 0;

        if (results.length > 0) {
            return res.pagination(results, total_count, limit, pageNo);
        }
        return res.datatableNoRecords();
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const getSingleServiceType = async (req, res) => {
    try {
        const doc = await ServiceType.findOne({ _id: new mongoose.Types.ObjectId(`${req.params.id}`), deletedAt: null });
        if (!doc) return res.noRecords();

        return res.success({
            _id: doc._id,
            categoryId: String(doc.categoryId),
            name: doc.name,
            nameHi: doc.nameHi ?? "",
            estimatedTimeMinutes: doc.estimatedTimeMinutes ?? "",
            basePrice: doc.basePrice ?? "",
            description: doc.description ?? "",
            status: doc.isActive ? 1 : 0,
            createdAt: doc.createdAt
        });
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};
