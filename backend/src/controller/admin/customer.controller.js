import mongoose from "mongoose";
import moment from "moment";
import { Customer } from "../../models/index.js";
import { escapeRegex } from "../../helpers/utils.js";
import { deleteFile } from "../../libraries/storage.js";

export const createCustomer = async (req, res) => {
    try {
        const { name, mobile, email, dateOfBirth, status = 1 } = req.body;
        if (!name?.trim()) return res.someThingWentWrong({ message: "Name is required." });
        if (!mobile?.trim()) return res.someThingWentWrong({ message: "Mobile is required." });
        if (!email?.trim()) return res.someThingWentWrong({ message: "Email is required." });
        if (!dateOfBirth) return res.someThingWentWrong({ message: "Date of birth is required." });

        const normalizedEmail = email.trim().toLowerCase();
        const normalizedMobile = mobile.trim();

        const dup = await Customer.findOne({
            deletedAt: null,
            $or: [{ mobile: normalizedMobile }, { email: normalizedEmail }]
        });
        if (dup) {
            if (dup.mobile === normalizedMobile) throw new Error("Customer with this mobile already exists.");
            throw new Error("Customer with this email already exists.");
        }

        const dob = new Date(dateOfBirth);
        if (Number.isNaN(dob.getTime())) return res.someThingWentWrong({ message: "Invalid date of birth." });

        const payload = {
            name: name.trim(),
            mobile: normalizedMobile,
            email: normalizedEmail,
            dateOfBirth: dob,
            image: '/customers/default.png',
            isActive: Number(status) === 1,
        };
        if (req.file) payload.image = `/customers/${req.file.filename}`;

        const customer = await Customer.create(payload);
        return res.successInsert(customer);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const updateCustomer = async (req, res) => {
    try {
        const customer = await Customer.findOne({ _id: new mongoose.Types.ObjectId(String(req.params.id)), deletedAt: null });
        if (!customer) return res.noRecords();

        const { name, mobile, email, dateOfBirth, status = 1 } = req.body;
        if (!name?.trim()) return res.someThingWentWrong({ message: "Name is required." });
        if (!mobile?.trim()) return res.someThingWentWrong({ message: "Mobile is required." });
        if (!email?.trim()) return res.someThingWentWrong({ message: "Email is required." });
        if (!dateOfBirth) return res.someThingWentWrong({ message: "Date of birth is required." });

        const normalizedEmail = email.trim().toLowerCase();
        const normalizedMobile = mobile.trim();

        const dup = await Customer.findOne({
            _id: { $ne: customer._id },
            deletedAt: null,
            $or: [{ mobile: normalizedMobile }, { email: normalizedEmail }]
        });
        if (dup) {
            if (dup.mobile === normalizedMobile) throw new Error("Customer with this mobile already exists.");
            throw new Error("Customer with this email already exists.");
        }

        const dob = new Date(dateOfBirth);
        if (Number.isNaN(dob.getTime())) return res.someThingWentWrong({ message: "Invalid date of birth." });

        let image = customer.image;
        if (req.file) {
            if (customer.image) deleteFile(customer.image);
            image = `/customers/${req.file.filename}`;
        }

        await Customer.updateOne(
            { _id: customer._id },
            {
                name: name.trim(),
                mobile: normalizedMobile,
                email: normalizedEmail,
                dateOfBirth: dob,
                isActive: Number(status) === 1,
                image
            }
        );
        return res.successUpdate(customer);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const deleteCustomer = async (req, res) => {
    try {
        const customer = await Customer.findOne({ _id: new mongoose.Types.ObjectId(String(req.params.id)), deletedAt: null });
        if (!customer) return res.noRecords();

        if (customer.image) deleteFile(customer.image);
        await customer.updateOne({ deletedAt: moment().toISOString() });
        return res.successDelete(customer);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const getCustomer = async (req, res) => {
    try {
        let { limit, pageNo, query, status, sortBy = "createdAt", sortOrder = "desc" } = req.query;

        limit = limit ? parseInt(limit) : 10;
        pageNo = pageNo ? parseInt(pageNo) : 1;
        sortBy = ["name", "mobile", "email", "dateOfBirth", "status", "createdAt", "userId"].includes(String(sortBy)) ? String(sortBy) : "createdAt";
        sortOrder = ["asc", "desc"].includes(String(sortOrder).toLowerCase()) ? String(sortOrder).toLowerCase() : "desc";

        const filter = { deletedAt: null };
        if (query) {
            const q = escapeRegex(String(query));
            filter.$or = [
                { name: { $regex: q, $options: "i" } },
                { mobile: { $regex: q, $options: "i" } },
                { email: { $regex: q, $options: "i" } },
                { userId: { $regex: q, $options: "i" } }
            ];
        }
        if (status !== null && status !== undefined && status !== "") {
            filter.isActive = Number(status) === 1;
        }

        const pipeline = [
            { $match: filter },
            {
                $project: {
                    userId: 1,
                    name: 1,
                    mobile: 1,
                    email: 1,
                    dateOfBirth: 1,
                    image: 1,
                    status: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
                    createdAt: 1
                }
            }
        ];

        const totalCountPipeline = [...pipeline, { $count: "total_count" }];
        const resultsPipeline = [...pipeline, { $sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 } }, { $skip: (pageNo - 1) * limit }, { $limit: limit }];

        const [results, totalCount] = await Promise.all([Customer.aggregate(resultsPipeline), Customer.aggregate(totalCountPipeline)]);
        const total_count = totalCount.length > 0 ? totalCount[0].total_count : 0;

        if (results.length > 0) {
            return res.pagination(results, total_count, limit, pageNo);
        }
        return res.datatableNoRecords();
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const getSingleCustomer = async (req, res) => {
    try {
        const customer = await Customer.findOne({ _id: new mongoose.Types.ObjectId(String(req.params.id)), deletedAt: null });
        if (!customer) return res.noRecords();

        return res.success({
            _id: customer._id,
            userId: customer.userId,
            name: customer.name,
            mobile: customer.mobile,
            email: customer.email,
            dateOfBirth: customer.dateOfBirth ? moment(customer.dateOfBirth).format("YYYY-MM-DD") : "",
            image: customer.image,
            balance: customer.balance || 0,
            status: customer.isActive ? 1 : 0,
            createdAt: customer.createdAt
        });
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};
