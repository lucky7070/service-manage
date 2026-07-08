import mongoose from "mongoose";
import { AssignedSubscription, ServiceProvider, Subscription } from "../../models/index.js";
import { ObjectId, escapeRegex } from "../../helpers/utils.js";
import { resolveProviderPurchaseSchedule, buildAssignedSubscriptionListPipeline } from "../../helpers/subscriptionAssignment.js";
import { getRazorpayGatewaySnapshot, paiseToRupees } from "../../helpers/razorpay.js";
import { syncAssignedSubscriptionFromRazorpayPayment } from "../../helpers/subscriptionPayment.js";

const formatGatewayPayment = (payment) => {
    if (!payment) return null;

    return {
        id: payment.id,
        orderId: payment.order_id,
        status: payment.status,
        method: payment.method || null,
        amount: paiseToRupees(payment.amount),
        amountInPaise: Number(payment.amount || 0),
        currency: payment.currency || "INR",
        email: payment.email || null,
        contact: payment.contact || null,
        errorCode: payment.error_code || null,
        errorDescription: payment.error_description || payment.error_reason || null,
        createdAt: payment.created_at ? new Date(Number(payment.created_at) * 1000).toISOString() : null,
    };
};

export const getPurchasedPlanGatewayStatus = async (req, res) => {
    try {
        let assignment = await AssignedSubscription.findById(ObjectId(req.params.id)).lean();
        if (!assignment) return res.noRecords();

        const orderId = String(assignment.paymentGatewayOrderId || "").trim();
        if (!orderId) {
            return res.clientError("No Razorpay order is linked to this purchase.", 422);
        }

        const { order, payments, latestPayment } = await getRazorpayGatewaySnapshot(orderId);
        if (assignment.paymentGatewayTransactionStatus === "pending") {
            const result = await syncAssignedSubscriptionFromRazorpayPayment({ assignment, payment: latestPayment });
            if (result.ok) assignment = result.assignment;
        }

        return res.success({
            assignment: {
                _id: assignment._id,
                voucherNo: assignment.voucherNo,
                paymentAmount: assignment.paymentAmount,
                paymentGatewayOrderId: assignment.paymentGatewayOrderId,
                paymentGatewayTransactionId: assignment.paymentGatewayTransactionId,
                paymentGatewayTransactionStatus: assignment.paymentGatewayTransactionStatus,
                paymentGatewayTransactionMessage: assignment.paymentGatewayTransactionMessage,
                status: assignment.status,
            },
            order: {
                id: order.id,
                status: order.status,
                amount: paiseToRupees(order.amount),
                amountPaid: paiseToRupees(order.amount_paid),
                amountDue: paiseToRupees(order.amount_due),
                currency: order.currency || "INR",
                receipt: order.receipt || null,
                attempts: Number(order.attempts || 0),
                createdAt: order.created_at ? new Date(Number(order.created_at) * 1000).toISOString() : null,
            },
            latestPayment: formatGatewayPayment(latestPayment),
            payments: payments.map(formatGatewayPayment).filter(Boolean),
        }, "Gateway status fetched.");
    } catch (error) {
        if (error?.status === 503) return res.clientError(error.message, 503);
        return res.someThingWentWrong(error);
    }
};

export const listPurchasedPlans = async (req, res) => {
    try {
        const limit = Number.isFinite(Number(req.query.limit)) ? Math.min(Math.max(Number(req.query.limit), 1), 50) : 10;
        const pageNo = Number.isFinite(Number(req.query.pageNo)) ? Math.max(Number(req.query.pageNo), 1) : 1;
        const sortBy = ["createdAt", "startDate", "endDate", "paymentAmount", "status"].includes(String(req.query.sortBy)) ? String(req.query.sortBy) : "createdAt";
        const sortOrder = String(req.query.sortOrder || "desc").toLowerCase() === "asc" ? "asc" : "desc";

        const filter = {};
        const paymentStatus = String(req.query.paymentStatus || "").trim();
        if (paymentStatus && ["success", "failed", "pending"].includes(paymentStatus)) {
            filter.paymentGatewayTransactionStatus = paymentStatus;
        }

        const status = String(req.query.status || "").trim();
        if (status && ["active", "inactive"].includes(status)) filter.status = status;

        const source = String(req.query.source || "").trim();
        if (source === "self") filter.assignedBy = null;
        if (source === "admin") filter.assignedBy = { $ne: null };

        const pipeline = [...buildAssignedSubscriptionListPipeline(filter)];
        const query = String(req.query.query || "").trim();
        if (query) {
            const q = escapeRegex(query);
            pipeline.push({
                $match: {
                    $or: [
                        { voucherNo: { $regex: q, $options: "i" } },
                        { planName: { $regex: q, $options: "i" } },
                        { planCode: { $regex: q, $options: "i" } },
                        { providerName: { $regex: q, $options: "i" } },
                        { providerMobile: { $regex: q, $options: "i" } },
                        { paymentGatewayOrderId: { $regex: q, $options: "i" } },
                        { paymentGatewayTransactionId: { $regex: q, $options: "i" } },
                    ],
                },
            });
        }

        const totalCountPipeline = [...pipeline, { $count: "total_count" }];
        const resultsPipeline = [
            ...pipeline,
            { $sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 } },
            { $skip: (pageNo - 1) * limit },
            { $limit: limit },
        ];

        const [results, totalCount] = await Promise.all([
            AssignedSubscription.aggregate(resultsPipeline),
            AssignedSubscription.aggregate(totalCountPipeline),
        ]);
        const total_count = totalCount.length > 0 ? totalCount[0].total_count : 0;

        if (results.length > 0) return res.pagination(results, total_count, limit, pageNo);
        return res.datatableNoRecords();
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

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