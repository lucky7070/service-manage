import moment from "moment";
import { Booking, ChatMessage } from "../../models/index.js";
import { ObjectId, escapeRegex } from "../../helpers/utils.js";
import { applyCreatedAtRange, formatExportDateTime, sendExcelResponse } from "../../helpers/excelExport.js";

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
