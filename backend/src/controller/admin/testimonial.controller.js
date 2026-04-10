import mongoose from "mongoose";
import moment from "moment";
import { Testimonial } from "../../models/index.js";
import { escapeRegex } from "../../helpers/utils.js";

export const createTestimonial = async (req, res) => {
    try {
        const { form = "customer", name, designation, rating = 5, review, status = 1 } = req.body;
        const image = req.file?.filename ? `/testimonials/${req.file.filename}` : "/testimonials/default.png";

        const doc = await Testimonial.create({
            form: String(form).trim(),
            name: String(name).trim(),
            designation: String(designation).trim(),
            image,
            rating: Number(rating) || 0,
            review: String(review).trim(),
            isActive: Number(status) === 1
        });
        return res.successInsert(doc);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const updateTestimonial = async (req, res) => {
    try {
        const doc = await Testimonial.findOne({ _id: new mongoose.Types.ObjectId(String(req.params.id)), deletedAt: null });
        if (!doc) return res.noRecords();

        const { form = "customer", name, designation, rating = 5, review, status = 1 } = req.body;
        const image = req.file?.filename ? `/testimonials/${req.file.filename}` : doc.image;

        await doc.updateOne(
            {
                form: String(form).trim(),
                name: String(name).trim(),
                designation: String(designation).trim(),
                image,
                rating: Number(rating) || 0,
                review: String(review).trim(),
                isActive: Number(status) === 1
            }
        );
        return res.successUpdate(doc);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const deleteTestimonial = async (req, res) => {
    try {
        const doc = await Testimonial.findOne({ _id: new mongoose.Types.ObjectId(String(req.params.id)), deletedAt: null });
        if (!doc) return res.noRecords();

        await doc.updateOne({ deletedAt: moment().toISOString() });
        return res.successDelete(doc);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const getTestimonial = async (req, res) => {
    try {
        let { limit, pageNo, query, form, status, sortBy = "createdAt", sortOrder = "desc" } = req.query;
        limit = limit ? parseInt(limit, 10) : 10;
        pageNo = pageNo ? parseInt(pageNo, 10) : 1;
        sortBy = ["name", "designation", "rating", "form", "status", "createdAt"].includes(String(sortBy)) ? String(sortBy) : "createdAt";
        sortOrder = ["asc", "desc"].includes(String(sortOrder).toLowerCase()) ? String(sortOrder).toLowerCase() : "desc";

        const filter = { deletedAt: null };
        if (query) {
            const q = escapeRegex(String(query));
            filter.$or = [
                { name: { $regex: q, $options: "i" } },
                { designation: { $regex: q, $options: "i" } },
                { review: { $regex: q, $options: "i" } }
            ];
        }
        if (form !== null && form !== undefined && String(form).trim()) filter.form = String(form).trim();
        if (status !== null && status !== undefined && status !== "") filter.isActive = Number(status) === 1;

        const pipeline = [
            { $match: filter },
            {
                $project: {
                    _id: 1,
                    form: 1,
                    name: 1,
                    designation: 1,
                    image: 1,
                    rating: 1,
                    review: 1,
                    status: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
                    createdAt: 1
                }
            }
        ];

        const totalCountPipeline = [...pipeline, { $count: "total_count" }];
        const resultsPipeline = [...pipeline, { $sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 } }, { $skip: (pageNo - 1) * limit }, { $limit: limit }];
        const [results, totalCount] = await Promise.all([Testimonial.aggregate(resultsPipeline), Testimonial.aggregate(totalCountPipeline)]);
        const total_count = totalCount.length > 0 ? totalCount[0].total_count : 0;

        if (results.length > 0) return res.pagination(results, total_count, limit, pageNo);
        return res.datatableNoRecords();
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const getSingleTestimonial = async (req, res) => {
    try {
        const doc = await Testimonial.findOne({ _id: new mongoose.Types.ObjectId(String(req.params.id)), deletedAt: null });
        if (!doc) return res.noRecords();

        return res.success({
            _id: doc._id,
            form: doc.form,
            name: doc.name,
            designation: doc.designation,
            image: doc.image,
            rating: Number(doc.rating) || 0,
            review: doc.review,
            status: doc.isActive ? 1 : 0,
            createdAt: doc.createdAt
        });
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};
