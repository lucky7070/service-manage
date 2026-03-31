import mongoose from "mongoose";
import moment from "moment";
import { Country } from "../../models/index.js";
import { escapeRegex } from "../../helpers/utils.js";

export const createCountry = async (req, res) => {
    try {
        const { name, status = 1 } = req.body;
        if (!name?.trim()) return res.someThingWentWrong({ message: "Country name is required." });

        const normalizedName = name.trim();
        const exists = await Country.findOne({ name: { $regex: `^${escapeRegex(normalizedName)}$`, $options: "i" }, deletedAt: null });
        if (exists) throw new Error(`Country with name "${normalizedName}" already exists.`);

        const country = await Country.create({ name: normalizedName, isActive: Number(status) === 1 });
        return res.successInsert(country);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const updateCountry = async (req, res) => {
    try {
        const country = await Country.findOne({ _id: new mongoose.Types.ObjectId(String(req.params.id)), deletedAt: null });
        if (!country) return res.noRecords();

        const { name, status = 1 } = req.body;
        if (!name?.trim()) return res.someThingWentWrong({ message: "Country name is required." });

        const normalizedName = name.trim();
        const exists = await Country.findOne({
            _id: { $ne: country._id },
            name: { $regex: `^${escapeRegex(normalizedName)}$`, $options: "i" },
            deletedAt: null
        });
        if (exists) throw new Error(`Country with name "${normalizedName}" already exists.`);

        await Country.updateOne({ _id: country._id }, { name: normalizedName, isActive: Number(status) === 1 });
        return res.successUpdate(country);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const deleteCountry = async (req, res) => {
    try {
        const country = await Country.findOne({ _id: new mongoose.Types.ObjectId(String(req.params.id)), deletedAt: null });
        if (!country) return res.noRecords();

        await country.updateOne({ deletedAt: moment().toISOString() });
        return res.successDelete(country);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const getCountry = async (req, res) => {
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
            { $project: { name: 1, status: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] }, createdAt: 1 } }
        ];

        const totalCountPipeline = [...pipeline, { $count: "total_count" }];
        const resultsPipeline = [...pipeline, { $sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 } }, { $skip: (pageNo - 1) * limit }, { $limit: limit }];

        const [results, totalCount] = await Promise.all([Country.aggregate(resultsPipeline), Country.aggregate(totalCountPipeline)]);
        const total_count = totalCount.length > 0 ? totalCount[0].total_count : 0;

        if (results.length > 0) {
            return res.pagination(results, total_count, limit, pageNo);
        }
        return res.datatableNoRecords();
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const getSingleCountry = async (req, res) => {
    try {
        const country = await Country.findOne({ _id: new mongoose.Types.ObjectId(String(req.params.id)), deletedAt: null });
        if (!country) return res.noRecords();

        return res.success({ _id: country._id, name: country.name, status: country.isActive ? 1 : 0, createdAt: country.createdAt });
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

