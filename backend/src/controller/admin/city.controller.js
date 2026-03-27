import mongoose from "mongoose";
import moment from "moment";
import { City, Country, State } from "../../models/index.js";
import { escapeRegex } from "../../helpers/utils.js";

export const createCity = async (req, res) => {
    try {
        const { countryId, stateId, name, status = 1 } = req.body;
        if (!countryId) return res.someThingWentWrong({ message: "Country is required." });
        if (!stateId) return res.someThingWentWrong({ message: "State is required." });
        if (!name?.trim()) return res.someThingWentWrong({ message: "City name is required." });

        const country = await Country.findOne({ _id: new mongoose.Types.ObjectId(`${countryId}`), deletedAt: null });
        if (!country) return res.noRecords({ message: "Country not found." });

        const state = await State.findOne({ _id: new mongoose.Types.ObjectId(`${stateId}`), countryId: country._id, deletedAt: null });
        if (!state) return res.noRecords({ message: "State not found for selected country." });

        const normalizedName = name.trim();
        const exists = await City.findOne({
            countryId: country._id,
            stateId: state._id,
            name: { $regex: `^${escapeRegex(normalizedName)}$`, $options: "i" },
            deletedAt: null
        });
        if (exists) throw new Error(`City with name "${normalizedName}" already exists for selected state.`);

        const city = await City.create({ countryId: country._id, stateId: state._id, name: normalizedName, isActive: Number(status) === 1 });
        return res.successInsert(city);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const updateCity = async (req, res) => {
    try {
        const city = await City.findOne({ _id: new mongoose.Types.ObjectId(`${req.params.id}`), deletedAt: null });
        if (!city) return res.noRecords();

        const { countryId, stateId, name, status = 1 } = req.body;
        if (!countryId) return res.someThingWentWrong({ message: "Country is required." });
        if (!stateId) return res.someThingWentWrong({ message: "State is required." });
        if (!name?.trim()) return res.someThingWentWrong({ message: "City name is required." });

        const country = await Country.findOne({ _id: new mongoose.Types.ObjectId(`${countryId}`), deletedAt: null });
        if (!country) return res.noRecords({ message: "Country not found." });

        const state = await State.findOne({ _id: new mongoose.Types.ObjectId(`${stateId}`), countryId: country._id, deletedAt: null });
        if (!state) return res.noRecords({ message: "State not found for selected country." });

        const normalizedName = name.trim();
        const exists = await City.findOne({
            _id: { $ne: city._id },
            countryId: country._id,
            stateId: state._id,
            name: { $regex: `^${escapeRegex(normalizedName)}$`, $options: "i" },
            deletedAt: null
        });
        if (exists) throw new Error(`City with name "${normalizedName}" already exists for selected state.`);

        await City.updateOne({ _id: city._id }, { countryId: country._id, stateId: state._id, name: normalizedName, isActive: Number(status) === 1 });
        return res.successUpdate(city);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const deleteCity = async (req, res) => {
    try {
        const city = await City.findOne({ _id: new mongoose.Types.ObjectId(`${req.params.id}`), deletedAt: null });
        if (!city) return res.noRecords();

        await city.updateOne({ deletedAt: moment().toISOString() });
        return res.successDelete(city);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const getCity = async (req, res) => {
    try {
        let { limit, pageNo, query, status, countryId, stateId, sortBy = "createdAt", sortOrder = "desc" } = req.query;

        limit = limit ? parseInt(limit) : 10;
        pageNo = pageNo ? parseInt(pageNo) : 1;
        sortBy = ["name", "countryName", "stateName", "status", "createdAt"].includes(String(sortBy)) ? String(sortBy) : "createdAt";
        sortOrder = ["asc", "desc"].includes(String(sortOrder).toLowerCase()) ? String(sortOrder).toLowerCase() : "desc";

        const filter = { deletedAt: null };
        if (query) filter.name = { $regex: escapeRegex(String(query)), $options: "i" };
        if (status !== null && status !== undefined && status !== "") filter.isActive = Number(status) === 1;
        if (countryId) filter.countryId = new mongoose.Types.ObjectId(`${countryId}`);
        if (stateId) filter.stateId = new mongoose.Types.ObjectId(`${stateId}`);

        const pipeline = [
            { $match: filter },
            { $lookup: { from: "countries", localField: "countryId", foreignField: "_id", as: "country" } },
            { $lookup: { from: "states", localField: "stateId", foreignField: "_id", as: "state" } },
            {
                $project: {
                    name: 1,
                    countryId: 1,
                    stateId: 1,
                    countryName: { $first: "$country.name" },
                    stateName: { $first: "$state.name" },
                    status: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
                    createdAt: 1
                }
            }
        ];

        const totalCountPipeline = [...pipeline, { $count: "total_count" }];
        const resultsPipeline = [...pipeline, { $sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 } }, { $skip: (pageNo - 1) * limit }, { $limit: limit }];

        const [results, totalCount] = await Promise.all([City.aggregate(resultsPipeline), City.aggregate(totalCountPipeline)]);
        const total_count = totalCount.length > 0 ? totalCount[0].total_count : 0;

        if (results.length > 0) {
            return res.pagination(results, total_count, limit, pageNo);
        }
        return res.datatableNoRecords();
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const getSingleCity = async (req, res) => {
    try {
        const city = await City.findOne({ _id: new mongoose.Types.ObjectId(`${req.params.id}`), deletedAt: null });
        if (!city) return res.noRecords();

        return res.success({
            _id: city._id,
            countryId: city.countryId,
            stateId: city.stateId,
            name: city.name,
            status: city.isActive ? 1 : 0,
            createdAt: city.createdAt
        });
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

