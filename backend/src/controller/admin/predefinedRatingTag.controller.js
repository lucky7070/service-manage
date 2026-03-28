import mongoose from "mongoose";
import moment from "moment";
import { PredefinedRatingTag } from "../../models/index.js";
import { escapeRegex } from "../../helpers/utils.js";

const ALLOWED_TAG_FOR = ["customer", "provider"];
const ALLOWED_TAG_TYPE = ["positive", "negative", "neutral"];

export const createPredefinedRatingTag = async (req, res) => {
    try {
        const { tagFor, tagName, tagType = "positive", status = 1 } = req.body;
        if (!tagFor || !ALLOWED_TAG_FOR.includes(tagFor)) return res.someThingWentWrong({ message: "Invalid tag for." });
        if (!tagName?.trim()) return res.someThingWentWrong({ message: "Tag name is required." });
        if (!ALLOWED_TAG_TYPE.includes(tagType)) return res.someThingWentWrong({ message: "Invalid tag type." });

        const normalized = tagName.trim();
        const exists = await PredefinedRatingTag.findOne({
            tagFor,
            tagName: { $regex: `^${escapeRegex(normalized)}$`, $options: "i" },
            deletedAt: null
        });
        if (exists) throw new Error(`A tag with this name already exists for ${tagFor}.`);

        const doc = await PredefinedRatingTag.create({
            tagFor,
            tagName: normalized,
            tagType,
            isActive: Number(status) === 1
        });
        return res.successInsert(doc);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const updatePredefinedRatingTag = async (req, res) => {
    try {
        const doc = await PredefinedRatingTag.findOne({ _id: new mongoose.Types.ObjectId(`${req.params.id}`), deletedAt: null });
        if (!doc) return res.noRecords();

        const { tagFor, tagName, tagType = "positive", status = 1 } = req.body;
        if (!tagFor || !ALLOWED_TAG_FOR.includes(tagFor)) return res.someThingWentWrong({ message: "Invalid tag for." });
        if (!tagName?.trim()) return res.someThingWentWrong({ message: "Tag name is required." });
        if (!ALLOWED_TAG_TYPE.includes(tagType)) return res.someThingWentWrong({ message: "Invalid tag type." });

        const normalized = tagName.trim();
        const exists = await PredefinedRatingTag.findOne({
            _id: { $ne: doc._id },
            tagFor,
            tagName: { $regex: `^${escapeRegex(normalized)}$`, $options: "i" },
            deletedAt: null
        });
        if (exists) throw new Error(`A tag with this name already exists for ${tagFor}.`);

        await PredefinedRatingTag.updateOne(
            { _id: doc._id },
            { tagFor, tagName: normalized, tagType, isActive: Number(status) === 1 }
        );
        return res.successUpdate(doc);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const deletePredefinedRatingTag = async (req, res) => {
    try {
        const doc = await PredefinedRatingTag.findOne({ _id: new mongoose.Types.ObjectId(`${req.params.id}`), deletedAt: null });
        if (!doc) return res.noRecords();

        await doc.updateOne({ deletedAt: moment().toISOString() });
        return res.successDelete(doc);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const getPredefinedRatingTag = async (req, res) => {
    try {
        let { limit, pageNo, query, status, tagFor, sortBy = "createdAt", sortOrder = "desc" } = req.query;

        limit = limit ? parseInt(limit) : 10;
        pageNo = pageNo ? parseInt(pageNo) : 1;
        sortBy = ["tagName", "tagFor", "tagType", "status", "createdAt"].includes(String(sortBy)) ? String(sortBy) : "createdAt";
        sortOrder = ["asc", "desc"].includes(String(sortOrder).toLowerCase()) ? String(sortOrder).toLowerCase() : "desc";

        const filter = { deletedAt: null };
        if (query) filter.tagName = { $regex: escapeRegex(String(query)), $options: "i" };
        if (status !== null && status !== undefined && status !== "") {
            filter.isActive = Number(status) === 1;
        }
        if (tagFor && ALLOWED_TAG_FOR.includes(String(tagFor))) {
            filter.tagFor = String(tagFor);
        }

        const pipeline = [
            { $match: filter },
            {
                $project: {
                    _id: 1,
                    tagFor: 1,
                    tagName: 1,
                    tagType: 1,
                    status: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
                    createdAt: 1
                }
            }
        ];

        const totalCountPipeline = [...pipeline, { $count: "total_count" }];
        const resultsPipeline = [...pipeline, { $sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 } }, { $skip: (pageNo - 1) * limit }, { $limit: limit }];

        const [results, totalCount] = await Promise.all([
            PredefinedRatingTag.aggregate(resultsPipeline),
            PredefinedRatingTag.aggregate(totalCountPipeline)
        ]);
        const total_count = totalCount.length > 0 ? totalCount[0].total_count : 0;

        if (results.length > 0) {
            return res.pagination(results, total_count, limit, pageNo);
        }
        return res.datatableNoRecords();
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const getSinglePredefinedRatingTag = async (req, res) => {
    try {
        const doc = await PredefinedRatingTag.findOne({ _id: new mongoose.Types.ObjectId(`${req.params.id}`), deletedAt: null });
        if (!doc) return res.noRecords();

        return res.success({
            _id: doc._id,
            tagFor: doc.tagFor,
            tagName: doc.tagName,
            tagType: doc.tagType,
            status: doc.isActive ? 1 : 0,
            createdAt: doc.createdAt
        });
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};
