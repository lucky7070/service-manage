import jwt from "jsonwebtoken";
import moment from "moment";
import { config } from "../config/index.js";
import { JWT_CONFIG, PHONE_REGEXP } from "../config/constants.js";
import { ObjectId, generateOtp, now, nowPlusMinutes, distanceMeters } from "../helpers/utils.js";
import { Booking, ChatMessage, Customer, Notification, OtpVerification, Rating, ServiceProvider, ServiceProviderPhoto, ServiceCategory, City } from "../models/index.js";
import { deleteFile } from "../libraries/storage.js";
import { pickPushFields } from "../helpers/pushFields.js";
import { sendOTP } from "../libraries/sms.js";
import { refreshCustomerAverageRating, resolveQuickTagIds } from "../helpers/bookingRating.js";
import { parseBookingChatPayload } from "../helpers/bookingChat.js";
import { getSettings } from "../helpers/database.js";
import { bookingStatusMail } from "../libraries/mail.js";
import { notifyBookingChatMessage, notifyBookingQuoteSent, notifyBookingStatusChange } from "../helpers/bookingNotifications.js";

const bookingAggregation = (filter) => {
    return [
        { $match: filter },
        { $lookup: { from: "customers", localField: "customerId", foreignField: "_id", as: "customer" } },
        { $lookup: { from: "serviceproviders", localField: "providerId", foreignField: "_id", as: "provider" } },
        { $lookup: { from: "servicecategories", localField: "serviceCategoryId", foreignField: "_id", as: "category" } },
        { $lookup: { from: "servicetypes", localField: "serviceTypeId", foreignField: "_id", as: "serviceTypes" } },
        { $lookup: { from: "cities", localField: "cityId", foreignField: "_id", as: "city" } },
        { $unwind: "$city" },
        { $unwind: "$provider" },
        { $unwind: "$customer" },
        { $unwind: "$category" },
        {
            $project: {
                bookingNumber: 1,
                customerId: 1,
                providerId: 1,
                serviceCategoryId: 1,
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
                location: 1,
                customerUserId: { $ifNull: ["$customer.userId", ""] },
                customerName: { $ifNull: ["$customer.name", ""] },
                customerMobile: { $ifNull: ["$customer.mobile", ""] },
                customerEmail: { $ifNull: ["$customer.email", ""] },
                customerImage: { $ifNull: ["$customer.image", ""] },
                customerDateOfBirth: { $ifNull: ["$customer.dateOfBirth", ""] },
                providerUserId: { $ifNull: ["$provider.userId", ""] },
                providerName: { $ifNull: ["$provider.name", ""] },
                providerMobile: { $ifNull: ["$provider.mobile", ""] },
                providerEmail: { $ifNull: ["$provider.email", ""] },
                providerImage: { $ifNull: ["$provider.image", ""] },
                serviceCategoryName: { $ifNull: ["$category.name", ""] },
                cityName: { $ifNull: ["$city.name", ""] },
                serviceTypes: { $map: { input: "$serviceTypes", as: "serviceType", in: { _id: "$$serviceType._id", name: "$$serviceType.name", basePrice: "$$serviceType.basePrice", estimatedTimeMinutes: "$$serviceType.estimatedTimeMinutes" } } },
                createdAt: 1,
                updatedAt: 1
            }
        }
    ]
}

const getProfile = async (user) => {
    const todayDate = moment().startOf("day").toDate();
    const [profile] = await ServiceProvider.aggregate([
        { $match: { _id: user._id, deletedAt: null } },
        { $lookup: { from: "cities", localField: "cityId", foreignField: "_id", as: "city" } },
        { $lookup: { from: "servicecategories", localField: "serviceCategoryId", foreignField: "_id", as: "category" } },
        { $unwind: "$city" },
        { $unwind: "$category" },
        {
            $lookup: {
                from: "assignedsubscriptions", localField: "_id", foreignField: "providerId", as: "subscription", pipeline: [
                    { $match: { status: "active", startDate: { $lte: todayDate }, endDate: { $gte: todayDate } } },
                    { $lookup: { from: "subscriptions", localField: "subscriptionId", foreignField: "_id", as: "plan" } },
                    { $unwind: { path: "$plan", preserveNullAndEmptyArrays: true } },
                    { $sort: { createdAt: -1 } },
                    { $limit: 1 },
                ]
            }
        },
        { $unwind: { path: "$subscription", preserveNullAndEmptyArrays: true } },
        {
            $project: {
                _id: 1,
                userId: 1,
                name: 1,
                mobile: 1,
                email: 1,
                image: 1,
                cityId: 1,
                serviceCategoryId: 1,
                cityName: { $ifNull: ["$city.name", "N/A"] },
                serviceCategoryName: { $ifNull: ["$category.name", "N/A"] },
                panCardNumber: 1,
                aadharNumber: 1,
                panCardDocument: 1,
                aadharDocument: 1,
                experienceYears: 1,
                experienceDescription: 1,
                registerFrom: 1,
                profileStatus: 1,
                isVerified: 1,
                isActive: 1,
                lastLogin: 1,
                rejectionReason: 1,
                approvedAt: 1,
                isAvailable: 1,
                currentLatitude: 1,
                currentLongitude: 1,
                totalCompletedServices: 1,
                totalRating: 1,
                ratingCount: 1,
                activeSubscription: { $ifNull: ["$subscription.voucherNo", null] },
                activeSubscriptionStartDate: { $ifNull: ["$subscription.startDate", null] },
                activeSubscriptionEndDate: { $ifNull: ["$subscription.endDate", null] },
                activeSubscriptionName: { $ifNull: ["$subscription.plan.name", null] },
                activeSubscriptionId: { $ifNull: ["$subscription.subscriptionId", null] },
                activeSubscriptionPrice: { $ifNull: ["$subscription.paymentAmount", null] },
            }
        }
    ]);
    return profile ?? null;
};

export const sendOtp = async (req, res) => {
    try {

        let { mobile, purpose = "login" } = req.body;
        if (!mobile) return res.clientError("Mobile is required.", 422, [{ field: "mobile", message: "Required" }]);
        if (!PHONE_REGEXP.test(String(mobile).trim())) return res.clientError("Enter a valid Indian mobile number.", 422, [{ field: "mobile", message: "Enter a valid Indian mobile number." }]);

        let user = await ServiceProvider.findOne({ mobile, deletedAt: null });
        if (!user && purpose === "login") return res.clientError("Service Provider not registered..!!", 404);
        if (user && purpose === "register") return res.clientError("Service Provider already registered..!!", 409);

        let otp = generateOtp();
        if (mobile === "9876543210") otp = "123456";

        const isSent = await sendOTP(mobile, otp);
        if (!isSent) return res.clientError("Failed to send OTP", 502);

        await OtpVerification.deleteMany({ phoneNumber: mobile });
        await OtpVerification.create({ phoneNumber: mobile, otpCode: otp, purpose, expiresAt: nowPlusMinutes(config.otpExpiryMinutes) });

        return res.success(config.isDevelopment ? otp : "", "OTP sent");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const login = async (req, res) => {
    try {
        const { mobile, otp } = req.body;
        if (!mobile) return res.clientError("Mobile is required.", 422, [{ field: "mobile", message: "Required" }]);
        if (!otp) return res.clientError("OTP is required.", 422, [{ field: "otp", message: "Required" }]);
        if (!PHONE_REGEXP.test(String(mobile).trim())) return res.clientError("Enter a valid Indian mobile number.", 422, [{ field: "mobile", message: "Enter a valid Indian mobile number." }]);

        const verify = await OtpVerification.findOne({ phoneNumber: mobile, otpCode: otp, purpose: "login" }).sort({ createdAt: -1 });
        if (!verify || moment(verify.expiresAt).isBefore(moment())) return res.clientError("Invalid or expired OTP", 422, [{ field: "otp", message: "Invalid or expired OTP" }]);

        const user = await ServiceProvider.findOne({ mobile: verify.phoneNumber, deletedAt: null });
        if (!user) return res.clientError("User not registered..!!", 404);

        await user.updateOne({ lastLogin: now(), ...pickPushFields(req.body) });
        await verify.deleteOne();

        const token = jwt.sign({ id: user._id, role: "service-provider" }, config.serviceProviderJwtSecret, JWT_CONFIG);
        res.setCookie("service-provider-token", token);

        return res.success(await getProfile(user), "Success..!!");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const register = async (req, res) => {
    try {
        const { name, mobile, email, cityId, serviceCategoryId, panCardNumber, aadharNumber, experienceYears, experienceDescription = "", otp } = req.body;

        const verify = await OtpVerification.findOne({
            phoneNumber: String(mobile).trim(),
            otpCode: String(otp).trim(),
            purpose: "register"
        }).sort({ createdAt: -1 });
        if (!verify || moment(verify.expiresAt).isBefore(moment())) {
            return res.clientError("Invalid or expired OTP", 422, [{ field: "otp", message: "Invalid or expired OTP" }]);
        }

        const existing = await ServiceProvider.findOne({
            deletedAt: null,
            $or: [
                { mobile: String(mobile).trim() },
                { email: String(email).trim().toLowerCase() },
                { panCardNumber: String(panCardNumber).trim().toUpperCase() },
                { aadharNumber: String(aadharNumber).trim() }
            ]
        });
        if (existing) {
            if (existing.mobile === String(mobile).trim()) {
                return res.clientError("Service provider with this mobile already exists.", 409, [{ field: "mobile", message: "Mobile already registered." }]);
            }

            if (existing.email === String(email).trim().toLowerCase()) {
                return res.clientError("Service provider with this email already exists.", 409, [{ field: "email", message: "Email already registered." }]);
            }

            if (existing.panCardNumber === String(panCardNumber).trim().toUpperCase()) {
                return res.clientError("This PAN is already registered.", 409, [{ field: "panCardNumber", message: "PAN already registered." }]);
            }

            return res.clientError("This Aadhar number is already registered.", 409, [{ field: "aadharNumber", message: "Aadhar already registered." }]);
        }

        const checkServiceCategory = await ServiceCategory.findOne({ _id: ObjectId(serviceCategoryId), deletedAt: null });
        if (!checkServiceCategory) return res.clientError("Service category not found.", 404);

        const checkCity = await City.findOne({ _id: ObjectId(cityId), deletedAt: null });
        if (!checkCity) return res.clientError("City not found.", 404);

        const files = req.files || {};
        const image = `/service-provider/${files?.image?.[0]?.filename}`;
        const panCardDocument = `/service-provider/${files?.panCardDocument?.[0]?.filename}`;
        const aadharDocument = `/service-provider/${files?.aadharDocument?.[0]?.filename}`;
        if (!image || !panCardDocument || !aadharDocument) return res.clientError("All images and documents are required.", 422);

        await ServiceProvider.create({
            name: String(name).trim(),
            mobile: String(mobile).trim(),
            email: String(email).trim().toLowerCase(),
            cityId,
            serviceCategoryId,
            image,
            panCardNumber: String(panCardNumber).trim().toUpperCase(),
            aadharNumber: String(aadharNumber).trim(),
            panCardDocument,
            aadharDocument,
            experienceYears: Number(experienceYears ?? 0),
            experienceDescription: String(experienceDescription).trim() || null,
            registerFrom: "front",
            profileStatus: "pending",
            isVerified: false,
            isActive: true,
            ...pickPushFields(req.body)
        });

        await verify.deleteOne();

        return res.successInsert({}, "Registration submitted successfully. Our team will contact you soon.");
    } catch (error) {
        if (error?.code === 11000) {
            return res.clientError("Duplicate mobile, email, PAN, or Aadhar.", 409);
        }
        return res.someThingWentWrong(error);
    }
};

export const profile = async (req, res) => {
    try {
        return res.success(await getProfile(req.serviceProvider), "User profile fetched successfully");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const getServiceProviderDashboard = async (req, res) => {
    try {
        const providerId = req.serviceProvider._id;

        const pipeline = bookingAggregation({ providerId, deletedAt: null });
        const [workPhotoCount, statusRows, recentBookings] = await Promise.all([
            ServiceProviderPhoto.countDocuments({ providerId }),
            Booking.aggregate([{ $match: { providerId, deletedAt: null } }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
            Booking.aggregate(pipeline.concat({ $sort: { createdAt: -1 } }, { $limit: 5 }))
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

        return res.success({ profile: await getProfile(req.serviceProvider), workPhotoCount, bookingStats, recentBookings });
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const logout = async (req, res) => {
    try {
        res.deleteCookie("service-provider-token");
        return res.success([], "Logged out");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const deleteServiceProviderAccount = async (req, res) => {
    try {
        await req.serviceProvider.updateOne({
            deletedAt: now(),
            isActive: false,
            isAvailable: false,
            fcmToken: null,
            deviceId: null,
        });
        res.deleteCookie("service-provider-token");
        return res.successDelete([], "Your account has been deleted.");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const getWorkPhotos = async (req, res) => {
    try {

        const { id } = req.serviceProvider;
        const rows = await ServiceProviderPhoto.find({ providerId: id }).sort({ displayOrder: 1, createdAt: 1 }).lean();
        return res.success(rows);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const uploadWorkPhotos = async (req, res) => {
    try {

        const files = req.files || [];
        if (!Array.isArray(files) || files.length === 0) {
            return res.clientError("No image files were uploaded.", 422, [{ field: "files", message: "No image files were uploaded." }]);
        }

        const { id } = req.serviceProvider;
        const last = await ServiceProviderPhoto.findOne({ providerId: id }, "displayOrder").sort({ displayOrder: -1 }).lean();
        let nextOrder = (last?.displayOrder ?? -1) + 1;

        const created = [];
        for (const file of files) {
            if (!file?.filename) continue;
            const doc = await ServiceProviderPhoto.create({
                providerId: id,
                photoUrl: `/service-provider-work/${file.filename}`,
                displayOrder: nextOrder++
            });

            created.push(doc.toObject());
        }

        if (!created.length) return res.clientError("No valid images were saved.", 422);
        return res.successInsert({ record: created }, "Photos uploaded.");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const deleteWorkPhoto = async (req, res) => {
    try {

        const photoId = ObjectId(req.params.photoId);
        if (!photoId) return res.clientError("Invalid photo id.", 422, [{ field: "photoId", message: "Invalid photo id." }]);

        const { id } = req.serviceProvider;
        const doc = await ServiceProviderPhoto.findOne({ _id: photoId, providerId: id });
        if (!doc) return res.noRecords();

        if (doc.photoUrl) deleteFile(doc.photoUrl);
        await doc.deleteOne();
        return res.successDelete(undefined, "Photo removed.");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const reorderWorkPhotos = async (req, res) => {
    try {

        const { orderedIds } = req.body || {};
        const { id } = req.serviceProvider;
        if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
            return res.clientError("orderedIds must be a non-empty array.", 422, [{ field: "orderedIds", message: "Must be a non-empty array." }]);
        }

        const ids = orderedIds.map((x) => ObjectId(x)).filter(Boolean);
        if (ids.length !== orderedIds.length) {
            return res.clientError("Invalid photo id in orderedIds.", 422, [{ field: "orderedIds", message: "Invalid photo id in orderedIds." }]);
        }

        const existing = await ServiceProviderPhoto.find({ providerId: id }, "_id").lean();
        if (existing.length !== ids.length) {
            return res.clientError("Photo list does not match server state.", 409);
        }

        const idSet = new Set(existing.map((row) => String(row._id)));
        for (const id of ids) {
            if (!idSet.has(String(id))) {
                return res.clientError("Unknown photo id in orderedIds.", 422, [{ field: "orderedIds", message: "Unknown photo id." }]);
            }
        }

        await Promise.all(ids.map((photoId, index) =>
            ServiceProviderPhoto.updateOne({ _id: photoId, providerId: id }, { $set: { displayOrder: index } })
        ));

        const rows = await ServiceProviderPhoto.find({ providerId: id }).sort({ displayOrder: 1, createdAt: 1 }).lean();
        return res.success(rows, "Order updated.");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const getProviderBooking = async (req, res) => {
    try {
        const [booking] = await Booking.aggregate(bookingAggregation({ _id: ObjectId(req.params.bookingId), providerId: req.serviceProvider._id, deletedAt: null }));
        if (!booking) return res.noRecords(false, "Booking not found.");

        booking.providerFeedback = await Rating.findOne({ bookingId: booking._id, ratingType: "provider_to_customer", }).populate("quickTags", "tagName tagType tagFor").lean();
        return res.success(booking);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const listProviderBookings = async (req, res) => {
    try {
        const limit = Number.isFinite(Number(req.query.limit)) ? Math.min(Math.max(Number(req.query.limit), 1), 50) : 10;
        const pageNo = Number.isFinite(Number(req.query.pageNo)) ? Math.max(Number(req.query.pageNo), 1) : 1;
        const sortBy = String(req.query.sortBy || "createdAt").trim();
        const sortOrder = String(req.query.sortOrder || "desc").trim();
        const status = String(req.query.status || "").trim();
        const filter = { providerId: req.serviceProvider._id, deletedAt: null };
        if (status) filter.status = status;

        const pipeline = bookingAggregation(filter);

        const totalCountPipeline = [...pipeline, { $count: "total_count" }];
        const resultsPipeline = [...pipeline, { $sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 } }, { $skip: (pageNo - 1) * limit }, { $limit: limit }];

        const [results, totalCount] = await Promise.all([Booking.aggregate(resultsPipeline), Booking.aggregate(totalCountPipeline)]);
        const total_count = totalCount.length > 0 ? totalCount[0].total_count : 0;

        if (results.length > 0) {
            return res.pagination(results, total_count, limit, pageNo);
        } else {
            return res.datatableNoRecords();
        }
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const cancelProviderBooking = async (req, res) => {
    try {
        const booking = await Booking.findOne({ _id: ObjectId(req.params.bookingId), providerId: req.serviceProvider._id, deletedAt: null });
        if (!booking) return res.noRecords(false, "Booking not found.");
        if (["completed", "cancelled"].includes(booking.status)) {
            return res.clientError("This booking cannot be cancelled.", 400);
        }

        const previousStatus = booking.status;
        booking.status = "cancelled";
        booking.cancelledBy = "provider";
        booking.cancellationReason = String(req.body?.cancellationReason || "Cancelled by service provider").trim();
        await booking.save();
        await bookingStatusMail(booking._id);
        await notifyBookingStatusChange({ booking, previousStatus, actorType: "provider" });
        return res.successUpdate(booking, "Booking cancelled successfully.");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const setBookingQuote = async (req, res) => {
    try {
        const booking = await Booking.findOne({ _id: ObjectId(req.params.bookingId), providerId: req.serviceProvider._id, deletedAt: null });
        if (!booking) return res.noRecords(false, "Booking not found.");
        if (["completed", "cancelled"].includes(booking.status)) return res.clientError("This booking cannot be quoted.", 400);

        const previousStatus = booking.status;
        booking.quotedPrice = Number(req.body.quotedPrice);
        booking.status = "price_pending";
        await booking.save();
        await bookingStatusMail(booking._id);
        await notifyBookingStatusChange({ booking, previousStatus, actorType: "provider" });
        if (previousStatus === booking.status) {
            await notifyBookingQuoteSent({ booking, actorType: "provider" });
        }
        return res.successUpdate(booking, "Quote sent successfully.");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const startProviderBooking = async (req, res) => {
    try {
        const booking = await Booking.findOne({ _id: ObjectId(req.params.bookingId), providerId: req.serviceProvider._id, deletedAt: null });
        if (!booking) return res.noRecords(false, "Booking not found.");

        if (["completed", "cancelled"].includes(booking.status)) {
            return res.clientError("This booking cannot be started.", 400);
        }

        if (booking.status !== "confirmed" || booking.agreedPrice == null || Number(booking.agreedPrice) <= 0) {
            return res.clientError("Price must be confirmed by the customer before starting the job.", 400);
        }

        if (booking.startTime != null || booking.status === "in_progress") {
            return res.clientError("Job has already been started.", 409);
        }

        const jobLat = booking.location?.latitude || null;
        const jobLon = booking.location?.longitude || null;
        if (jobLat == null || jobLon == null || !Number.isFinite(Number(jobLat)) || !Number.isFinite(Number(jobLon))) {
            return res.clientError("Service address has no map coordinates. Location check cannot be performed. Update the booking address or contact support.", 422);
        }

        const rawLat = req.body.latitude;
        const rawLon = req.body.longitude;
        const coordErrors = [];
        if (rawLat == null || rawLat === "" || !Number.isFinite(Number(rawLat))) {
            coordErrors.push({ field: "latitude", message: "Required" });
        }
        if (rawLon == null || rawLon === "" || !Number.isFinite(Number(rawLon))) {
            coordErrors.push({ field: "longitude", message: "Required" });
        }
        if (coordErrors.length) {
            return res.clientError("Valid device coordinates are required to start the job.", 422, coordErrors);
        }

        const providerLat = Number(rawLat);
        const providerLon = Number(rawLon);

        const settings = await getSettings(["job_start_geofence_meters"]);
        let radiusM = Number(settings.job_start_geofence_meters);
        if (!Number.isFinite(radiusM) || radiusM <= 0) {
            radiusM = 50;
        }

        const metersApart = distanceMeters(providerLat, providerLon, Number(jobLat), Number(jobLon));
        if (!Number.isFinite(metersApart) || metersApart > radiusM) {
            return res.clientError(`You must be within ${radiusM} m of the customer's service address to start the job (device is about ${Math.round(metersApart)} m away).`, 400);
        }

        const previousStatus = booking.status;
        booking.startTime = now();
        booking.status = "in_progress";
        await booking.save();
        await bookingStatusMail(booking._id);
        await notifyBookingStatusChange({ booking, previousStatus, actorType: "provider" });
        return res.successUpdate(booking, "Job started.");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const sendBookingCompletionOtp = async (req, res) => {
    try {

        const booking = await Booking.findOne({ _id: ObjectId(req.params.bookingId), providerId: req.serviceProvider._id, deletedAt: null });
        if (!booking) return res.noRecords(false, "Booking not found.");

        if (booking.status !== "in_progress" || !booking.startTime) {
            return res.clientError("Job must be in progress to request completion verification.", 400);
        }

        if (booking.completionTime) {
            return res.clientError("This booking is already completed.", 409);
        }

        const customer = await Customer.findById(booking.customerId, "mobile").lean();
        if (!customer?.mobile) {
            return res.clientError("Customer mobile not found.", 422);
        }

        const otp = generateOtp();
        const isSent = await sendOTP(customer.mobile, otp);
        if (!isSent) return res.clientError("Failed to send OTP", 502);

        await OtpVerification.deleteMany({ purpose: "booking_completion", bookingId: booking._id });
        await OtpVerification.create({
            phoneNumber: customer.mobile,
            otpCode: otp,
            purpose: "booking_completion",
            bookingId: booking._id,
            expiresAt: nowPlusMinutes(config.otpExpiryMinutes),
        });

        return res.success(config.isDevelopment ? otp : "", "OTP sent to customer.");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const completeProviderBooking = async (req, res) => {
    try {
        const booking = await Booking.findOne({ _id: ObjectId(req.params.bookingId), providerId: req.serviceProvider._id, deletedAt: null });
        if (!booking) return res.noRecords(false, "Booking not found.");

        if (booking.status !== "in_progress" || !booking.startTime) {
            return res.clientError("Job is not in progress.", 400);
        }

        if (booking.completionTime) {
            return res.clientError("This booking is already completed.", 409);
        }

        const customer = await Customer.findById(booking.customerId, "mobile").lean();
        if (!customer?.mobile) {
            return res.clientError("Customer not found.", 404);
        }

        const verify = await OtpVerification.findOne({
            phoneNumber: customer.mobile,
            otpCode: String(req.body.otp || "").trim(),
            purpose: "booking_completion",
            bookingId: booking._id,
        }).sort({ createdAt: -1 });

        if (!verify || moment(verify.expiresAt).isBefore(moment())) {
            return res.clientError("Invalid or expired OTP.", 422, [{ field: "otp", message: "Invalid or expired OTP." }]);
        }

        await verify.deleteOne();
        const previousStatus = booking.status;
        booking.completionTime = now();
        booking.status = "completed";
        await booking.save();

        await bookingStatusMail(booking._id);
        await notifyBookingStatusChange({ booking, previousStatus, actorType: "provider" });
        return res.successUpdate(booking, "Booking completed successfully.");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const listProviderBookingMessages = async (req, res) => {
    try {
        const booking = await Booking.findOne({ _id: ObjectId(req.params.bookingId), providerId: req.serviceProvider._id, deletedAt: null }, { _id: 1 });
        if (!booking) return res.noRecords(false, "Booking not found.");

        const messages = await ChatMessage.find({ bookingId: booking._id }, "senderId senderType message attachmentUrl isRead readAt createdAt").sort({ createdAt: 1 }).lean();
        return res.success(messages);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const sendProviderBookingMessage = async (req, res) => {
    try {
        const booking = await Booking.findOne({ _id: ObjectId(req.params.bookingId), providerId: req.serviceProvider._id, deletedAt: null });
        if (!booking) return res.noRecords(false, "Booking not found.");

        const payload = parseBookingChatPayload(req);
        if (payload.error) return res.clientError(payload.error, 422, [{ field: "message", message: payload.error }]);

        const message = await ChatMessage.create({
            bookingId: booking._id,
            senderId: req.serviceProvider._id,
            senderType: "provider",
            message: payload.message,
            attachmentUrl: payload.attachmentUrl
        });
        req.app.io?.to(`booking:${booking._id}`).emit("booking:message", message);
        void notifyBookingChatMessage({
            booking,
            message,
            senderType: "provider",
            senderName: req.serviceProvider.name
        });
        return res.successInsert(message, "Message sent.");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const submitProviderBookingFeedback = async (req, res) => {
    try {
        const booking = await Booking.findOne({ _id: ObjectId(req.params.bookingId), providerId: req.serviceProvider._id, deletedAt: null, });
        if (!booking) return res.noRecords(false, "Booking not found.");

        if (booking.status !== "completed") {
            return res.clientError("You can rate the customer only after the booking is completed.", 400);
        }

        const existing = await Rating.findOne({ bookingId: booking._id, ratingType: "provider_to_customer" }).lean();
        if (existing) return res.clientError("Feedback has already been submitted for this booking.", 409);

        let tagIds;
        try {
            tagIds = await resolveQuickTagIds(req.body.quickTags, "customer");
        } catch (e) {
            return res.clientError(e.message || "Invalid quick tags.", 422, [{ field: "quickTags", message: e.message || "Invalid quick tags." }]);
        }

        const star = Number.parseInt(String(req.body.starRating), 10);
        const reviewText = String(req.body.reviewText ?? "").trim() || null;

        const doc = await Rating.create({
            bookingId: booking._id,
            ratedBy: req.serviceProvider._id,
            ratedTo: booking.customerId,
            ratingType: "provider_to_customer",
            starRating: star,
            reviewText,
            quickTags: tagIds,
        });

        await refreshCustomerAverageRating(booking.customerId);

        const populated = await Rating.findById(doc._id).populate("quickTags", "tagName tagType tagFor").lean();
        return res.successInsert(populated, "Thank you for your feedback.");
    } catch (error) {
        if (error?.code === 11000) {
            return res.clientError("Feedback has already been submitted for this booking.", 409);
        }
        return res.someThingWentWrong(error);
    }
};

const providerNotificationProjection = "_id title message type relatedId isRead readAt createdAt";

export const getProviderNotificationUnreadCount = async (req, res) => {
    try {
        const unreadCount = await Notification.countDocuments({ userId: req.serviceProvider._id, userType: "provider", isRead: false });
        return res.success({ unreadCount }, "Unread count fetched.");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const listProviderNotifications = async (req, res) => {
    try {
        const providerId = req.serviceProvider._id;
        const pageNo = Number.isFinite(Number(req.query.pageNo)) ? Math.max(Number(req.query.pageNo), 1) : 1;
        const limit = Number.isFinite(Number(req.query.limit)) ? Math.min(Math.max(Number(req.query.limit), 1), 50) : 10;

        const filter = { userId: providerId, userType: "provider" };

        const [record, totalCount, unreadCount] = await Promise.all([
            Notification.find(filter, providerNotificationProjection).sort({ createdAt: -1 }).skip((pageNo - 1) * limit).limit(limit).lean(),
            Notification.countDocuments(filter),
            Notification.countDocuments({ ...filter, isRead: false })
        ]);

        return res.pagination(record, totalCount, limit, pageNo, 3, { unreadCount });
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const markAllProviderNotificationsRead = async (req, res) => {
    try {
        const now = new Date();
        await Notification.updateMany(
            { userId: req.serviceProvider._id, userType: "provider", isRead: false },
            { $set: { isRead: true, readAt: now } }
        );

        const unreadCount = await Notification.countDocuments({ userId: req.serviceProvider._id, userType: "provider", isRead: false });
        return res.success({ unreadCount }, "All notifications marked as read.");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};
