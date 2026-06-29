import moment from "moment";
import { AssignedSubscription } from "../models/index.js";
import { startOfDay } from "./utils.js";

export const PROVIDER_FILTER = { deletedAt: null, isActive: true, profileStatus: "approved", isVerified: true };
export const FILTER_ACTIVE_SUBSCRIPTION = { status: "active", startDate: { $lte: startOfDay() }, endDate: { $gte: startOfDay() } };
export const PROVIDER_PIPELINE = [
    { $lookup: { from: "assignedsubscriptions", localField: "_id", foreignField: "providerId", as: "subscription", pipeline: [{ $match: FILTER_ACTIVE_SUBSCRIPTION }, { $sort: { createdAt: -1 } }, { $limit: 1 }] } },
    { $unwind: { path: "$subscription" } },
];

export const computeSubscriptionEndDate = (startDate, interval, intervalCount = 1) => {
    const start = moment(startDate).startOf("day");
    const count = Math.max(Number(intervalCount) || 1, 1);

    if (interval === "day") return start.clone().add(count, "days").subtract(1, "day").endOf("day").toDate();
    if (interval === "month") return start.clone().add(count, "months").subtract(1, "day").endOf("day").toDate();
    if (interval === "year") return start.clone().add(count, "years").subtract(1, "day").endOf("day").toDate();

    return start.endOf("day").toDate();
};

export const parseAssignmentStartDate = (value) => {
    const parsed = moment(value, ["YYYY-MM-DD", moment.ISO_8601], true);
    return parsed.isValid() ? parsed.startOf("day").toDate() : null;
};

export const resolveProviderPurchaseSchedule = async (providerId, plan, session) => {
    const today = moment().startOf("day");
    let startDate = today.toDate();

    const currentActiveAssignment = await AssignedSubscription.findOne({ providerId, ...FILTER_ACTIVE_SUBSCRIPTION }).session(session).lean();
    if (currentActiveAssignment) {
        startDate = moment(currentActiveAssignment.endDate).add(1, "day").startOf("day").toDate();
    }

    const endDate = computeSubscriptionEndDate(startDate, plan.interval, plan.intervalCount);
    return { startDate, endDate };
};

export const buildAssignedSubscriptionListPipeline = (match) => [
    { $match: match },
    { $lookup: { from: "subscriptions", localField: "subscriptionId", foreignField: "_id", as: "plan" } },
    { $unwind: { path: "$plan", preserveNullAndEmptyArrays: true } },
    {
        $project: {
            _id: 1,
            voucherNo: 1,
            subscriptionId: 1,
            startDate: 1,
            endDate: 1,
            status: 1,
            amount: { $ifNull: ["$amount", "$paymentAmount", 0] },
            taxPercentage: { $ifNull: ["$taxPercentage", 0] },
            taxAmount: { $ifNull: ["$taxAmount", 0] },
            paymentAmount: { $ifNull: ["$paymentAmount", 0] },
            paymentGatewayTransactionStatus: 1,
            paymentGatewayTransactionMessage: 1,
            assignedBy: 1,
            createdAt: 1,
            source: { $cond: [{ $ifNull: ["$assignedBy", false] }, "admin", "self"] },
            planName: { $ifNull: ["$plan.name", ""] },
            planCode: { $ifNull: ["$plan.subscriptionId", ""] },
            planPrice: { $ifNull: ["$plan.price", 0] },
            planInterval: { $ifNull: ["$plan.interval", ""] },
            planIntervalCount: { $ifNull: ["$plan.intervalCount", 1] },
            planImage: { $ifNull: ["$plan.image", ""] },
        },
    },
];