import mongoose from "mongoose";
import moment from "moment";
import { CmsPage } from "../../models/index.js";
import { escapeRegex } from "../../helpers/utils.js";

export const createCmsPage = async (req, res) => {
    try {
        const { pageSlug, pageTitle, pageTitleHi = "", metaDescription = "", metaKeywords = "", content = "", contentHi = "", viewCount = 0 } = req.body;

        const doc = await CmsPage.create({
            pageSlug: String(pageSlug).trim().toLowerCase(),
            pageTitle: String(pageTitle).trim(),
            pageTitleHi: String(pageTitleHi).trim() || null,
            metaDescription: String(metaDescription).trim() || null,
            metaKeywords: String(metaKeywords).trim() || null,
            content: String(content).trim() || null,
            contentHi: String(contentHi).trim() || null,
            viewCount: Number(viewCount) || 0,
            updatedBy: req.admin?.id || null
        });
        return res.successInsert(doc);
    } catch (error) {
        if (error?.code === 11000) return res.someThingWentWrong({ message: "Page slug already exists." });
        return res.someThingWentWrong(error);
    }
};

export const updateCmsPage = async (req, res) => {
    try {
        const doc = await CmsPage.findOne({ _id: new mongoose.Types.ObjectId(String(req.params.id)), deletedAt: null });
        if (!doc) return res.noRecords();

        const { pageTitle, pageTitleHi = "", metaDescription = "", metaKeywords = "", content = "", contentHi = "", viewCount = 0 } = req.body;

        await CmsPage.updateOne(
            { _id: doc._id },
            {
                pageTitle: String(pageTitle).trim(),
                pageTitleHi: String(pageTitleHi).trim() || null,
                metaDescription: String(metaDescription).trim() || null,
                metaKeywords: String(metaKeywords).trim() || null,
                content: String(content).trim() || null,
                contentHi: String(contentHi).trim() || null,
                viewCount: Number(viewCount) || 0,
                updatedBy: req.admin?.id || null
            }
        );
        return res.successUpdate(doc);
    } catch (error) {
        if (error?.code === 11000) return res.someThingWentWrong({ message: "Page slug already exists." });
        return res.someThingWentWrong(error);
    }
};

export const deleteCmsPage = async (req, res) => {
    try {
        const doc = await CmsPage.findOne({ _id: new mongoose.Types.ObjectId(String(req.params.id)), deletedAt: null });
        if (!doc) return res.noRecords();

        await doc.updateOne({ deletedAt: moment().toISOString(), updatedBy: req.admin?.id || null });
        return res.successDelete(doc);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const getCmsPages = async (req, res) => {
    try {
        let { limit, pageNo, query, sortBy = "updatedAt", sortOrder = "desc" } = req.query;
        limit = limit ? parseInt(limit, 10) : 10;
        pageNo = pageNo ? parseInt(pageNo, 10) : 1;
        sortBy = ["pageTitle", "pageSlug", "viewCount", "createdAt", "updatedAt"].includes(String(sortBy)) ? String(sortBy) : "updatedAt";
        sortOrder = ["asc", "desc"].includes(String(sortOrder).toLowerCase()) ? String(sortOrder).toLowerCase() : "desc";

        const filter = { deletedAt: null };
        if (query) {
            const q = escapeRegex(String(query));
            filter.$or = [{ pageTitle: { $regex: q, $options: "i" } }, { pageSlug: { $regex: q, $options: "i" } }];
        }

        const pipeline = [
            { $match: filter },
            { $project: { _id: 1, pageSlug: 1, pageTitle: 1, pageTitleHi: 1, viewCount: 1, createdAt: 1, updatedAt: 1 } }
        ];

        const totalCountPipeline = [...pipeline, { $count: "total_count" }];
        const resultsPipeline = [...pipeline, { $sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 } }, { $skip: (pageNo - 1) * limit }, { $limit: limit }];
        const [results, totalCount] = await Promise.all([CmsPage.aggregate(resultsPipeline), CmsPage.aggregate(totalCountPipeline)]);
        const total_count = totalCount.length > 0 ? totalCount[0].total_count : 0;

        if (results.length > 0) return res.pagination(results, total_count, limit, pageNo);
        return res.datatableNoRecords();
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const getSingleCmsPage = async (req, res) => {
    try {
        const doc = await CmsPage.findOne({ _id: new mongoose.Types.ObjectId(String(req.params.id)), deletedAt: null });
        if (!doc) return res.noRecords();

        return res.success({ _id: doc._id, pageSlug: doc.pageSlug, pageTitle: doc.pageTitle, pageTitleHi: doc.pageTitleHi || "", metaDescription: doc.metaDescription || "", metaKeywords: doc.metaKeywords || "", content: doc.content || "", contentHi: doc.contentHi || "", viewCount: doc.viewCount || 0, createdAt: doc.createdAt, updatedAt: doc.updatedAt });
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

