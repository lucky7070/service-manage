import moment from "moment";
import mongoose from "mongoose";
import { AssignedSubscription, ServiceProvider, Subscription } from "../../models/index.js";
import { ObjectId } from "../../helpers/utils.js";
import { computeSubscriptionEndDate } from "../../helpers/subscriptionAssignment.js";

export const getProviderAssignedSubscriptions = async (req, res) => {
    try {
        const provider = await ServiceProvider.findOne({ _id: ObjectId(req.params.id), deletedAt: null }, "_id name mobile email cityId serviceCategoryId").lean();
        if (!provider) return res.noRecords();

        const record = await AssignedSubscription.aggregate([
            { $match: { providerId: ObjectId(provider._id) } },
            { $lookup: { from: "subscriptions", localField: "subscriptionId", foreignField: "_id", as: "plan" } },
            { $unwind: { path: "$plan", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1,
                    voucherNo: 1,
                    providerId: 1,
                    subscriptionId: 1,
                    startDate: 1,
                    endDate: 1,
                    status: 1,
                    paymentStatus: 1,
                    paymentDate: 1,
                    paymentAmount: 1,
                    assignedBy: 1,
                    createdAt: 1,
                    planName: { $ifNull: ["$plan.name", ""] },
                    planCode: { $ifNull: ["$plan.subscriptionId", ""] },
                    planPrice: { $ifNull: ["$plan.price", 0] },
                    planInterval: { $ifNull: ["$plan.interval", ""] },
                    planIntervalCount: { $ifNull: ["$plan.intervalCount", 1] },
                },
            },
            { $sort: { createdAt: -1 } },
        ]);
        return res.success({ provider, record });
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const assignSubscriptionToProvider = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        await session.startTransaction();

        const provider = await ServiceProvider.findOne({ _id: ObjectId(req.params.id), deletedAt: null }, "_id name mobile email cityId serviceCategoryId").session(session).lean();
        if (!provider) {
            if (session.inTransaction()) await session.abortTransaction();
            return res.noRecords();
        }

        const plan = await Subscription.findOne({ _id: ObjectId(req.body.subscriptionId), deletedAt: null, isActive: true }).session(session).lean();
        if (!plan) {
            if (session.inTransaction()) await session.abortTransaction();
            return res.clientError("Active subscription plan not found.", 422, [{ field: "subscriptionId", message: "Active subscription plan not found." }]);
        }

        const today = moment().startOf("day");
        let startDate = today.toDate();
        const currentActiveAssignment = await AssignedSubscription.findOne({ providerId: provider._id, status: "active", startDate: { $lte: startDate }, endDate: { $gte: startDate } }).session(session).lean();
        if (currentActiveAssignment) {
            startDate = moment(currentActiveAssignment.endDate).add(1, "day").startOf("day").toDate();
        }

        const endDate = computeSubscriptionEndDate(startDate, plan.interval, plan.intervalCount);

        const status = moment(startDate).isSame(today, "day") ? "active" : "inactive";
        if (status === "active") {
            await AssignedSubscription.updateMany({ providerId: provider._id, endDate: { $gte: startDate }, status: "active" }, { $set: { status: "inactive" } }, { session });
        }

        const [doc] = await AssignedSubscription.create([{
            providerId: provider._id,
            subscriptionId: plan._id,
            startDate,
            endDate,
            status,
            paymentStatus: "unpaid",
            paymentDate: null,
            paymentAmount: Number(plan.price) || 0,
            assignedBy: req.admin._id,
        }], { session });

        await session.commitTransaction();
        return res.successInsert(doc, "Subscription plan assigned to provider.");
    } catch (error) {
        if (session.inTransaction()) await session.abortTransaction();
        return res.someThingWentWrong(error);
    } finally {
        await session.endSession();
    }
};