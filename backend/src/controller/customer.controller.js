import moment from "moment";
import { Address, Booking, City, Customer, State } from "../models/index.js";
import { ObjectId, optionalNumber, toBoolean } from "../helpers/utils.js";

const bookingListPipeline = ({ customerId, status = "", limit = 5, pageNo = 1 }) => {
    const match = { customerId };
    if (status) match.status = status;

    return [
        { $match: match },
        { $lookup: { from: "serviceproviders", localField: "providerId", foreignField: "_id", as: "provider" } },
        { $lookup: { from: "servicecategories", localField: "serviceCategoryId", foreignField: "_id", as: "category" } },
        { $lookup: { from: "servicetypes", localField: "serviceTypeId", foreignField: "_id", as: "serviceTypes" } },
        { $lookup: { from: "cities", localField: "cityId", foreignField: "_id", as: "city" } },
        {
            $project: {
                bookingNumber: 1,
                status: 1,
                bookingTime: 1,
                scheduledTime: 1,
                issueDescription: 1,
                quotedPrice: 1,
                agreedPrice: 1,
                finalPrice: 1,
                providerName: { $ifNull: [{ $first: "$provider.name" }, ""] },
                providerImage: { $ifNull: [{ $first: "$provider.image" }, ""] },
                serviceCategoryName: { $ifNull: [{ $first: "$category.name" }, ""] },
                cityName: { $ifNull: [{ $first: "$city.name" }, ""] },
                serviceTypeNames: { $map: { input: "$serviceTypes", as: "serviceType", in: "$$serviceType.name" } },
                createdAt: 1
            }
        },
        { $sort: { createdAt: -1 } },
        { $skip: (pageNo - 1) * limit },
        { $limit: limit }
    ];
};

export const listCustomerAddresses = async (req, res) => {
    try {
        const record = await Address.aggregate([
            { $match: { customerId: req.customer._id, deletedAt: null } },
            { $lookup: { from: "states", localField: "state", foreignField: "_id", as: "stateDoc" } },
            { $lookup: { from: "cities", localField: "city", foreignField: "_id", as: "cityDoc" } },
            { $unwind: { path: "$stateDoc", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$cityDoc", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    customerId: 1,
                    addressLine1: 1,
                    addressLine2: 1,
                    landmark: 1,
                    state: 1,
                    city: 1,
                    stateName: { $ifNull: ["$stateDoc.name", ""] },
                    cityName: { $ifNull: ["$cityDoc.name", ""] },
                    pincode: 1,
                    latitude: 1,
                    longitude: 1,
                    isDefault: 1,
                    locationType: 1,
                    createdAt: 1
                }
            },
            { $sort: { isDefault: -1, createdAt: -1 } }
        ]);
        return res.success(record);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const createCustomerAddress = async (req, res) => {
    try {
        const { addressLine1, addressLine2, landmark, state, city, pincode, latitude, longitude, locationType = "home", isDefault = false } = req.body;

        const stateDoc = await State.findOne({ _id: ObjectId(state), deletedAt: null });
        if (!stateDoc) return res.noRecords(false, "State not found.");

        const cityDoc = await City.findOne({ _id: ObjectId(city), stateId: stateDoc._id, deletedAt: null });
        if (!cityDoc) return res.noRecords(false, "City not found for selected state.");

        if (isDefault) await Address.updateMany({ customerId: req.customer._id, deletedAt: null }, { isDefault: false });

        const address = await Address.create({
            customerId: req.customer._id,
            addressLine1: addressLine1,
            addressLine2: addressLine2,
            landmark: landmark || null,
            state: stateDoc._id,
            city: cityDoc._id,
            pincode: pincode,
            latitude: optionalNumber(latitude),
            longitude: optionalNumber(longitude),
            locationType,
            isDefault: toBoolean(isDefault)
        });
        return res.successInsert(address);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const updateCustomerAddress = async (req, res) => {
    try {
        const address = await Address.findOne({ _id: ObjectId(req.params.addressId), customerId: req.customer._id, deletedAt: null });
        if (!address) return res.noRecords(false, "Address not found.");

        const { addressLine1, addressLine2, landmark, state, city, pincode, latitude, longitude, locationType = "home", isDefault = false } = req.body;

        const stateDoc = await State.findOne({ _id: ObjectId(state), deletedAt: null });
        if (!stateDoc) return res.noRecords(false, "State not found.");

        const cityDoc = await City.findOne({ _id: ObjectId(city), stateId: stateDoc._id, deletedAt: null });
        if (!cityDoc) return res.noRecords(false, "City not found for selected state.");

        if (isDefault) await Address.updateMany({ _id: { $ne: address._id }, customerId: req.customer._id, deletedAt: null }, { isDefault: false });

        await address.updateOne({
            addressLine1: addressLine1,
            addressLine2: addressLine2,
            landmark: landmark || null,
            state: stateDoc._id,
            city: cityDoc._id,
            pincode: pincode,
            latitude: optionalNumber(latitude),
            longitude: optionalNumber(longitude),
            locationType,
            isDefault: toBoolean(isDefault)
        });
        return res.successUpdate(address);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const deleteCustomerAddress = async (req, res) => {
    try {
        const address = await Address.findOne({ _id: ObjectId(req.params.addressId), customerId: req.customer._id, deletedAt: null });
        if (!address) return res.noRecords(false, "Address not found.");

        await address.updateOne({ deletedAt: moment().toISOString(), isDefault: false });
        return res.successDelete(address);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const getCustomerDashboard = async (req, res) => {
    try {
        const customerId = req.customer._id;
        const [profile, addressCount, statusRows, recentBookings] = await Promise.all([
            Customer.findById(customerId, "_id userId name mobile email image dateOfBirth preferredLanguage").lean(),
            Address.countDocuments({ customerId, deletedAt: null }),
            Booking.aggregate([{ $match: { customerId } }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
            Booking.aggregate(bookingListPipeline({ customerId, limit: 5, pageNo: 1 }))
        ]);

        const bookingStats = {
            total: statusRows.reduce((sum, row) => sum + row.count, 0),
            pending: 0,
            confirmed: 0,
            in_progress: 0,
            completed: 0,
            cancelled: 0
        };

        statusRows.forEach((row) => {
            bookingStats[row._id] = row.count;
        });

        return res.success({ profile, addressCount, bookingStats, recentBookings });
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const listCustomerBookings = async (req, res) => {
    try {
        const customerId = req.customer._id;
        const limit = Number.isFinite(Number(req.query.limit)) ? Math.min(Math.max(Number(req.query.limit), 1), 50) : 10;
        const pageNo = Number.isFinite(Number(req.query.pageNo)) ? Math.max(Number(req.query.pageNo), 1) : 1;
        const status = String(req.query.status || "").trim();
        const filter = { customerId };
        if (status) filter.status = status;

        const [record, countRows] = await Promise.all([
            Booking.aggregate(bookingListPipeline({ customerId, status, limit, pageNo })),
            Booking.aggregate([{ $match: filter }, { $count: "total_count" }])
        ]);

        const total = countRows.length > 0 ? countRows[0].total_count : 0;
        if (record.length === 0) return res.datatableNoRecords();
        return res.pagination(record, total, limit, pageNo);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

