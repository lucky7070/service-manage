import moment from "moment";
import { Address, Booking, ChatMessage, City, Customer, Ledger, OtpVerification, ProviderService, Rating, ServiceCategory, ServiceLead, ServiceProvider, ServiceType, State } from "../models/index.js";
import { ObjectId, escapeRegex, now, optionalNumber, toBoolean } from "../helpers/utils.js";
import { incrementProviderRatingTotals, resolveQuickTagIds } from "../helpers/bookingRating.js";
import { bookingStatusMail } from "../libraries/mail.js";

const bookingListPipeline = ({ customerId, status = "", limit = 5, pageNo = 1 }) => {
    const match = { customerId, deletedAt: null };
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
            Booking.aggregate([{ $match: { customerId, deletedAt: null } }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
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
        const filter = { customerId, deletedAt: null };
        if (status) filter.status = status;

        const [record, totalCount] = await Promise.all([
            Booking.aggregate(bookingListPipeline({ customerId, status, limit, pageNo })),
            Booking.aggregate([{ $match: filter }, { $count: "total_count" }])
        ]);

        const total_count = totalCount.length > 0 ? totalCount[0].total_count : 0;
        if (record.length === 0) return res.datatableNoRecords();
        return res.pagination(record, total_count, limit, pageNo);
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
        if (!selectedServiceTypeIds.length) return res.clientError("At least one service type is required.", 422, [{ field: "serviceTypeId", message: "At least one service type is required." }]);

        const providerServices = await ProviderService.aggregate([
            { $match: { providerId: provider._id, serviceTypeId: { $in: selectedServiceTypeIds }, isActive: true } },
            { $lookup: { from: "servicetypes", localField: "serviceTypeId", foreignField: "_id", as: "serviceType" } },
            { $unwind: "$serviceType" },
            { $match: { "serviceType.deletedAt": null, "serviceType.isActive": true, "serviceType.categoryId": provider.serviceCategoryId } },
            { $project: { serviceTypeId: 1 } }
        ]);

        if (providerServices.length !== selectedServiceTypeIds.length) return res.clientError("One or more selected services are not available for this provider.", 422, [{ field: "serviceTypeId", message: "One or more selected services are not available for this provider." }]);

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

        const [detail] = await Booking.aggregate(bookingDetailPipeline({ _id: booking._id, customerId, deletedAt: null }));
        await bookingStatusMail(booking._id);
        return res.successInsert(detail, "Booking created successfully.");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const getCustomerBooking = async (req, res) => {
    try {

        const [booking] = await Booking.aggregate(bookingDetailPipeline({ _id: ObjectId(req.params.bookingId), customerId: req.customer._id, deletedAt: null }));
        if (!booking) return res.noRecords(false, "Booking not found.");

        const customerFeedback = await Rating.findOne({ bookingId: booking._id, ratingType: "customer_to_provider", })
            .populate("quickTags", "tagName tagType tagFor")
            .lean();

        return res.success({ ...booking, customerFeedback: customerFeedback || null });
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const acceptCustomerBookingQuote = async (req, res) => {
    try {
        const booking = await Booking.findOne({ _id: ObjectId(req.params.bookingId), customerId: req.customer._id, deletedAt: null });
        if (!booking) return res.noRecords(false, "Booking not found.");
        if (!booking.quotedPrice || booking.status !== "price_pending") return res.clientError("No pending quote found for this booking.", 400);

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
        const booking = await Booking.findOne({ _id: ObjectId(req.params.bookingId), customerId: req.customer._id, deletedAt: null });
        if (!booking) return res.noRecords(false, "Booking not found.");
        if (["completed", "cancelled"].includes(booking.status)) return res.clientError("This booking cannot be cancelled.", 400);

        booking.status = "cancelled";
        booking.cancelledBy = "customer";
        booking.cancellationReason = String(req.body?.cancellationReason || "Cancelled by customer").trim();
        await booking.save();

        return res.successUpdate(booking, "Booking cancelled successfully.");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const completeCustomerBooking = async (req, res) => {
    try {
        const booking = await Booking.findOne({ _id: ObjectId(req.params.bookingId), customerId: req.customer._id, deletedAt: null, });
        if (!booking) return res.noRecords(false, "Booking not found.");

        if (booking.status !== "in_progress" || !booking.startTime) {
            return res.clientError("You can only mark the job complete while it is in progress and after the provider has started.", 400);
        }

        if (booking.completionTime) {
            return res.clientError("This booking is already completed.", 409);
        }

        await OtpVerification.deleteMany({ purpose: "booking_completion", bookingId: booking._id });

        booking.completionTime = now();
        booking.status = "completed";
        await booking.save();

        return res.successUpdate(booking, "Job marked complete.");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const listCustomerBookingMessages = async (req, res) => {
    try {
        const booking = await Booking.findOne({ _id: ObjectId(req.params.bookingId), customerId: req.customer._id, deletedAt: null }, { _id: 1 });
        if (!booking) return res.noRecords(false, "Booking not found.");

        const messages = await ChatMessage.find({ bookingId: booking._id }, 'senderId senderType message attachmentUrl isRead readAt createdAt').sort({ createdAt: 1 }).lean();
        return res.success(messages);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const sendCustomerBookingMessage = async (req, res) => {
    try {
        const booking = await Booking.findOne({ _id: ObjectId(req.params.bookingId), customerId: req.customer._id, deletedAt: null }, { _id: 1 });
        if (!booking) return res.noRecords(false, "Booking not found.");

        const message = await ChatMessage.create({ bookingId: booking._id, senderId: req.customer._id, senderType: "customer", message: String(req.body.message || "").trim() });
        req.app.io?.to(`booking:${booking._id}`).emit("booking:message", message);
        return res.successInsert(message, "Message sent.");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const submitCustomerBookingFeedback = async (req, res) => {
    try {
        const booking = await Booking.findOne({ _id: ObjectId(req.params.bookingId), customerId: req.customer._id, deletedAt: null, });
        if (!booking) return res.noRecords(false, "Booking not found.");
        if (booking.status !== "completed") {
            return res.clientError("You can rate the provider only after the booking is completed.", 400);
        }

        const existing = await Rating.findOne({ bookingId: booking._id, ratingType: "customer_to_provider" }).lean();
        if (existing) return res.clientError("Feedback has already been submitted for this booking.", 409);

        let tagIds;
        try {
            tagIds = await resolveQuickTagIds(req.body.quickTags, "provider");
        } catch (e) {
            return res.clientError(e.message || "Invalid quick tags.", 422, [{ field: "quickTags", message: e.message || "Invalid quick tags." }]);
        }

        const star = Number.parseInt(String(req.body.starRating), 5);
        const reviewText = String(req.body.reviewText ?? "").trim() || null;

        const doc = await Rating.create({
            bookingId: booking._id,
            ratedBy: req.customer._id,
            ratedTo: booking.providerId,
            ratingType: "customer_to_provider",
            starRating: star,
            reviewText,
            quickTags: tagIds,
        });

        await incrementProviderRatingTotals(booking.providerId, star);

        const populated = await Rating.findById(doc._id).populate("quickTags", "tagName tagType tagFor").lean();
        return res.successInsert(populated, "Thank you for your feedback.");
    } catch (error) {
        if (error?.code === 11000) {
            return res.clientError("Feedback has already been submitted for this booking.", 409);
        }
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

        const [record, totalCount] = await Promise.all([
            Ledger.aggregate([
                { $match: filter },
                { $project: { voucherNo: 1, amount: 1, currentBalance: 1, updatedBalance: 1, paymentType: 1, paymentMethod: 1, requestId: 1, particulars: 1, createdAt: 1 } },
                { $sort: { createdAt: -1, _id: -1 } },
                { $skip: (pageNo - 1) * limit },
                { $limit: limit }
            ]),
            Ledger.aggregate([{ $match: filter }, { $count: "total_count" }])
        ]);

        const total_count = totalCount.length > 0 ? totalCount[0].total_count : 0;
        return res.pagination(record, total_count, limit, pageNo);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const createCustomerServiceLead = async (req, res) => {
    try {
        const customerId = req.customer._id;
        const city = await City.findOne({ _id: ObjectId(req.body.cityId), deletedAt: null, isActive: true });
        if (!city) return res.noRecords(false, "City not found.");

        const category = await ServiceCategory.findOne({ _id: ObjectId(req.body.serviceCategoryId), deletedAt: null, isActive: true });
        if (!category) return res.noRecords(false, "Service category not found.");

        const selectedServiceTypeIds = [...new Set((req.body.serviceTypeId || []).map((value) => String(value)))].map((value) => ObjectId(value)).filter(Boolean);
        if (!selectedServiceTypeIds.length) return res.clientError("At least one service type is required.", 422, [{ field: "serviceTypeId", message: "At least one service type is required." }]);

        const typeCount = await ServiceType.countDocuments({ _id: { $in: selectedServiceTypeIds }, categoryId: category._id, deletedAt: null, isActive: true });
        if (typeCount !== selectedServiceTypeIds.length) {
            return res.clientError("One or more selected services are invalid for this category.", 422, [{ field: "serviceTypeId", message: "Invalid service type selection." }]);
        }

        const address = await Address.findOne({ _id: ObjectId(req.body.addressId), customerId, deletedAt: null }).populate("city", "name").populate("state", "name");
        if (!address) return res.noRecords(false, "Address not found.");

        const lead = await ServiceLead.create({
            customerId,
            cityId: city._id,
            serviceCategoryId: category._id,
            serviceTypeId: selectedServiceTypeIds,
            addressId: address._id,
            scheduledTime: req.body.scheduledTime,
            issueDescription: req.body.issueDescription || null,
            status: "open"
        });

        return res.successInsert({ _id: lead._id, leadNumber: lead.leadNumber, status: lead.status, scheduledTime: lead.scheduledTime, createdAt: lead.createdAt }, "Request submitted. Our team will assign a professional and notify you.");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const listCustomerServiceLeads = async (req, res) => {
    try {
        const customerId = req.customer._id;
        const limit = Number.isFinite(Number(req.query.limit)) ? Math.min(Math.max(Number(req.query.limit), 1), 50) : 20;
        const pageNo = Number.isFinite(Number(req.query.pageNo)) ? Math.max(Number(req.query.pageNo), 1) : 1;
        const status = String(req.query.status || "").trim();

        const match = { customerId, deletedAt: null };
        if (status && ["open", "assigned", "cancelled"].includes(status)) match.status = status;

        const pipeline = [
            { $match: match },
            { $lookup: { from: "servicecategories", localField: "serviceCategoryId", foreignField: "_id", as: "category" } },
            { $lookup: { from: "cities", localField: "cityId", foreignField: "_id", as: "city" } },
            { $unwind: "$category" },
            { $unwind: "$city" },
            {
                $project: {
                    leadNumber: 1,
                    status: 1,
                    scheduledTime: 1,
                    issueDescription: 1,
                    bookingId: 1,
                    createdAt: 1,
                    serviceCategoryName: { $ifNull: ["$category.name", ""] },
                    cityName: { $ifNull: ["$city.name", ""] }
                }
            },
        ];

        const [record, totalCount] = await Promise.all([
            ServiceLead.aggregate([...pipeline, { $sort: { createdAt: -1 } }, { $skip: (pageNo - 1) * limit }, { $limit: limit }]),
            ServiceLead.aggregate([...pipeline, { $count: "total_count" }])
        ]);

        const total_count = totalCount.length > 0 ? totalCount[0].total_count : 0;
        if (record.length === 0) return res.datatableNoRecords();
        return res.pagination(record, total_count, limit, pageNo);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};
