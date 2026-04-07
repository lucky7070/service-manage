import mongoose from "mongoose";
import moment from "moment";
import { Banner } from "../../models/index.js";
import { escapeRegex } from "../../helpers/utils.js";
import { deleteFile } from "../../libraries/storage.js";

export const createBanner = async (req, res) => {
    try {

        if (!req.file) return res.someThingWentWrong({ message: "Banner image is required." });

        const { bannerTitle = "", bannerTitleHi = "", bannerSubtitle = "", bannerSubtitleHi = "", bannerType = "homepage", link = "", displayOrder = 0 } = req.body;
        const doc = await Banner.create({
            bannerTitle: String(bannerTitle).trim() || null,
            bannerTitleHi: String(bannerTitleHi).trim() || null,
            bannerSubtitle: String(bannerSubtitle).trim() || null,
            bannerSubtitleHi: String(bannerSubtitleHi).trim() || null,
            bannerImage: `/banners/${req.file.filename}`,
            bannerType: String(bannerType ?? "homepage"),
            link: String(link).trim() || null,
            displayOrder: Number(displayOrder) || 0,
            createdBy: req.admin._id,
            updatedBy: req.admin._id
        });
        return res.successInsert(doc);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const updateBanner = async (req, res) => {
    try {
        const doc = await Banner.findOne({ _id: new mongoose.Types.ObjectId(String(req.params.id)), deletedAt: null });
        if (!doc) return res.noRecords();

        const { bannerTitle = "", bannerTitleHi = "", bannerSubtitle = "", bannerSubtitleHi = "", bannerType = "homepage", link = "", displayOrder = 0 } = req.body;
        let bannerImage = doc.bannerImage;
        if (req.file) {
            if (doc.bannerImage) deleteFile(doc.bannerImage);
            bannerImage = `/banners/${req.file.filename}`;
        }

        await Banner.updateOne(
            { _id: doc._id },
            {
                bannerTitle: String(bannerTitle).trim() || null,
                bannerTitleHi: String(bannerTitleHi).trim() || null,
                bannerSubtitle: String(bannerSubtitle).trim() || null,
                bannerSubtitleHi: String(bannerSubtitleHi).trim() || null,
                bannerImage,
                bannerType: String(bannerType ?? "homepage"),
                link: String(link).trim() || null,
                displayOrder: Number(displayOrder) || 0,
                updatedBy: req.admin._id
            }
        );
        return res.successUpdate(doc);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const deleteBanner = async (req, res) => {
    try {
        const doc = await Banner.findOne({ _id: new mongoose.Types.ObjectId(String(req.params.id)), deletedAt: null });
        if (!doc) return res.noRecords();

        await doc.updateOne({ deletedAt: moment().toISOString(), updatedBy: req.admin._id });
        return res.successDelete(doc);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const getBanner = async (req, res) => {
    try {
        let { limit, pageNo, query, bannerType, sortBy = "displayOrder", sortOrder = "asc" } = req.query;
        limit = limit ? parseInt(limit, 10) : 10;
        pageNo = pageNo ? parseInt(pageNo, 10) : 1;
        sortBy = ["bannerTitle", "bannerType", "displayOrder", "createdAt"].includes(String(sortBy)) ? String(sortBy) : "displayOrder";
        sortOrder = ["asc", "desc"].includes(String(sortOrder).toLowerCase()) ? String(sortOrder).toLowerCase() : "asc";

        const filter = { deletedAt: null };
        if (query) {
            const q = escapeRegex(String(query));
            filter.$or = [{ bannerTitle: { $regex: q, $options: "i" } }, { bannerSubtitle: { $regex: q, $options: "i" } }];
        }
        if (bannerType && ["homepage", "category"].includes(String(bannerType))) filter.bannerType = String(bannerType);

        const pipeline = [
            { $match: filter },
            { $project: { _id: 1, bannerTitle: 1, bannerTitleHi: 1, bannerSubtitle: 1, bannerSubtitleHi: 1, bannerImage: 1, bannerType: 1, link: 1, displayOrder: 1, createdAt: 1 } }
        ];

        const totalCountPipeline = [...pipeline, { $count: "total_count" }];
        const resultsPipeline = [...pipeline, { $sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 } }, { $skip: (pageNo - 1) * limit }, { $limit: limit }];
        const [results, totalCount] = await Promise.all([Banner.aggregate(resultsPipeline), Banner.aggregate(totalCountPipeline)]);
        const total_count = totalCount.length > 0 ? totalCount[0].total_count : 0;
        if (results.length > 0) return res.pagination(results, total_count, limit, pageNo);
        return res.datatableNoRecords();
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

