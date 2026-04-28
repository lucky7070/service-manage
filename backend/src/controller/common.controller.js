import mongoose from "mongoose";
import { OurMilestone, OurValue, State, City, Enquiry, ServiceCategory, ServiceProvider, Testimonial, CmsPage } from "../models/index.js";
import { escapeRegex, ObjectId } from "../helpers/utils.js";


export const listStates = async (req, res) => {
    try {
        const query = String(req.query.query || "").trim();
        const limit = Number.isFinite(Number(req.query.limit)) ? Math.min(Math.max(Number(req.query.limit), 1), 50) : 20;

        const filter = { deletedAt: null, isActive: true };
        if (query) filter.name = { $regex: query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };

        const rows = await State.find(filter, { name: 1 }).sort({ name: 1 }).limit(limit).lean();
        return res.success(rows.map((row) => ({ value: row._id, label: row.name })));
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const listCities = async (req, res) => {
    try {
        const query = String(req.query.query || "").trim();
        const stateId = ObjectId(req.query.stateId);
        const limit = Number.isFinite(Number(req.query.limit)) ? Math.min(Math.max(Number(req.query.limit), 1), 50) : 20;

        const filter = { deletedAt: null, isActive: true };
        if (stateId) filter.stateId = stateId;
        if (query) filter.name = { $regex: query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };

        const rows = await City.find(filter, { name: 1 }).sort({ name: 1 }).limit(limit).lean();
        return res.success(rows.map((row) => ({ value: row._id, label: row.name })));
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const listCitiesWithState = async (req, res) => {
    try {
        const query = String(req.query.query || "").trim();
        const limitRaw = Number(req.query.limit);
        const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 20) : 20;

        const filter = {};
        if (query) filter.label = { $regex: escapeRegex(query), $options: "i" };

        const rows = await City.aggregate([
            { $match: { deletedAt: null, isActive: true } },
            { $lookup: { from: "states", localField: "stateId", foreignField: "_id", as: "state" } },
            { $unwind: "$state" },
            { $project: { value: '$_id', slug: { $ifNull: ["$slug", ""] }, label: { $concat: ["$name", ", ", "$state.name"] } } },
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
            { $project: { value: '$_id', label: '$name', slug: '$slug' } },
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

export const listServiceProviders = async (req, res) => {
    try {
        const citySlug = String(req.params.city || "").trim().toLowerCase();
        const serviceCategorySlug = String(req.params.serviceCategory || "").trim().toLowerCase();

        if (!citySlug || !serviceCategorySlug) return res.datatableNoRecords({ city: null, serviceCategory: null });

        const limitRaw = Number(req.query.limit);
        const pageNoRaw = Number(req.query.pageNo);
        const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 50) : 12;
        const pageNo = Number.isFinite(pageNoRaw) ? Math.max(pageNoRaw, 1) : 1;
        const query = String(req.query.query || "").trim();

        const [city, serviceCategory] = await Promise.all([
            City.findOne({ slug: citySlug, deletedAt: null, isActive: true }, { _id: 1, name: 1, slug: 1 }).lean(),
            ServiceCategory.findOne({ slug: serviceCategorySlug, deletedAt: null, isActive: true }, { _id: 1, name: 1, slug: 1 }).lean()
        ]);

        if (!city || !serviceCategory) return res.datatableNoRecords({ city, serviceCategory });

        const filter = { cityId: city._id, serviceCategoryId: serviceCategory._id, deletedAt: null, isActive: true, profileStatus: "approved", isVerified: true };
        if (query) filter.name = { $regex: escapeRegex(String(query)), $options: "i" };

        const pipeline = [
            { $match: filter },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    image: 1,
                    experienceYears: { $ifNull: ["$experienceYears", 0] },
                    totalCompletedServices: { $ifNull: ["$totalCompletedServices", 0] },
                    totalRating: { $ifNull: ["$totalRating", 0] },
                    ratingCount: { $ifNull: ["$ratingCount", 0] }
                }
            },
        ];

        const totalCountPipeline = [...pipeline, { $count: "total_count" }];
        const resultsPipeline = [...pipeline, { $sort: { ratingCount: -1, totalCompletedServices: -1, name: 1 } }, { $skip: (pageNo - 1) * limit }, { $limit: limit }];

        const [results, totalCount] = await Promise.all([ServiceProvider.aggregate(resultsPipeline), ServiceProvider.aggregate(totalCountPipeline)]);
        const total_count = totalCount.length > 0 ? totalCount[0].total_count : 0;

        if (results.length > 0) {
            return res.pagination(results, total_count, limit, pageNo, 3, { city, serviceCategory });
        } else {
            return res.datatableNoRecords({ city, serviceCategory });
        }
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const getPublicServiceProvider = async (req, res) => {
    try {
        const id = String(req.params.id || "").trim();
        if (!mongoose.Types.ObjectId.isValid(id)) return res.noRecords();

        const [doc] = await ServiceProvider.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(id), deletedAt: null, isActive: true, profileStatus: "approved", isVerified: true } },
            { $lookup: { from: "cities", localField: "cityId", foreignField: "_id", as: "city" } },
            { $unwind: { path: "$city" } },
            { $lookup: { from: "servicecategories", localField: "serviceCategoryId", foreignField: "_id", as: "serviceCategory" } },
            { $unwind: { path: "$serviceCategory" } },
            {
                $lookup: {
                    from: "serviceproviderphotos", localField: "_id", foreignField: "providerId", as: "photos",
                    pipeline: [{ $sort: { displayOrder: 1, createdAt: 1 } }, { $project: { _id: 0, photoUrl: 1 } }]
                }
            },
            {
                $project: {
                    userId: 1,
                    name: 1,
                    image: 1,
                    photos: 1,
                    experienceYears: { $ifNull: ["$experienceYears", 0] },
                    experienceDescription: { $ifNull: ["$experienceDescription", ""] },
                    totalCompletedServices: { $ifNull: ["$totalCompletedServices", 0] },
                    totalRating: { $ifNull: ["$totalRating", 0] },
                    ratingCount: { $ifNull: ["$ratingCount", 0] },
                    averageRating: {
                        $cond: [
                            { $gt: [{ $ifNull: ["$ratingCount", 0] }, 0] },
                            { $round: [{ $divide: [{ $ifNull: ["$totalRating", 0] }, "$ratingCount"] }, 1] },
                            "N/A"
                        ]
                    },
                    isAvailable: 1,
                    cityId: "$city._id",
                    cityName: "$city.name",
                    citySlug: "$city.slug",
                    serviceCategoryId: "$serviceCategory._id",
                    serviceCategoryName: "$serviceCategory.name",
                    serviceCategorySlug: "$serviceCategory.slug",
                    photos: { $map: { input: '$photos', as: 'photo', in: '$$photo.photoUrl' } }
                }
            }
        ]);

        if (!doc) return res.noRecords();
        return res.success(doc);
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