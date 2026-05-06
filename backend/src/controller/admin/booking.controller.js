import { Booking, ChatMessage } from "../../models/index.js";
import { ObjectId, escapeRegex } from "../../helpers/utils.js";

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
        const status = String(req.query.status || "").trim();
        const query = String(req.query.query || "").trim();

        const filter = {};
        if (status) filter.status = status;

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

        if (query) {
            const q = escapeRegex(query);
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

export const getBookingDetail = async (req, res) => {
    try {
        const [booking] = await Booking.aggregate(bookingDetailPipeline({ _id: ObjectId(req.params.id) }));
        if (!booking) return res.noRecords(false, "Booking not found.");

        const messages = await ChatMessage.find({ bookingId: booking._id }).sort({ createdAt: 1 }).lean();
        return res.success({ booking, messages });
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};
