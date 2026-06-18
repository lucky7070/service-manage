import mongoose from "mongoose";
import { AssignedSubscription, ServiceProvider, Subscription } from "../../models/index.js";
import { ObjectId } from "../../helpers/utils.js";
import { resolveProviderPurchaseSchedule, buildAssignedSubscriptionListPipeline } from "../../helpers/subscriptionAssignment.js";

export const getProviderAssignedSubscriptions = async (req, res) => {
    try {
        const provider = await ServiceProvider.findOne({ _id: ObjectId(req.params.id), deletedAt: null }, "_id name mobile email cityId serviceCategoryId").lean();
        if (!provider) return res.noRecords();

        const record = await AssignedSubscription.aggregate([
            ...buildAssignedSubscriptionListPipeline({ providerId: ObjectId(provider._id) }),
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

        const { startDate, endDate } = await resolveProviderPurchaseSchedule(provider._id, plan, session);
        const [doc] = await AssignedSubscription.create([{
            providerId: provider._id,
            subscriptionId: plan._id,
            startDate,
            endDate,
            status: "active",
            paymentAmount: Number(plan.price) || 0,
            paymentGatewayTransactionStatus: "success",
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