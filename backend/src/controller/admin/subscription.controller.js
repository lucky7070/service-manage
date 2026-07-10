import moment from "moment";
import { Subscription } from "../../models/index.js";
import { escapeRegex, ObjectId } from "../../helpers/utils.js";
import { deleteFile } from "../../libraries/storage.js";
import { ensureRazorpayPlanId } from "../../helpers/razorpay.js";

const parseFeatures = (raw) => {
    if (raw == null || raw === "") return [];
    let parsed = raw;
    if (typeof raw === "string") {
        try {
            parsed = JSON.parse(raw);
        } catch {
            return [];
        }
    }
    if (!Array.isArray(parsed)) return [];

    return parsed.map((row) => ({
        name: String(row?.name ?? "").trim(),
        description: String(row?.description ?? "").trim(),
        included: row?.included === false || row?.included === 0 || row?.included === "0" ? false : true
    })).filter((row) => row.name && row.description);
};

export const createSubscription = async (req, res) => {
    try {
        const { name, description, price, interval, intervalCount = 1, status = 1, features } = req.body;
        const featureRows = parseFeatures(features);
        if (!featureRows.length) {
            return res.clientError("At least one feature with name and description is required.", 422, [{ field: "features", message: "At least one feature with name and description is required." }]);
        }

        const toCreate = {
            name: String(name).trim(),
            description: String(description).trim(),
            price: Number(price),
            interval: String(interval).toLowerCase(),
            intervalCount: Math.max(Number(intervalCount) || 1, 1),
            features: featureRows,
            isActive: Number(status) === 1
        }

        if (req.file) toCreate.image = `/subscriptions/${req.file.filename}`;

        toCreate.razorpayPlanId = await ensureRazorpayPlanId({
            name: toCreate.name,
            description: toCreate.description,
            price: toCreate.price,
            interval: toCreate.interval,
            intervalCount: toCreate.intervalCount,
            features: toCreate.features
        });

        const doc = await Subscription.create(toCreate);
        return res.successInsert(doc);
    } catch (error) {
        if (error?.code === 11000) {
            return res.clientError("Subscription name already exists.", 409, [{ field: "name", message: "Subscription name already exists." }]);
        }
        return res.someThingWentWrong(error);
    }
};

export const updateSubscription = async (req, res) => {
    try {
        const doc = await Subscription.findOne({ _id: ObjectId(req.params.id), deletedAt: null });
        if (!doc) return res.noRecords();

        const { name, description, price, interval, intervalCount = 1, status = 1, features } = req.body;
        const featureRows = parseFeatures(features);
        if (!featureRows.length) {
            return res.clientError("At least one feature with name and description is required.", 422, [{ field: "features", message: "At least one feature with name and description is required." }]);
        }

        const toUpdate = {
            name: String(name).trim(),
            description: String(description).trim(),
            price: Number(price),
            interval: String(interval).toLowerCase(),
            intervalCount: Math.max(Number(intervalCount) || 1, 1),
            features: featureRows,
            isActive: Number(status) === 1
        }

        if (req.file) {
            if (doc.image && doc.image !== "/subscriptions/default.png") deleteFile(doc.image);
            toUpdate.image = `/subscriptions/${req.file.filename}`;
        }

        if (!doc.razorpayPlanId || toUpdate.price !== doc.price || toUpdate.interval !== doc.interval || toUpdate.intervalCount !== doc.intervalCount) {
            toUpdate.razorpayPlanId = await ensureRazorpayPlanId({
                name: toUpdate.name,
                description: toUpdate.description,
                price: toUpdate.price,
                interval: toUpdate.interval,
                intervalCount: toUpdate.intervalCount,
                features: toUpdate.features
            });
        }

        await Subscription.updateOne({ _id: doc._id }, { $set: toUpdate });

        return res.successUpdate(doc);
    } catch (error) {
        if (error?.code === 11000) {
            return res.clientError("Subscription name already exists.", 409, [{ field: "name", message: "Subscription name already exists." }]);
        }
        return res.someThingWentWrong(error);
    }
};

export const deleteSubscription = async (req, res) => {
    try {
        const doc = await Subscription.findOne({ _id: ObjectId(req.params.id), deletedAt: null });
        if (!doc) return res.noRecords();

        await doc.updateOne({ deletedAt: moment().toISOString() });
        return res.successDelete(doc);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const getSubscription = async (req, res) => {
    try {
        let { limit, pageNo, query, status, interval, sortBy = "createdAt", sortOrder = "desc" } = req.query;
        limit = limit ? parseInt(limit, 10) : 10;
        pageNo = pageNo ? parseInt(pageNo, 10) : 1;
        sortBy = ["name", "price", "interval", "status", "createdAt"].includes(String(sortBy)) ? String(sortBy) : "createdAt";
        sortOrder = ["asc", "desc"].includes(String(sortOrder).toLowerCase()) ? String(sortOrder).toLowerCase() : "desc";

        const filter = { deletedAt: null };
        if (query) {
            const q = escapeRegex(String(query));
            filter.$or = [{ name: { $regex: q, $options: "i" } }, { subscriptionId: { $regex: q, $options: "i" } }, { description: { $regex: q, $options: "i" } }];
        }
        if (status !== null && status !== undefined && status !== "") filter.isActive = Number(status) === 1;
        if (interval && ["day", "month", "year"].includes(String(interval))) filter.interval = String(interval);

        const pipeline = [
            { $match: filter },
            {
                $project: {
                    _id: 1,
                    subscriptionId: 1,
                    name: 1,
                    slug: 1,
                    image: 1,
                    description: 1,
                    price: 1,
                    interval: 1,
                    intervalCount: 1,
                    features: 1,
                    status: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
                    createdAt: 1
                }
            }
        ];

        const totalCountPipeline = [...pipeline, { $count: "total_count" }];
        const resultsPipeline = [...pipeline, { $sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 } }, { $skip: (pageNo - 1) * limit }, { $limit: limit }];
        const [results, totalCount] = await Promise.all([Subscription.aggregate(resultsPipeline), Subscription.aggregate(totalCountPipeline)]);
        const total_count = totalCount.length > 0 ? totalCount[0].total_count : 0;

        if (results.length > 0) return res.pagination(results, total_count, limit, pageNo);
        return res.datatableNoRecords();
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const getSingleSubscription = async (req, res) => {
    try {
        const doc = await Subscription.findOne({ _id: ObjectId(req.params.id), deletedAt: null }).lean();
        if (!doc) return res.noRecords();

        return res.success({
            _id: doc._id,
            subscriptionId: doc.subscriptionId,
            name: doc.name,
            slug: doc.slug,
            image: doc.image,
            description: doc.description,
            price: doc.price,
            interval: doc.interval,
            intervalCount: doc.intervalCount,
            features: doc.features || [],
            status: doc.isActive ? 1 : 0,
            createdAt: doc.createdAt
        });
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};
