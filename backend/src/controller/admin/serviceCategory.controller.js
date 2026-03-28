import mongoose from "mongoose";
import moment from "moment";
import { ServiceCategory } from "../../models/index.js";
import { escapeRegex } from "../../helpers/utils.js";
import { deleteFile } from "../../libraries/storage.js";

const slugify = (s) =>
    String(s || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 100);

/** For service type dropdowns & filters */
export const listServiceCategoriesForSelect = async (req, res) => {
    try {
        const rows = await ServiceCategory.find({ deletedAt: null, isActive: true })
            .select("_id name slug")
            .sort({ displayOrder: 1, name: 1 })
            .limit(500)
            .lean();

        return res.success({ record: rows });
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const createServiceCategory = async (req, res) => {
    try {
        const { slug: slugIn, name, nameHi, description, displayOrder = 0, status = 1 } = req.body;
        if (!name?.trim()) return res.someThingWentWrong({ message: "Name is required." });

        const slug = slugify(slugIn || name);
        if (!slug) return res.someThingWentWrong({ message: "Valid slug is required (letters, numbers, hyphens)." });

        const exists = await ServiceCategory.findOne({ slug, deletedAt: null });
        if (exists) throw new Error(`Category with slug "${slug}" already exists.`);

        const doc = await ServiceCategory.create({
            slug,
            name: name.trim(),
            nameHi: nameHi?.trim() || null,
            description: description?.trim() || null,
            displayOrder: Number(displayOrder) || 0,
            isActive: Number(status) === 1,
            image: req.file ? `/service-categories/${req.file.filename}` : null
        });
        return res.successInsert(doc);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const updateServiceCategory = async (req, res) => {
    try {
        const doc = await ServiceCategory.findOne({ _id: new mongoose.Types.ObjectId(`${req.params.id}`), deletedAt: null });
        if (!doc) return res.noRecords();

        const { slug: slugIn, name, nameHi, description, displayOrder = 0, status = 1 } = req.body;
        if (!name?.trim()) return res.someThingWentWrong({ message: "Name is required." });

        const slug = slugify(slugIn || name);
        if (!slug) return res.someThingWentWrong({ message: "Valid slug is required." });

        const dup = await ServiceCategory.findOne({ _id: { $ne: doc._id }, slug, deletedAt: null });
        if (dup) throw new Error(`Category with slug "${slug}" already exists.`);

        let image = doc.image;
        if (req.file) {
            if (doc.image) deleteFile(doc.image);
            image = `/service-categories/${req.file.filename}`;
        }

        await ServiceCategory.updateOne(
            { _id: doc._id },
            {
                slug,
                name: name.trim(),
                nameHi: nameHi?.trim() || null,
                description: description?.trim() || null,
                displayOrder: Number(displayOrder) || 0,
                isActive: Number(status) === 1,
                image
            }
        );
        return res.successUpdate(doc);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const deleteServiceCategory = async (req, res) => {
    try {
        const doc = await ServiceCategory.findOne({ _id: new mongoose.Types.ObjectId(`${req.params.id}`), deletedAt: null });
        if (!doc) return res.noRecords();

        if (doc.image) deleteFile(doc.image);
        await doc.updateOne({ deletedAt: moment().toISOString() });
        return res.successDelete(doc);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const getServiceCategory = async (req, res) => {
    try {
        let { limit, pageNo, query, status, sortBy = "displayOrder", sortOrder = "asc" } = req.query;

        limit = limit ? parseInt(limit) : 10;
        pageNo = pageNo ? parseInt(pageNo) : 1;
        sortBy = ["name", "slug", "status", "displayOrder", "createdAt"].includes(String(sortBy)) ? String(sortBy) : "displayOrder";
        sortOrder = ["asc", "desc"].includes(String(sortOrder).toLowerCase()) ? String(sortOrder).toLowerCase() : "asc";

        const filter = { deletedAt: null };
        if (query) {
            const q = escapeRegex(String(query));
            filter.$or = [{ name: { $regex: q, $options: "i" } }, { slug: { $regex: q, $options: "i" } }];
        }
        if (status !== null && status !== undefined && status !== "") {
            filter.isActive = Number(status) === 1;
        }

        const pipeline = [
            { $match: filter },
            {
                $project: {
                    _id: 1,
                    slug: 1,
                    name: 1,
                    nameHi: 1,
                    image: 1,
                    description: 1,
                    displayOrder: 1,
                    status: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
                    createdAt: 1
                }
            }
        ];

        const totalCountPipeline = [...pipeline, { $count: "total_count" }];
        const resultsPipeline = [...pipeline, { $sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 } }, { $skip: (pageNo - 1) * limit }, { $limit: limit }];

        const [results, totalCount] = await Promise.all([
            ServiceCategory.aggregate(resultsPipeline),
            ServiceCategory.aggregate(totalCountPipeline)
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

export const getSingleServiceCategory = async (req, res) => {
    try {
        const doc = await ServiceCategory.findOne({ _id: new mongoose.Types.ObjectId(`${req.params.id}`), deletedAt: null });
        if (!doc) return res.noRecords();

        return res.success({
            _id: doc._id,
            slug: doc.slug,
            name: doc.name,
            nameHi: doc.nameHi ?? "",
            description: doc.description ?? "",
            displayOrder: doc.displayOrder ?? 0,
            image: doc.image,
            status: doc.isActive ? 1 : 0,
            createdAt: doc.createdAt
        });
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};
