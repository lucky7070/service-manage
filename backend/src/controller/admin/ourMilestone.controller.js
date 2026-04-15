import mongoose from "mongoose";
import moment from "moment";
import { OurMilestone } from "../../models/index.js";
import { escapeRegex } from "../../helpers/utils.js";

export const createOurMilestone = async (req, res) => {
    try {
        const { year, event, displayOrder = 0, status = 1 } = req.body;
        const doc = await OurMilestone.create({
            year: String(year).trim(),
            event: String(event).trim(),
            displayOrder: Number(displayOrder) || 0,
            isActive: Number(status) === 1,
            createdBy: req.admin._id,
            updatedBy: req.admin._id
        });
        return res.successInsert(doc);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const updateOurMilestone = async (req, res) => {
    try {
        const doc = await OurMilestone.findOne({ _id: new mongoose.Types.ObjectId(String(req.params.id)), deletedAt: null });
        if (!doc) return res.noRecords();
        const { year, event, displayOrder = 0, status = 1 } = req.body;
        await OurMilestone.updateOne(
            { _id: doc._id },
            {
                year: String(year).trim(),
                event: String(event).trim(),
                displayOrder: Number(displayOrder) || 0,
                isActive: Number(status) === 1,
                updatedBy: req.admin._id
            }
        );
        return res.successUpdate(doc);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const deleteOurMilestone = async (req, res) => {
    try {
        const doc = await OurMilestone.findOne({ _id: new mongoose.Types.ObjectId(String(req.params.id)), deletedAt: null });
        if (!doc) return res.noRecords();
        await doc.updateOne({ deletedAt: moment().toISOString(), updatedBy: req.admin._id });
        return res.successDelete(doc);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const getOurMilestones = async (req, res) => {
    try {
        let { limit, pageNo, query, status, sortBy = "displayOrder", sortOrder = "asc" } = req.query;
        limit = limit ? parseInt(limit, 10) : 10;
        pageNo = pageNo ? parseInt(pageNo, 10) : 1;
        sortBy = ["year", "displayOrder", "status", "createdAt"].includes(String(sortBy)) ? String(sortBy) : "displayOrder";
        sortOrder = ["asc", "desc"].includes(String(sortOrder).toLowerCase()) ? String(sortOrder).toLowerCase() : "asc";

        const filter = { deletedAt: null };
        if (query) filter.$or = [{ year: { $regex: escapeRegex(String(query)), $options: "i" } }, { event: { $regex: escapeRegex(String(query)), $options: "i" } }];
        if (status !== null && status !== undefined && status !== "") filter.isActive = Number(status) === 1;

        const pipeline = [
            { $match: filter },
            { $project: { _id: 1, year: 1, event: 1, displayOrder: 1, status: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] }, createdAt: 1 } }
        ];

        const [results, totalCount] = await Promise.all([
            OurMilestone.aggregate([...pipeline, { $sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 } }, { $skip: (pageNo - 1) * limit }, { $limit: limit }]),
            OurMilestone.aggregate([...pipeline, { $count: "total_count" }])
        ]);
        const total_count = totalCount.length > 0 ? totalCount[0].total_count : 0;
        if (results.length > 0) return res.pagination(results, total_count, limit, pageNo);
        return res.datatableNoRecords();
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

