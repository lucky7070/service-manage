import mongoose from "mongoose";
import moment from "moment";
import { ServiceProvider } from "../../models/index.js";
import { escapeRegex } from "../../helpers/utils.js";
import { SERVICE_PROVIDER_PROFILE_STATUSES } from "../../config/constants.js";

export const createServiceProvider = async (req, res) => {
    try {
        const { name, mobile, email, panCardNumber, aadharNumber, experienceYears, experienceDescription = "" } = req.body;

        const checkExist = await ServiceProvider.findOne({ deletedAt: null, $or: [{ mobile }, { email }, { panCardNumber }, { aadharNumber }] });
        if (checkExist) {
            if (checkExist.mobile === mobile) throw new Error("Service provider with this mobile already exists.");
            if (checkExist.email === email) throw new Error("Service provider with this email already exists.");
            if (checkExist.panCardNumber === panCardNumber) throw new Error("This PAN is already registered.");
            throw new Error("This Aadhar number is already registered.");
        }

        const files = req.files || {};
        let image = null;
        let panCardDocument = null;
        let aadharDocument = null;
        if (files?.image?.[0]?.filename) image = `/service-provider/${files?.image?.[0]?.filename}`;
        if (files?.panCardDocument?.[0]?.filename) panCardDocument = `/service-provider/${files?.panCardDocument?.[0]?.filename}`;
        if (files?.aadharDocument?.[0]?.filename) aadharDocument = `/service-provider/${files?.aadharDocument?.[0]?.filename}`;

        const record = await ServiceProvider.create({
            name: name.trim(),
            mobile, email, panCardNumber, aadharNumber, image, panCardDocument, aadharDocument,
            experienceYears: experienceYears ?? 0,
            experienceDescription: experienceDescription?.trim() || null,
            profileStatus: "approved",
            isActive: true,
            isVerified: true,
        });
        return res.successInsert(record);
    } catch (error) {
        if (error.code === 11000) {
            return res.someThingWentWrong({ message: "Duplicate mobile, email, PAN, or Aadhar." });
        }
        return res.someThingWentWrong(error);
    }
};

export const updateServiceProvider = async (req, res) => {
    try {
        const record = await ServiceProvider.findOne({ _id: new mongoose.Types.ObjectId(String(req.params.id)), deletedAt: null });
        if (!record) return res.noRecords();

        const { name, mobile, email, panCardNumber, aadharNumber, experienceYears, experienceDescription = "" } = req.body;

        const checkExist = await ServiceProvider.findOne({ _id: { $ne: record._id }, deletedAt: null, $or: [{ mobile }, { email }, { panCardNumber }, { aadharNumber }] });
        if (checkExist) {
            if (checkExist.mobile === mobile) throw new Error("Service provider with this mobile already exists.");
            if (checkExist.email === email) throw new Error("Service provider with this email already exists.");
            if (checkExist.panCardNumber === panCardNumber) throw new Error("This PAN is already registered.");
            throw new Error("This Aadhar number is already registered.");
        }

        const files = req.files || {};
        let image = record.image;
        let panCardDocument = record.panCardDocument;
        let aadharDocument = record.aadharDocument;

        if (files?.image?.[0]?.filename) image = `/service-provider/${files?.image?.[0]?.filename}`;
        if (files?.panCardDocument?.[0]?.filename) panCardDocument = `/service-provider/${files?.panCardDocument?.[0]?.filename}`;
        if (files?.aadharDocument?.[0]?.filename) aadharDocument = `/service-provider/${files?.aadharDocument?.[0]?.filename}`;

        await ServiceProvider.updateOne(
            { _id: record._id },
            {
                name: name.trim(),
                mobile,
                email,
                panCardNumber,
                aadharNumber,
                image,
                panCardDocument,
                aadharDocument,
                experienceYears: experienceYears ?? 0,
                experienceDescription: experienceDescription?.trim() || null,
            }
        );
        return res.successUpdate(record);
    } catch (error) {
        if (error.code === 11000) {
            return res.someThingWentWrong({ message: "Duplicate mobile, email, PAN, or Aadhar." });
        }
        return res.someThingWentWrong(error);
    }
};

export const deleteServiceProvider = async (req, res) => {
    try {
        const doc = await ServiceProvider.findOne({ _id: new mongoose.Types.ObjectId(String(req.params.id)), deletedAt: null });
        if (!doc) return res.noRecords();

        // if (doc.image) deleteFile(doc.image);
        // if (doc.panCardDocument) deleteFile(doc.panCardDocument);
        // if (doc.aadharDocument) deleteFile(doc.aadharDocument);
        await doc.updateOne({ deletedAt: moment().toISOString() });
        return res.successDelete(doc);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const getServiceProvider = async (req, res) => {
    try {
        let { limit, pageNo, query, profileStatus, sortBy = "createdAt", sortOrder = "desc" } = req.query;

        limit = limit ? parseInt(limit, 10) : 10;
        pageNo = pageNo ? parseInt(pageNo, 10) : 1;
        sortBy = ["name", "mobile", "email", "userId", "profileStatus", "createdAt"].includes(String(sortBy)) ? String(sortBy) : "createdAt";
        sortOrder = ["asc", "desc"].includes(String(sortOrder).toLowerCase()) ? String(sortOrder).toLowerCase() : "desc";

        const filter = { deletedAt: null };
        if (query) {
            const q = escapeRegex(String(query));
            filter.$or = [
                { name: { $regex: q, $options: "i" } },
                { mobile: { $regex: q, $options: "i" } },
                { email: { $regex: q, $options: "i" } },
                { userId: { $regex: q, $options: "i" } },
                { aadharNumber: { $regex: q, $options: "i" } },
                { panCardNumber: { $regex: q, $options: "i" } }
            ];
        }

        if (profileStatus !== null && profileStatus !== undefined && profileStatus !== "") {
            if (SERVICE_PROVIDER_PROFILE_STATUSES.includes(String(profileStatus))) {
                filter.profileStatus = String(profileStatus);
            }
        }

        const pipeline = [
            { $match: filter },
            { $project: { userId: 1, name: 1, mobile: 1, email: 1, panCardNumber: 1, aadharNumber: 1, profileStatus: 1, isVerified: 1, isActive: 1, experienceYears: 1, image: 1, panCardDocument: 1, aadharDocument: 1, totalCompletedServices: 1, totalRating: 1, ratingCount: 1, createdAt: 1 } }
        ];

        const totalCountPipeline = [...pipeline, { $count: "total_count" }];
        const resultsPipeline = [...pipeline, { $sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 } }, { $skip: (pageNo - 1) * limit }, { $limit: limit }];

        const [results, totalCount] = await Promise.all([ServiceProvider.aggregate(resultsPipeline), ServiceProvider.aggregate(totalCountPipeline)]);
        const total_count = totalCount.length > 0 ? totalCount[0].total_count : 0;

        if (results.length > 0) {
            return res.pagination(results, total_count, limit, pageNo);
        }
        return res.datatableNoRecords();
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const getSingleServiceProvider = async (req, res) => {
    try {
        const doc = await ServiceProvider.findOne({ _id: new mongoose.Types.ObjectId(String(req.params.id)), deletedAt: null }).lean();
        if (!doc) return res.noRecords();

        return res.success({
            _id: doc._id,
            userId: doc.userId,
            name: doc.name,
            mobile: doc.mobile,
            email: doc.email ?? "",
            panCardNumber: doc.panCardNumber ?? "",
            aadharNumber: doc.aadharNumber ?? "",
            image: doc.image,
            panCardDocument: doc.panCardDocument,
            aadharDocument: doc.aadharDocument,
            experienceYears: doc.experienceYears ?? "",
            experienceDescription: doc.experienceDescription ?? "",
            profileStatus: doc.profileStatus,
            rejectionReason: doc.rejectionReason,
            approvedBy: doc.approvedBy,
            approvedAt: doc.approvedAt,
            isAvailable: doc.isAvailable,
            currentLatitude: doc.currentLatitude,
            currentLongitude: doc.currentLongitude,
            totalCompletedServices: doc.totalCompletedServices,
            totalRating: doc.totalRating,
            ratingCount: doc.ratingCount,
            isActive: doc.isActive,
            isVerified: doc.isVerified,
            lastLogin: doc.lastLogin,
            createdAt: doc.createdAt
        });
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};
