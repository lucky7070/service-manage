import bcrypt from "bcryptjs";
import moment from "moment";
import { Franchise } from "../../models/index.js";
import { escapeRegex, ObjectId } from "../../helpers/utils.js";
import { deleteFile } from "../../libraries/storage.js";

export const listFranchises = async (req, res) => {
    try {
        let { limit, pageNo, query, status, sortBy = "createdAt", sortOrder = "desc" } = req.query;

        limit = limit ? parseInt(limit) : 10;
        pageNo = pageNo ? parseInt(pageNo) : 1;
        sortBy = ["userId", "name", "status", "mobile", "email", "createdAt"].includes(String(sortBy)) ? String(sortBy) : "createdAt";
        sortOrder = ["asc", "desc"].includes(String(sortOrder).toLowerCase()) ? String(sortOrder).toLowerCase() : "desc";

        const filter = { deletedAt: null };
        if (status !== null && status !== undefined && status !== "") {
            filter.isActive = Number(status) === 1;
        }

        const pipeline = [
            { $match: filter },
            { $project: { userId: 1, name: 1, mobile: 1, email: 1, image: 1, isActive: 1, createdAt: 1, status: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] } } }
        ];

        if (query) {
            const q = escapeRegex(String(query));
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
