import { OurMilestone, OurValue, City, Enquiry, ServiceCategory, Testimonial, CmsPage } from "../models/index.js";
import { escapeRegex } from "../helpers/utils.js";

export const listCities = async (req, res) => {
    try {
        const query = String(req.query.query || "").trim();
        const limitRaw = Number(req.query.limit);
        const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 20) : 20;

        const filter = { deletedAt: null, isActive: true };
        if (query) filter.label = { $regex: escapeRegex(query), $options: "i" };

        const rows = await City.aggregate([
            { $lookup: { from: "states", localField: "stateId", foreignField: "_id", as: "state" } },
            { $unwind: "$state" },
            { $project: { value: '$_id', label: { $concat: ["$name", ", ", "$state.name"] }, deletedAt: 1, isActive: 1 } },
            { $match: filter },
            { $sort: { label: 1 } },
            { $limit: limit }
        ]);

        return res.success(rows);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const getAboutContent = async (req, res) => {
    try {
        const [ourStory, valuesRows, milestoneRows] = await Promise.all([
            CmsPage.findOne({ pageSlug: "our-story" }),
            OurValue.find({ deletedAt: null, isActive: true }, { icon: 1, title: 1, description: 1, displayOrder: 1 }).sort({ displayOrder: 1, createdAt: 1 }).lean(),
            OurMilestone.find({ deletedAt: null, isActive: true }, { year: 1, event: 1, displayOrder: 1 }).sort({ displayOrder: 1, createdAt: 1 }).lean()
        ]);

        const values = valuesRows.map((row) => ({ icon: row.icon, title: row.title, description: row.description }));
        const milestones = milestoneRows.map((row) => ({ year: row.year, event: row.event }));

        return res.success({ ourStory: ourStory?.content || "No content available.", values, milestones });
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const listServiceCategories = async (req, res) => {
    try {
        const query = String(req.query.query || "").trim();
        const limitRaw = Number(req.query.limit);
        const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 20) : 20;

        const filter = { deletedAt: null, isActive: true };
        if (query) filter.name = { $regex: escapeRegex(query), $options: "i" };

        const rows = await ServiceCategory.aggregate([
            { $match: filter },
            { $project: { value: '$_id', label: '$name' } },
            { $sort: { label: 1 } },
            { $limit: limit }
        ]);

        return res.success(rows);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const listServiceCategoriesForHome = async (req, res) => {
    try {
        const limitRaw = Number(req.query.limit);
        const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 100) : 8;

        const rows = await ServiceCategory.find(
            { deletedAt: null, isActive: true },
            { name: 1, slug: 1, description: 1, image: 1, displayOrder: 1 }
        )
            .sort({ displayOrder: -1, name: 1 })
            .limit(limit)
            .lean();

        return res.success(rows);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const getServiceCategoryBySlug = async (req, res) => {
    try {
        const slug = String(req.params.slug).trim().toLowerCase();
        if (!slug) return res.noRecords();

        const row = await ServiceCategory.findOne(
            { slug, deletedAt: null, isActive: true },
            { name: 1, slug: 1, description: 1, image: 1, displayOrder: 1 }
        ).lean();

        if (!row) return res.noRecords();
        return res.success(row);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const submitEnquiry = async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.getBody(["name", "email", "phone", "subject", "message"]);
        const phoneVal = phone && String(phone).trim() ? String(phone).trim() : null;
        await Enquiry.create({
            name: String(name).trim(),
            email: String(email).trim().toLowerCase(),
            phone: phoneVal,
            subject: String(subject).trim(),
            message: String(message).trim()
        });
        return res.success({}, "Thanks — we received your message and will get back to you soon.");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const listTestimonials = async (req, res) => {
    try {
        const limitRaw = Number(req.query.limit);
        const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 20) : 20;
        const from = String(req.query.from || "").trim();

        const filter = { deletedAt: null, isActive: true };
        if (from) filter.from = from;

        const rows = await Testimonial.aggregate([
            { $match: filter },
            { $project: { _id: 1, from: 1, name: 1, designation: 1, image: 1, rating: 1, review: 1, createdAt: 1 } },
            { $sort: { createdAt: -1 } },
            { $limit: limit }
        ]);

        return res.success(rows);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const getPrivacyPolicy = async (req, res) => {
    try {
        const data = await CmsPage.findOne({ pageSlug: "privacy-policy" });
        if (!data) return res.noRecords();

        return res.success({
            title: data.pageTitle,
            content: data.content,
            contentHi: data.contentHi,
            pageTitle: data.pageTitle,
            metaDescription: data.metaDescription,
            updatedAt: data.updatedAt,
        });
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const getTermsAndConditions = async (req, res) => {
    try {
        const data = await CmsPage.findOne({ pageSlug: "terms-and-conditions" });
        if (!data) return res.noRecords();

        return res.success({
            title: data.pageTitle,
            content: data.content,
            contentHi: data.contentHi,
            pageTitle: data.pageTitle,
            metaDescription: data.metaDescription,
            updatedAt: data.updatedAt,
        });
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};