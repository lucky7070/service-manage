import mongoose from "mongoose";
import moment from "moment";
import { Country, State } from "../../models/index.js";
import { escapeRegex } from "../../helpers/utils.js";

export const createState = async (req, res) => {
    try {
        const { countryId, name, status = 1 } = req.body;
        if (!countryId) return res.someThingWentWrong({ message: "Country is required." });
        if (!name?.trim()) return res.someThingWentWrong({ message: "State name is required." });

        const country = await Country.findOne({ _id: new mongoose.Types.ObjectId(`${countryId}`), deletedAt: null });
        if (!country) return res.noRecords({ message: "Country not found." });

        const normalizedName = name.trim();
        const exists = await State.findOne({
            countryId: country._id,
            name: { $regex: `^${escapeRegex(normalizedName)}$`, $options: "i" },
            deletedAt: null
        });
        if (exists) throw new Error(`State with name "${normalizedName}" already exists for selected country.`);

        const state = await State.create({ countryId: country._id, name: normalizedName, isActive: Number(status) === 1 });
        return res.successInsert(state);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const updateState = async (req, res) => {
    try {
        const state = await State.findOne({ _id: new mongoose.Types.ObjectId(String(req.params.id)), deletedAt: null });
        if (!state) return res.noRecords();

        const { countryId, name, status = 1 } = req.body;
        if (!countryId) return res.someThingWentWrong({ message: "Country is required." });
        if (!name?.trim()) return res.someThingWentWrong({ message: "State name is required." });

        const country = await Country.findOne({ _id: new mongoose.Types.ObjectId(`${countryId}`), deletedAt: null });
        if (!country) return res.noRecords({ message: "Country not found." });

        const normalizedName = name.trim();
        const exists = await State.findOne({
            _id: { $ne: state._id },
            countryId: country._id,
            name: { $regex: `^${escapeRegex(normalizedName)}$`, $options: "i" },
            deletedAt: null
        });
        if (exists) throw new Error(`State with name "${normalizedName}" already exists for selected country.`);

        await State.updateOne({ _id: state._id }, { countryId: country._id, name: normalizedName, isActive: Number(status) === 1 });
        return res.successUpdate(state);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const deleteState = async (req, res) => {
    try {
        const state = await State.findOne({ _id: new mongoose.Types.ObjectId(String(req.params.id)), deletedAt: null });
        if (!state) return res.noRecords();

        await state.updateOne({ deletedAt: moment().toISOString() });
        return res.successDelete(state);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const getState = async (req, res) => {
    try {
        let { limit, pageNo, query, status, countryId, sortBy = "createdAt", sortOrder = "desc" } = req.query;

        limit = limit ? parseInt(limit) : 10;
        pageNo = pageNo ? parseInt(pageNo) : 1;
        sortBy = ["name", "countryName", "status", "createdAt"].includes(String(sortBy)) ? String(sortBy) : "createdAt";
        sortOrder = ["asc", "desc"].includes(String(sortOrder).toLowerCase()) ? String(sortOrder).toLowerCase() : "desc";

        const filter = { deletedAt: null };
        if (query) filter.name = { $regex: escapeRegex(String(query)), $options: "i" };
        if (status !== null && status !== undefined && status !== "") filter.isActive = Number(status) === 1;
        if (countryId) filter.countryId = new mongoose.Types.ObjectId(`${countryId}`);

        const pipeline = [
            { $match: filter },
            {
                $lookup: {
                    from: "countries",
                    localField: "countryId",
                    foreignField: "_id",
                    as: "country"
                }
            },
            { $project: { name: 1, countryId: 1, countryName: { $first: "$country.name" }, status: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] }, createdAt: 1 } }
        ];

        const totalCountPipeline = [...pipeline, { $count: "total_count" }];
        const resultsPipeline = [...pipeline, { $sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 } }, { $skip: (pageNo - 1) * limit }, { $limit: limit }];

        const [results, totalCount] = await Promise.all([State.aggregate(resultsPipeline), State.aggregate(totalCountPipeline)]);
        const total_count = totalCount.length > 0 ? totalCount[0].total_count : 0;

        if (results.length > 0) {
            return res.pagination(results, total_count, limit, pageNo);
        }
        return res.datatableNoRecords();
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const getSingleState = async (req, res) => {
    try {
        const state = await State.findOne({ _id: new mongoose.Types.ObjectId(String(req.params.id)), deletedAt: null });
        if (!state) return res.noRecords();

        return res.success({
            _id: state._id,
            countryId: state.countryId,
            name: state.name,
            status: state.isActive ? 1 : 0,
            createdAt: state.createdAt
        });
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

