import bcrypt from "bcryptjs";
import moment from "moment";
import { Franchise } from "../../models/index.js";
import { escapeRegex, ObjectId } from "../../helpers/utils.js";
import { deleteFile } from "../../libraries/storage.js";
import { formatExportDateTime, sendExcelResponse } from "../../helpers/excelExport.js";

const buildFranchiseListPipeline = (query) => {
    let { query: searchQuery, status, sortBy = "createdAt", sortOrder = "desc" } = query;

    sortBy = ["userId", "name", "status", "mobile", "email", "createdAt", "referredProvidersCount"].includes(String(sortBy)) ? String(sortBy) : "createdAt";
    sortOrder = ["asc", "desc"].includes(String(sortOrder).toLowerCase()) ? String(sortOrder).toLowerCase() : "desc";

    const filter = { deletedAt: null };
    if (status !== null && status !== undefined && status !== "") {
        filter.isActive = Number(status) === 1;
    }

    const pipeline = [
        { $match: filter },
        {
            $lookup: {
                from: "serviceproviders",
                let: { franchiseId: "$_id" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$franchiseId", "$$franchiseId"] }, deletedAt: null } },
                    { $count: "count" },
                ],
                as: "referredProviders",
            },
        },
        {
            $addFields: {
                referredProvidersCount: { $ifNull: [{ $arrayElemAt: ["$referredProviders.count", 0] }, 0] },
                status: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
            },
        },
        {
            $project: {
                userId: 1,
                name: 1,
                mobile: 1,
                email: 1,
                image: 1,
                isActive: 1,
                createdAt: 1,
                status: 1,
                referredProvidersCount: 1,
            },
        },
    ];

    if (searchQuery) {
        const q = escapeRegex(String(searchQuery));
        pipeline.push({
            $match: {
                $or: [
                    { userId: { $regex: q, $options: "i" } },
                    { name: { $regex: q, $options: "i" } },
                    { mobile: { $regex: q, $options: "i" } },
                    { email: { $regex: q, $options: "i" } }
                ]
            }
        });
    }

    return { pipeline, sortBy, sortOrder };
};

export const listFranchises = async (req, res) => {
    try {
        let { limit, pageNo } = req.query;
        const { pipeline, sortBy, sortOrder } = buildFranchiseListPipeline(req.query);

        limit = limit ? parseInt(limit) : 10;
        pageNo = pageNo ? parseInt(pageNo) : 1;

        const totalCountPipeline = [...pipeline, { $count: "total_count" }];
        const resultsPipeline = [...pipeline, { $sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 } }, { $skip: (pageNo - 1) * limit }, { $limit: limit }];

        const [results, totalCount] = await Promise.all([
            Franchise.aggregate(resultsPipeline),
            Franchise.aggregate(totalCountPipeline)
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

export const exportFranchises = async (req, res) => {
    try {
        const { pipeline, sortBy, sortOrder } = buildFranchiseListPipeline(req.query);
        const results = await Franchise.aggregate([...pipeline, { $sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 } }]);

        const rows = results.map((row) => ({
            userId: row.userId || "",
            name: row.name || "",
            mobile: row.mobile || "",
            email: row.email || "",
            status: Number(row.status) === 1 ? "Active" : "Inactive",
            referredProvidersCount: row.referredProvidersCount ?? 0,
            createdAt: formatExportDateTime(row.createdAt)
        }));

        return sendExcelResponse(res, {
            filename: `franchises-${moment().format("YYYY-MM-DD")}.xlsx`,
            sheetName: "Franchises",
            columns: [
                { header: "User ID", key: "userId", width: 14 },
                { header: "Name", key: "name", width: 24 },
                { header: "Mobile", key: "mobile", width: 14 },
                { header: "Email", key: "email", width: 28 },
                { header: "Status", key: "status", width: 12 },
                { header: "Referred Providers", key: "referredProvidersCount", width: 18 },
                { header: "Created At", key: "createdAt", width: 22 }
            ],
            rows
        });
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const getSingleFranchise = async (req, res) => {
    try {
        const franchise = await Franchise.findOne({ _id: ObjectId(req.params.id), deletedAt: null });
        if (!franchise) return res.noRecords();

        return res.success(franchise);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const createFranchise = async (req, res) => {
    try {
        const { name, mobile, email, password, status = 1 } = req.body;

        const existing = await Franchise.findOne({ deletedAt: null, $or: [{ mobile }, { email }] });
        if (existing) throw new Error("Franchise with same mobile/email already exists.");

        const hashed = await bcrypt.hash(password, 10);
        let image = "/franchises/default.png";
        if (req.file?.filename) image = `/franchises/${req.file.filename}`;

        const franchise = await Franchise.create({ name, mobile, email, password: hashed, isActive: Number(status) === 1, image });
        franchise.password = undefined;
        return res.successInsert(franchise);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const updateFranchise = async (req, res) => {
    try {
        const franchise = await Franchise.findOne({ _id: ObjectId(req.params.id), deletedAt: null });
        if (!franchise) return res.noRecords();

        const { name, mobile, email, password = null, status = 1 } = req.body;

        const conflict = await Franchise.findOne({ _id: { $ne: franchise._id }, deletedAt: null, $or: [{ mobile }, { email }] });
        if (conflict) throw new Error("Franchise with same mobile/email already exists.");

        franchise.name = name;
        franchise.mobile = mobile;
        franchise.email = email;
        franchise.isActive = Number(status) === 1;
        if (password) franchise.password = await bcrypt.hash(password, 10);

        if (req.file?.filename) {
            const previous = franchise.image;
            const nextImage = `/franchises/${req.file.filename}`;
            if (previous && previous !== nextImage && previous !== "/franchises/default.png") {
                deleteFile(previous);
            }
            franchise.image = nextImage;
        }

        await franchise.save();
        franchise.password = undefined;
        return res.successUpdate(franchise);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const deleteFranchise = async (req, res) => {
    try {
        const franchise = await Franchise.findOne({ _id: ObjectId(req.params.id), deletedAt: null });
        if (!franchise) return res.noRecords();

        await franchise.updateOne({ deletedAt: moment().toISOString() });
        return res.successDelete(franchise);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};
