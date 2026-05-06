import jwt from "jsonwebtoken";
import moment from "moment";
import { config } from "../config/index.js";
import { COOKIE_OPTIONS, PHONE_REGEXP } from "../config/constants.js";
import { ObjectId, generateOtp, now, nowPlusMinutes } from "../helpers/utils.js";
import { Booking, ChatMessage, OtpVerification, ServiceProvider, ServiceProviderPhoto } from "../models/index.js";
import { deleteFile } from "../libraries/storage.js";
import { sendOTP } from "../libraries/sms.js";

export const sendOtp = async (req, res) => {
    try {

        const environment = process.env.NODE_ENV || "production";

        let { mobile, purpose = "login" } = req.body;
        if (!mobile) return res.someThingWentWrong({ message: "Mobile is required" });
        if (!PHONE_REGEXP.test(String(mobile).trim())) return res.someThingWentWrong({ message: "Enter a valid Indian mobile number." });

        let user = await ServiceProvider.findOne({ mobile, deletedAt: null });
        if (!user && purpose === "login") return res.someThingWentWrong({ message: "Service Provider not registered..!!" });
        if (user && purpose === "register") return res.someThingWentWrong({ message: "Service Provider already registered..!!" });

        const otp = generateOtp();
        const isSent = await sendOTP(mobile, otp);
        if (!isSent) return res.someThingWentWrong({ message: "Failed to send OTP" });

        await OtpVerification.deleteMany({ phoneNumber: mobile });
        await OtpVerification.create({ phoneNumber: mobile, otpCode: otp, purpose, expiresAt: nowPlusMinutes(config.otpExpiryMinutes) });

        return res.success(environment === "development" ? otp : "", "OTP sent");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const login = async (req, res) => {
    try {
        const { mobile, otp } = req.body;
        if (!otp || !mobile) return res.someThingWentWrong({ message: "Mobile and otp are required" });
        if (!PHONE_REGEXP.test(String(mobile).trim())) return res.someThingWentWrong({ message: "Enter a valid Indian mobile number." });

        const verify = await OtpVerification.findOne({ phoneNumber: mobile, otpCode: otp, purpose: "login" }).sort({ createdAt: -1 });
        if (!verify || moment(verify.expiresAt).isBefore(moment())) return res.someThingWentWrong({ message: "Invalid or expired OTP" });

        const user = await ServiceProvider.findOne({ mobile: verify.phoneNumber, deletedAt: null }, "_id userId name mobile email image cityId serviceCategoryId panCardNumber aadharNumber panCardDocument aadharDocument experienceYears experienceDescription registerFrom profileStatus rejectionReason approvedAt isAvailable currentLatitude currentLongitude totalCompletedServices totalRating ratingCount isActive isVerified lastLogin");
        if (!user) return res.someThingWentWrong({ message: "User not registered..!!" });

        await user.updateOne({ lastLogin: now() });
        await verify.deleteOne();

        const token = jwt.sign({ id: user._id, role: "service-provider" }, config.serviceProviderJwtSecret, { expiresIn: "7d" });
        res.setCookie("service-provider-token", token);

        return res.success(user, "Success..!!");
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
            return res.someThingWentWrong({ message: "Invalid or expired OTP" });
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
                return res.someThingWentWrong({ message: "Service provider with this mobile already exists." });
            }

            if (existing.email === String(email).trim().toLowerCase()) {
                return res.someThingWentWrong({ message: "Service provider with this email already exists." });
            }

            if (existing.panCardNumber === String(panCardNumber).trim().toUpperCase()) {
                return res.someThingWentWrong({ message: "This PAN is already registered." });
            }

            return res.someThingWentWrong({ message: "This Aadhar number is already registered." });
        }

        const files = req.files || {};
        const image = `/service-provider/${files?.image?.[0]?.filename}`;
        const panCardDocument = `/service-provider/${files?.panCardDocument?.[0]?.filename}`;
        const aadharDocument = `/service-provider/${files?.aadharDocument?.[0]?.filename}`;

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
            isActive: true
        });

        await verify.deleteOne();

        return res.successInsert({}, "Registration submitted successfully. Our team will contact you soon.");
    } catch (error) {
        if (error?.code === 11000) {
            return res.someThingWentWrong({ message: "Duplicate mobile, email, PAN, or Aadhar." });
        }
        return res.someThingWentWrong(error);
    }
};

export const profile = async (req, res) => {
    try {
        const { id } = req.serviceProvider;

        const user = await ServiceProvider.findById(id, "_id userId name mobile email image cityId serviceCategoryId panCardNumber aadharNumber panCardDocument aadharDocument experienceYears experienceDescription registerFrom profileStatus rejectionReason approvedAt isAvailable currentLatitude currentLongitude totalCompletedServices totalRating ratingCount isActive isVerified lastLogin").lean();
        return res.success(user, "User profile fetched successfully");
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
            return res.someThingWentWrong({ message: "No image files were uploaded." });
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

        if (!created.length) return res.someThingWentWrong({ message: "No valid images were saved." });
        return res.successInsert({ record: created }, "Photos uploaded.");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const deleteWorkPhoto = async (req, res) => {
    try {

        const photoId = ObjectId(req.params.photoId);
        if (!photoId) return res.someThingWentWrong({ message: "Invalid photo id." });

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
            return res.someThingWentWrong({ message: "orderedIds must be a non-empty array." });
        }

        const ids = orderedIds.map((x) => ObjectId(x)).filter(Boolean);
        if (ids.length !== orderedIds.length) {
            return res.someThingWentWrong({ message: "Invalid photo id in orderedIds." });
        }

        const existing = await ServiceProviderPhoto.find({ providerId: id }, "_id").lean();
        if (existing.length !== ids.length) {
            return res.someThingWentWrong({ message: "Photo list does not match server state." });
        }

        const idSet = new Set(existing.map((row) => String(row._id)));
        for (const id of ids) {
            if (!idSet.has(String(id))) {
                return res.someThingWentWrong({ message: "Unknown photo id in orderedIds." });
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

export const listProviderBookings = async (req, res) => {
    try {
        const limit = Number.isFinite(Number(req.query.limit)) ? Math.min(Math.max(Number(req.query.limit), 1), 50) : 10;
        const pageNo = Number.isFinite(Number(req.query.pageNo)) ? Math.max(Number(req.query.pageNo), 1) : 1;
        const status = String(req.query.status || "").trim();
        const filter = { providerId: req.serviceProvider._id };
        if (status) filter.status = status;

        const [record, countRows] = await Promise.all([
            Booking.find(filter).sort({ createdAt: -1 }).skip((pageNo - 1) * limit).limit(limit).lean(),
            Booking.aggregate([{ $match: filter }, { $count: "total_count" }])
        ]);
        const total = countRows.length > 0 ? countRows[0].total_count : 0;
        return res.pagination(record, total, limit, pageNo);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const setBookingQuote = async (req, res) => {
    try {
        const booking = await Booking.findOne({ _id: ObjectId(req.params.bookingId), providerId: req.serviceProvider._id });
        if (!booking) return res.noRecords(false, "Booking not found.");
        if (["completed", "cancelled"].includes(booking.status)) return res.someThingWentWrong({ message: "This booking cannot be quoted." });

        booking.quotedPrice = Number(req.body.quotedPrice);
        booking.status = "price_pending";
        await booking.save();
        return res.successUpdate(booking, "Quote sent successfully.");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const listProviderBookingMessages = async (req, res) => {
    try {
        const booking = await Booking.findOne({ _id: ObjectId(req.params.bookingId), providerId: req.serviceProvider._id }, { _id: 1 });
        if (!booking) return res.noRecords(false, "Booking not found.");

        const messages = await ChatMessage.find({ bookingId: booking._id }).sort({ createdAt: 1 }).lean();
        return res.success(messages);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const sendProviderBookingMessage = async (req, res) => {
    try {
        const booking = await Booking.findOne({ _id: ObjectId(req.params.bookingId), providerId: req.serviceProvider._id }, { _id: 1 });
        if (!booking) return res.noRecords(false, "Booking not found.");

        const message = await ChatMessage.create({ bookingId: booking._id, senderId: req.serviceProvider._id, senderType: "provider", message: String(req.body.message || "").trim() });
        req.app.locals.io?.to(`booking:${booking._id}`).emit("booking:message", message);
        return res.successInsert(message, "Message sent.");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};
