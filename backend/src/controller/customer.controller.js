import moment from "moment";
import { Address, Booking, ChatMessage, City, Customer, Ledger, ProviderService, ServiceProvider, State } from "../models/index.js";
import { ObjectId, escapeRegex, optionalNumber, toBoolean } from "../helpers/utils.js";

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

const bookingDetailPipeline = (match) => [
    { $match: match },
    { $lookup: { from: "serviceproviders", localField: "providerId", foreignField: "_id", as: "provider" } },
    { $lookup: { from: "servicecategories", localField: "serviceCategoryId", foreignField: "_id", as: "category" } },
    { $lookup: { from: "servicetypes", localField: "serviceTypeId", foreignField: "_id", as: "serviceTypes" } },
    { $lookup: { from: "cities", localField: "cityId", foreignField: "_id", as: "city" } },
    {
        $project: {
            bookingNumber: 1,
            customerId: 1,
            providerId: 1,
            serviceCategoryId: 1,
            serviceTypeId: 1,
            cityId: 1,
            status: 1,
            issueDescription: 1,
            bookingTime: 1,
            quotedPrice: 1,
            agreedPrice: 1,
            finalPrice: 1,
            scheduledTime: 1,
            startTime: 1,
            completionTime: 1,
            cancellationReason: 1,
            cancelledBy: 1,
            addressId: 1,
            location: 1,
            providerName: { $ifNull: [{ $first: "$provider.name" }, ""] },
            providerImage: { $ifNull: [{ $first: "$provider.image" }, ""] },
            serviceCategoryName: { $ifNull: [{ $first: "$category.name" }, ""] },
            cityName: { $ifNull: [{ $first: "$city.name" }, ""] },
            serviceTypes: { $map: { input: "$serviceTypes", as: "serviceType", in: { _id: "$$serviceType._id", name: "$$serviceType.name", basePrice: "$$serviceType.basePrice", estimatedTimeMinutes: "$$serviceType.estimatedTimeMinutes" } } },
            createdAt: 1,
            updatedAt: 1
        }
    }
];

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
            Customer.findById(customerId, "_id userId name mobile email image dateOfBirth preferredLanguage balance referralCode").lean(),
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

export const createCustomerBooking = async (req, res) => {
    try {
        const customerId = req.customer._id;
        const provider = await ServiceProvider.findOne({ _id: ObjectId(req.body.providerId), deletedAt: null, isActive: true, profileStatus: "approved", isVerified: true });
        if (!provider) return res.noRecords(false, "Service provider not found.");

        const selectedServiceTypeIds = [...new Set((req.body.serviceTypeId || []).map((value) => String(value)))].map((value) => ObjectId(value)).filter(Boolean);
        if (!selectedServiceTypeIds.length) return res.someThingWentWrong({ message: "At least one service type is required." });

        const providerServices = await ProviderService.aggregate([
            { $match: { providerId: provider._id, serviceTypeId: { $in: selectedServiceTypeIds }, isActive: true } },
            { $lookup: { from: "servicetypes", localField: "serviceTypeId", foreignField: "_id", as: "serviceType" } },
            { $unwind: "$serviceType" },
            { $match: { "serviceType.deletedAt": null, "serviceType.isActive": true, "serviceType.categoryId": provider.serviceCategoryId } },
            { $project: { serviceTypeId: 1 } }
        ]);

        if (providerServices.length !== selectedServiceTypeIds.length) return res.someThingWentWrong({ message: "One or more selected services are not available for this provider." });

        const address = await Address.findOne({ _id: ObjectId(req.body.addressId), customerId, deletedAt: null }).populate("city", "name").populate("state", "name");
        if (!address) return res.noRecords(false, "Address not found.");

        const booking = await Booking.create({
            customerId,
            providerId: provider._id,
            serviceCategoryId: provider.serviceCategoryId,
            serviceTypeId: selectedServiceTypeIds,
            cityId: provider.cityId,
            status: "price_pending",
            issueDescription: req.body.issueDescription || null,
            scheduledTime: req.body.scheduledTime,
            addressId: address._id,
            location: {
                addressLine1: address.addressLine1,
                addressLine2: address.addressLine2,
                landmark: address.landmark,
                city: address.city?.name || null,
                state: address.state?.name || null,
                pincode: address.pincode,
                latitude: address.latitude,
                longitude: address.longitude,
                locationType: address.locationType
            }
        });

        const [detail] = await Booking.aggregate(bookingDetailPipeline({ _id: booking._id, customerId }));
        return res.successInsert(detail, "Booking created successfully.");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const getCustomerBooking = async (req, res) => {
    try {
        const [booking] = await Booking.aggregate(bookingDetailPipeline({ _id: ObjectId(req.params.bookingId), customerId: req.customer._id }));
        if (!booking) return res.noRecords(false, "Booking not found.");

        return res.success(booking);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const acceptCustomerBookingQuote = async (req, res) => {
    try {
        const booking = await Booking.findOne({ _id: ObjectId(req.params.bookingId), customerId: req.customer._id });
        if (!booking) return res.noRecords(false, "Booking not found.");
        if (!booking.quotedPrice || booking.status !== "price_pending") return res.someThingWentWrong({ message: "No pending quote found for this booking." });

        booking.agreedPrice = booking.quotedPrice;
        booking.finalPrice = booking.quotedPrice;
        booking.status = "confirmed";
        await booking.save();
        return res.successUpdate(booking, "Quote accepted successfully.");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const cancelCustomerBooking = async (req, res) => {
    try {
        const booking = await Booking.findOne({ _id: ObjectId(req.params.bookingId), customerId: req.customer._id });
        if (!booking) return res.noRecords(false, "Booking not found.");
        if (["completed", "cancelled"].includes(booking.status)) return res.someThingWentWrong({ message: "This booking cannot be cancelled." });

        booking.status = "cancelled";
        booking.cancelledBy = "customer";
        booking.cancellationReason = String(req.body?.cancellationReason || "Cancelled by customer").trim();
        await booking.save();
        
        return res.successUpdate(booking, "Booking cancelled successfully.");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const listCustomerBookingMessages = async (req, res) => {
    try {
        const booking = await Booking.findOne({ _id: ObjectId(req.params.bookingId), customerId: req.customer._id }, { _id: 1 });
        if (!booking) return res.noRecords(false, "Booking not found.");

        const messages = await ChatMessage.find({ bookingId: booking._id }).sort({ createdAt: 1 }).lean();
        return res.success(messages);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const sendCustomerBookingMessage = async (req, res) => {
    try {
        const booking = await Booking.findOne({ _id: ObjectId(req.params.bookingId), customerId: req.customer._id }, { _id: 1 });
        if (!booking) return res.noRecords(false, "Booking not found.");

        const message = await ChatMessage.create({ bookingId: booking._id, senderId: req.customer._id, senderType: "customer", message: String(req.body.message || "").trim() });
        req.app.locals.io?.to(`booking:${booking._id}`).emit("booking:message", message);
        return res.successInsert(message, "Message sent.");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const listCustomerLedger = async (req, res) => {
    try {

        const limit = Number.isFinite(Number(req.query.limit)) ? Math.min(Math.max(Number(req.query.limit), 1), 50) : 10;
        const pageNo = Number.isFinite(Number(req.query.pageNo)) ? Math.max(Number(req.query.pageNo), 1) : 1;
        const paymentType = String(req.query.paymentType || "").trim();
        const query = String(req.query.query || "").trim();

        const filter = { customerId: req.customer._id };
        if (paymentType) filter.paymentType = Number(paymentType);
        if (query) {
            const q = escapeRegex(query);
            filter.$or = [
                { voucherNo: { $regex: q, $options: "i" } },
                { particulars: { $regex: q, $options: "i" } }
            ];
        }

        const [record, countRows] = await Promise.all([
            Ledger.aggregate([
                { $match: filter },
                { $project: { voucherNo: 1, amount: 1, currentBalance: 1, updatedBalance: 1, paymentType: 1, paymentMethod: 1, requestId: 1, particulars: 1, createdAt: 1 } },
                { $sort: { createdAt: -1, _id: -1 } },
                { $skip: (pageNo - 1) * limit },
                { $limit: limit }
            ]),
            Ledger.aggregate([{ $match: filter }, { $count: "total_count" }])
        ]);

        const total = countRows.length > 0 ? countRows[0].total_count : 0;
        return res.pagination(record, total, limit, pageNo);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

