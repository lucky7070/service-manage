import { Enquiry } from "../../models/index.js";
import { escapeRegex } from "../../helpers/utils.js";
import mongoose from "mongoose";
import moment from "moment";

export const getEnquiry = async (req, res) => {
    try {
        let { limit, pageNo, query, isResolved, sortBy = "createdAt", sortOrder = "desc" } = req.query;

        limit = limit ? parseInt(limit, 10) : 10;
        pageNo = pageNo ? parseInt(pageNo, 10) : 1;
        sortBy = ["name", "email", "phone", "isResolved", "createdAt"].includes(String(sortBy)) ? String(sortBy) : "createdAt";
        sortOrder = ["asc", "desc"].includes(String(sortOrder).toLowerCase()) ? String(sortOrder).toLowerCase() : "desc";

        const filter = { deletedAt: null };
        if (query) {
            const q = escapeRegex(String(query));
            filter.$or = [
                { name: { $regex: q, $options: "i" } },
                { email: { $regex: q, $options: "i" } },
                { phone: { $regex: q, $options: "i" } },
                { message: { $regex: q, $options: "i" } }
            ];
        }
        if (isResolved !== undefined && isResolved !== null && String(isResolved) !== "") {
            filter.isResolved = [1, "1", true, "true"].includes(isResolved);
        }

        const pipeline = [
            { $match: filter },
            { $project: { _id: 1, name: 1, email: 1, phone: 1, message: 1, isResolved: 1, resolvedAt: 1, createdAt: 1 } }
        ];

        const totalCountPipeline = [...pipeline, { $count: "total_count" }];
        const resultsPipeline = [
            ...pipeline,
            { $sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 } },
            { $skip: (pageNo - 1) * limit },
            { $limit: limit }
        ];

        const [results, totalCount] = await Promise.all([
            Enquiry.aggregate(resultsPipeline),
            Enquiry.aggregate(totalCountPipeline)
        ]);
        const total_count = totalCount.length > 0 ? totalCount[0].total_count : 0;

        if (results.length > 0) return res.pagination(results, total_count, limit, pageNo);
        return res.datatableNoRecords();
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const resolveEnquiry = async (req, res) => {
    try {
        const doc = await Enquiry.findById(new mongoose.Types.ObjectId(String(req.params.id)));
        if (!doc) return res.noRecords();

        const nextResolved = [1, "1", true, "true"].includes(req.body.isResolved);
        await doc.updateOne({
            isResolved: nextResolved,
            resolvedAt: nextResolved ? new Date() : null,
            resolvedBy: nextResolved ? req.admin?.id || null : null
        });

        return res.successUpdate({}, nextResolved ? "Enquiry marked as resolved." : "Enquiry marked as unresolved.");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const deleteEnquiry = async (req, res) => {
    try {
        const doc = await Enquiry.findOne({ _id: new mongoose.Types.ObjectId(String(req.params.id)), deletedAt: null });
        if (!doc) return res.noRecords();

        await doc.updateOne({ deletedAt: moment().toISOString() });
        return res.successDelete({}, "Enquiry deleted successfully.");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

