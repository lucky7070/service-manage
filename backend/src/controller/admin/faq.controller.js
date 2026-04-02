import mongoose from "mongoose";
import moment from "moment";
import { Faq } from "../../models/index.js";
import { escapeRegex } from "../../helpers/utils.js";

export const createFaq = async (req, res) => {
    try {
        const { question, answer, displayOrder = 0, status = 1 } = req.body;

        const doc = await Faq.create({
            question: String(question).trim(),
            answer: String(answer).trim(),
            displayOrder: Number(displayOrder) || 0,
            isActive: Number(status) === 1,
            createdBy: req.admin?.id || null,
            updatedBy: req.admin?.id || null
        });
        return res.successInsert(doc);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const updateFaq = async (req, res) => {
    try {
        const doc = await Faq.findOne({ _id: new mongoose.Types.ObjectId(String(req.params.id)), deletedAt: null });
        if (!doc) return res.noRecords();

        const { question, answer, displayOrder = 0, status = 1 } = req.body;
        await Faq.updateOne(
            { _id: doc._id },
            {
                question: String(question).trim(),
                answer: String(answer).trim(),
                displayOrder: Number(displayOrder) || 0,
                isActive: Number(status) === 1,
                updatedBy: req.admin?.id || null
            }
        );
        return res.successUpdate(doc);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const deleteFaq = async (req, res) => {
    try {
        const doc = await Faq.findOne({ _id: new mongoose.Types.ObjectId(String(req.params.id)), deletedAt: null });
        if (!doc) return res.noRecords();

        await doc.updateOne({ deletedAt: moment().toISOString(), updatedBy: req.admin?.id || null });
        return res.successDelete(doc);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const getFaq = async (req, res) => {
    try {
        let { limit, pageNo, query, status, sortBy = "createdAt", sortOrder = "desc" } = req.query;
        limit = limit ? parseInt(limit, 10) : 10;
        pageNo = pageNo ? parseInt(pageNo, 10) : 1;
        sortBy = ["question", "displayOrder", "status", "createdAt"].includes(String(sortBy)) ? String(sortBy) : "createdAt";
        sortOrder = ["asc", "desc"].includes(String(sortOrder).toLowerCase()) ? String(sortOrder).toLowerCase() : "desc";

        const filter = { deletedAt: null };
        if (query) filter.question = { $regex: escapeRegex(String(query)), $options: "i" };
        if (status !== null && status !== undefined && status !== "") filter.isActive = Number(status) === 1;

        const pipeline = [
            { $match: filter },
            {
                $project: {
                    _id: 1,
                    question: 1,
                    answer: 1,
                    displayOrder: 1,
                    status: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
                    createdAt: 1
                }
            }
        ];

        const totalCountPipeline = [...pipeline, { $count: "total_count" }];
        const resultsPipeline = [...pipeline, { $sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 } }, { $skip: (pageNo - 1) * limit }, { $limit: limit }];
        const [results, totalCount] = await Promise.all([Faq.aggregate(resultsPipeline), Faq.aggregate(totalCountPipeline)]);
        const total_count = totalCount.length > 0 ? totalCount[0].total_count : 0;

        if (results.length > 0) return res.pagination(results, total_count, limit, pageNo);
        return res.datatableNoRecords();
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const getSingleFaq = async (req, res) => {
    try {
        const doc = await Faq.findOne({ _id: new mongoose.Types.ObjectId(String(req.params.id)), deletedAt: null });
        if (!doc) return res.noRecords();

        return res.success({ _id: doc._id, question: doc.question, answer: doc.answer, displayOrder: doc.displayOrder || 0, status: doc.isActive ? 1 : 0, createdAt: doc.createdAt });
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

