import moment from "moment";
import { Address, AssignedSubscription, Booking, ChatMessage, City, Customer, ProviderService, ServiceProvider, State } from "../../models/index.js";
import { ObjectId, escapeRegex, optionalNumber, toBoolean } from "../../helpers/utils.js";
import { applyCreatedAtRange, formatExportDateTime, sendExcelResponse } from "../../helpers/excelExport.js";
import { getActiveSubscriptionFilter } from "../../helpers/subscriptionAssignment.js";
import { getProviderCategoryIds, providerServiceTypeCategoryMatch } from "../../helpers/providerCategories.js";
import { bookingStatusMail } from "../../libraries/mail.js";
import { notifyBookingStatusChange } from "../../helpers/bookingNotifications.js";
import { PHONE_REGEXP } from "../../config/constants.js";

const buildBookingListPipeline = (query) => {
    const status = String(query.status || "").trim();
    const searchQuery = String(query.query || "").trim();
    const dateFrom = String(query.dateFrom || "").trim();
    const dateTo = String(query.dateTo || "").trim();

    const filter = { deletedAt: null };
    if (status) filter.status = status;
    applyCreatedAtRange(filter, dateFrom, dateTo);

    const pipeline = [
        { $match: filter },
        { $lookup: { from: "customers", localField: "customerId", foreignField: "_id", as: "customer" } },
        { $lookup: { from: "serviceproviders", localField: "providerId", foreignField: "_id", as: "provider" } },
        { $lookup: { from: "servicecategories", localField: "serviceCategoryId", foreignField: "_id", as: "category" } },
        { $lookup: { from: "cities", localField: "cityId", foreignField: "_id", as: "city" } },
        {
            $project: {
                bookingNumber: 1,
                status: 1,
                quotedPrice: 1,
                finalPrice: 1,
                scheduledTime: 1,
                bookingTime: 1,
                customerName: { $ifNull: [{ $first: "$customer.name" }, ""] },
                customerMobile: { $ifNull: [{ $first: "$customer.mobile" }, ""] },
                providerName: { $ifNull: [{ $first: "$provider.name" }, ""] },
                serviceCategoryName: { $ifNull: [{ $first: "$category.name" }, ""] },
                cityName: { $ifNull: [{ $first: "$city.name" }, ""] },
                createdAt: 1
            }
        }
    ];

    if (searchQuery) {
        const q = escapeRegex(searchQuery);
        pipeline.push({
            $match: {
                $or: [
                    { bookingNumber: { $regex: q, $options: "i" } },
                    { customerName: { $regex: q, $options: "i" } },
                    { customerMobile: { $regex: q, $options: "i" } },
                    { providerName: { $regex: q, $options: "i" } },
                    { serviceCategoryName: { $regex: q, $options: "i" } }
                ]
            }
        });
    }

    return pipeline;
};

const bookingDetailPipeline = (match) => [
    { $match: match },
    { $lookup: { from: "customers", localField: "customerId", foreignField: "_id", as: "customer" } },
    { $lookup: { from: "serviceproviders", localField: "providerId", foreignField: "_id", as: "provider" } },
    { $lookup: { from: "servicecategories", localField: "serviceCategoryId", foreignField: "_id", as: "category" } },
    { $lookup: { from: "servicetypes", localField: "serviceTypeId", foreignField: "_id", as: "serviceTypes" } },
    { $lookup: { from: "cities", localField: "cityId", foreignField: "_id", as: "city" } },
    {
        $project: {
            bookingNumber: 1,
            customerId: 1,
            providerId: 1,
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
            customerName: { $ifNull: [{ $first: "$customer.name" }, ""] },
            customerMobile: { $ifNull: [{ $first: "$customer.mobile" }, ""] },
            providerName: { $ifNull: [{ $first: "$provider.name" }, ""] },
            providerMobile: { $ifNull: [{ $first: "$provider.mobile" }, ""] },
            serviceCategoryName: { $ifNull: [{ $first: "$category.name" }, ""] },
            cityName: { $ifNull: [{ $first: "$city.name" }, ""] },
            serviceTypes: { $map: { input: "$serviceTypes", as: "serviceType", in: { _id: "$$serviceType._id", name: "$$serviceType.name", basePrice: "$$serviceType.basePrice", estimatedTimeMinutes: "$$serviceType.estimatedTimeMinutes" } } },
            createdAt: 1,
            updatedAt: 1
        }
    }
];

export const getBookings = async (req, res) => {
    try {
        const limit = Number.isFinite(Number(req.query.limit)) ? Math.min(Math.max(Number(req.query.limit), 1), 50) : 10;
        const pageNo = Number.isFinite(Number(req.query.pageNo)) ? Math.max(Number(req.query.pageNo), 1) : 1;
        const pipeline = buildBookingListPipeline(req.query);

        const totalCountPipeline = [...pipeline, { $count: "total_count" }];
        const resultsPipeline = [...pipeline, { $sort: { createdAt: -1 } }, { $skip: (pageNo - 1) * limit }, { $limit: limit }];
        const [results, totalCount] = await Promise.all([Booking.aggregate(resultsPipeline), Booking.aggregate(totalCountPipeline)]);
        const total = totalCount.length > 0 ? totalCount[0].total_count : 0;

        if (!results.length) return res.datatableNoRecords();
        return res.pagination(results, total, limit, pageNo);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const exportBookings = async (req, res) => {
    try {
        const pipeline = buildBookingListPipeline(req.query);
        const results = await Booking.aggregate([...pipeline, { $sort: { createdAt: -1 } }]);

        const rows = results.map((row) => ({
            bookingNumber: row.bookingNumber || "",
            customerName: row.customerName || "",
            customerMobile: row.customerMobile || "",
            providerName: row.providerName || "",
            serviceCategoryName: row.serviceCategoryName || "",
            cityName: row.cityName || "",
            status: String(row.status || "").replaceAll("_", " "),
            quotedPrice: row.quotedPrice ?? "",
            finalPrice: row.finalPrice ?? "",
            scheduledTime: formatExportDateTime(row.scheduledTime),
            createdAt: formatExportDateTime(row.createdAt)
        }));

        return sendExcelResponse(res, {
            filename: `bookings-${moment().format("YYYY-MM-DD")}.xlsx`,
            sheetName: "Bookings",
            columns: [
                { header: "Booking #", key: "bookingNumber", width: 16 },
                { header: "Customer", key: "customerName", width: 22 },
                { header: "Customer Mobile", key: "customerMobile", width: 14 },
                { header: "Provider", key: "providerName", width: 22 },
                { header: "Service Category", key: "serviceCategoryName", width: 20 },
                { header: "City", key: "cityName", width: 16 },
                { header: "Status", key: "status", width: 14 },
                { header: "Quoted Price", key: "quotedPrice", width: 14 },
                { header: "Final Price", key: "finalPrice", width: 14 },
                { header: "Scheduled Time", key: "scheduledTime", width: 22 },
                { header: "Created At", key: "createdAt", width: 22 }
            ],
            rows
        });
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const getBookingDetail = async (req, res) => {
    try {
        const [booking] = await Booking.aggregate(bookingDetailPipeline({ _id: ObjectId(req.params.id), deletedAt: null }));
        if (!booking) return res.noRecords(false, "Booking not found.");

        const messages = await ChatMessage.find({ bookingId: booking._id }).sort({ createdAt: 1 }).lean();
        return res.success({ booking, messages });
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const lookupCustomerByMobile = async (req, res) => {
    try {
        const mobile = String(req.query.mobile || "").trim();
        if (!PHONE_REGEXP.test(mobile)) {
            return res.clientError("Enter a valid Indian mobile number.", 422, [{ field: "mobile", message: "Enter a valid Indian mobile number." }]);
        }

        const customer = await Customer.findOne({ mobile, deletedAt: null }).lean();
        if (!customer) {
            return res.success({ exists: false, customer: null, addresses: [] }, "Customer not found.");
        }

        const addresses = await Address.aggregate([
            { $match: { customerId: customer._id, deletedAt: null } },
            { $lookup: { from: "states", localField: "state", foreignField: "_id", as: "stateDoc" } },
            { $lookup: { from: "cities", localField: "city", foreignField: "_id", as: "cityDoc" } },
            { $unwind: { path: "$stateDoc", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$cityDoc", preserveNullAndEmptyArrays: true } },
            { $project: { addressLine1: 1, addressLine2: 1, landmark: 1, state: 1, city: 1, stateName: { $ifNull: ["$stateDoc.name", ""] }, cityName: { $ifNull: ["$cityDoc.name", ""] }, pincode: 1, latitude: 1, longitude: 1, locationType: 1, isDefault: 1 } },
            { $sort: { isDefault: -1, createdAt: -1 } }
        ]);

        return res.success({
            exists: true,
            customer: {
                _id: customer._id,
                userId: customer.userId,
                name: customer.name,
                mobile: customer.mobile,
                email: customer.email || "",
                dateOfBirth: customer.dateOfBirth ? moment(customer.dateOfBirth).format("YYYY-MM-DD") : ""
            },
            addresses
        });
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const createBookingWithCustomer = async (req, res) => {
    try {
        const { name, mobile, email = "", dateOfBirth = "", addressLine1, addressLine2, landmark, state, city, pincode, latitude, longitude, locationType = "home", isDefault = true, providerId, serviceTypeId, scheduledTime, issueDescription } = req.body;

        const normalizedMobile = String(mobile).trim();
        const normalizedEmail = String(email || "").trim().toLowerCase();
        const trimmedName = String(name || "").trim();

        let customer = await Customer.findOne({ mobile: normalizedMobile, deletedAt: null });
        let customerCreated = false;

        if (!customer) {
            if (normalizedEmail) {
                const emailTaken = await Customer.findOne({ email: normalizedEmail, deletedAt: null });
                if (emailTaken) {
                    return res.clientError("Customer with this email already exists.", 422, [{ field: "email", message: "Customer with this email already exists." }]);
                }
            }

            const payload = {
                name: trimmedName,
                mobile: normalizedMobile,
                email: normalizedEmail || null,
                image: "/customers/default.png",
                isActive: true,
                isVerified: true,
                registerFrom: "admin"
            };

            if (dateOfBirth) {
                const dob = new Date(dateOfBirth);
                if (Number.isNaN(dob.getTime())) {
                    return res.clientError("Invalid date of birth.", 422, [{ field: "dateOfBirth", message: "Invalid date of birth." }]);
                }
                payload.dateOfBirth = dob;
            }

            customer = await Customer.create(payload);
            customerCreated = true;
        } else if (!customer.isActive) {
            return res.clientError("This customer account is inactive.", 400);
        }

        const provider = await ServiceProvider.findOne({
            _id: ObjectId(providerId),
            deletedAt: null,
            isActive: true,
            profileStatus: "approved",
            isVerified: true
        });
        if (!provider) return res.noRecords(false, "Service provider not found.");

        const subscription = await AssignedSubscription.findOne({ providerId: provider._id, ...getActiveSubscriptionFilter() });
        if (!subscription) return res.clientError("Provider is not active. Please contact support.", 400);

        const selectedServiceTypeIds = [...new Set((serviceTypeId || []).map((value) => String(value)))]
            .map((value) => ObjectId(value))
            .filter(Boolean);
        if (!selectedServiceTypeIds.length) {
            return res.clientError("At least one service type is required.", 422, [{ field: "serviceTypeId", message: "At least one service type is required." }]);
        }

        const providerCategoryIds = getProviderCategoryIds(provider);
        const providerServices = await ProviderService.aggregate([
            { $match: { providerId: provider._id, serviceTypeId: { $in: selectedServiceTypeIds }, isActive: true } },
            { $lookup: { from: "servicetypes", localField: "serviceTypeId", foreignField: "_id", as: "serviceType" } },
            { $unwind: "$serviceType" },
            { $match: { "serviceType.deletedAt": null, "serviceType.isActive": true, ...providerServiceTypeCategoryMatch(providerCategoryIds) } },
            { $project: { serviceTypeId: 1, categoryId: "$serviceType.categoryId" } }
        ]);

        if (providerServices.length !== selectedServiceTypeIds.length) {
            return res.clientError("One or more selected services are not available for this provider.", 422, [{ field: "serviceTypeId", message: "One or more selected services are not available for this provider." }]);
        }

        const bookingCategoryIds = [...new Set(providerServices.map((row) => String(row.categoryId)).filter(Boolean))];
        if (bookingCategoryIds.length !== 1) {
            return res.clientError("Selected services must belong to the same category.", 422, [{ field: "serviceTypeId", message: "Selected services must belong to the same category." }]);
        }

        const bookingServiceCategoryId = ObjectId(bookingCategoryIds[0]);

        const openBooking = await Booking.findOne({
            customerId: customer._id,
            providerId: provider._id,
            deletedAt: null,
            status: { $nin: ["completed", "cancelled"] }
        }).select("_id bookingNumber status").lean();
        if (openBooking) {
            return res.clientError("This customer already has an open booking with this provider.", 409);
        }

        let address = null;
        let cityName = null;
        let stateName = null;
        const existingAddressId = ObjectId(req.body.addressId);

        if (existingAddressId) {
            address = await Address.findOne({ _id: existingAddressId, customerId: customer._id, deletedAt: null })
                .populate("city", "name")
                .populate("state", "name");
            if (!address) return res.noRecords(false, "Address not found for this customer.");
            cityName = address.city?.name || null;
            stateName = address.state?.name || null;
        } else {
            const stateDoc = await State.findOne({ _id: ObjectId(state), deletedAt: null });
            if (!stateDoc) return res.noRecords(false, "State not found.");

            const cityDoc = await City.findOne({ _id: ObjectId(city), stateId: stateDoc._id, deletedAt: null });
            if (!cityDoc) return res.noRecords(false, "City not found for selected state.");

            if (toBoolean(isDefault)) {
                await Address.updateMany({ customerId: customer._id, deletedAt: null }, { isDefault: false });
            }

            address = await Address.create({
                customerId: customer._id,
                addressLine1: String(addressLine1).trim(),
                addressLine2: String(addressLine2 || "").trim() || null,
                landmark: String(landmark || "").trim() || null,
                state: stateDoc._id,
                city: cityDoc._id,
                pincode: String(pincode).trim(),
                latitude: optionalNumber(latitude),
                longitude: optionalNumber(longitude),
                locationType: locationType || "home",
                isDefault: toBoolean(isDefault)
            });
            cityName = cityDoc.name || null;
            stateName = stateDoc.name || null;
        }

        const booking = await Booking.create({
            customerId: customer._id,
            providerId: provider._id,
            serviceCategoryId: bookingServiceCategoryId,
            serviceTypeId: selectedServiceTypeIds,
            cityId: provider.cityId,
            status: "price_pending",
            issueDescription: issueDescription || null,
            scheduledTime,
            addressId: address._id,
            location: {
                addressLine1: address.addressLine1,
                addressLine2: address.addressLine2,
                landmark: address.landmark,
                city: cityName,
                state: stateName,
                pincode: address.pincode,
                latitude: address.latitude,
                longitude: address.longitude,
                locationType: address.locationType
            }
        });

        const [detail] = await Booking.aggregate(bookingDetailPipeline({ _id: booking._id, deletedAt: null }));
        await bookingStatusMail(booking._id);
        await notifyBookingStatusChange({ booking, previousStatus: null, actorType: "admin" });

        return res.successInsert({
            booking: detail,
            customer: {
                _id: customer._id,
                userId: customer.userId,
                name: customer.name,
                mobile: customer.mobile,
                created: customerCreated
            },
            addressId: address._id
        }, customerCreated ? "Customer registered and booking created." : "Booking created successfully.");
    } catch (error) {
        if (error.code === 11000) return res.clientError("Customer with this mobile or email already exists.", 409);
        return res.someThingWentWrong(error);
    }
};
