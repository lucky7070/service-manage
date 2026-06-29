import mongoose from "mongoose";
import { AssignedSubscription, Subscription } from "../../models/index.js";
import { ObjectId } from "../../helpers/utils.js";
import { resolveProviderPurchaseSchedule, buildAssignedSubscriptionListPipeline } from "../../helpers/subscriptionAssignment.js";
import { getRazorpayClient, rupeesToPaise, verifyRazorpayPaymentSignature } from "../../helpers/razorpay.js";
import { syncAssignedSubscriptionFromRazorpayPayment } from "../../helpers/subscriptionPayment.js";

export const createProviderSubscriptionOrder = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        await session.startTransaction();

        const provider = req.serviceProvider;
        const plan = await Subscription.findOne({ _id: ObjectId(req.body.subscriptionId), deletedAt: null, isActive: true }).session(session);
        if (!plan) {
            if (session.inTransaction()) await session.abortTransaction();
            return res.clientError("Active subscription plan not found.", 422, [{ field: "subscriptionId", message: "Active subscription plan not found." }]);
        }

        const paymentAmount = Number(plan.priceWithTax) || 0;
        if (paymentAmount <= 0) {
            if (session.inTransaction()) await session.abortTransaction();
            return res.clientError("Plan price must be greater than 0.", 422, [{ field: "subscriptionId", message: "Plan price must be greater than 0." }]);
        }

        const { startDate, endDate } = await resolveProviderPurchaseSchedule(provider._id, plan, session);
        const { client, key_id } = await getRazorpayClient();

        const [assignment] = await AssignedSubscription.create([{
            providerId: provider._id,
            subscriptionId: plan._id,
            startDate,
            endDate,
            status: "inactive",
            amount: Number(plan.price) || 0,
            taxAmount: Number(plan.price) * (plan.taxPercentage || 0) / 100,
            taxPercentage: plan.taxPercentage || 0,
            paymentAmount,
            paymentGatewayTransactionStatus: "pending",
            assignedBy: null,
        }], { session });

        const razorpayOrder = await client.orders.create({
            amount: rupeesToPaise(paymentAmount),
            currency: "INR",
            receipt: assignment.voucherNo || String(assignment._id),
            notes: {
                assignmentId: String(assignment._id),
                providerId: String(provider._id),
                subscriptionId: String(plan._id),
            },
        });

        assignment.paymentGatewayOrderId = razorpayOrder.id;
        await assignment.save({ session });

        await session.commitTransaction();

        return res.successInsert({
            assignmentId: assignment._id,
            voucherNo: assignment.voucherNo,
            subscriptionId: plan._id,
            planName: plan.name,
            startDate: assignment.startDate,
            endDate: assignment.endDate,
            paymentAmount,
            status: assignment.status,
            razorpayKey: key_id,
            razorpayOrderId: razorpayOrder.id,
            amountInPaise: razorpayOrder.amount,
            currency: razorpayOrder.currency,
        }, "Payment order created.");
    } catch (error) {
        if (session.inTransaction()) await session.abortTransaction();
        if (error?.status === 503) return res.clientError(error.message, 503);
        return res.someThingWentWrong(error);
    } finally {
        await session.endSession();
    }
};

export const listProviderSubscriptionHistory = async (req, res) => {
    try {
        const limit = Number.isFinite(Number(req.query.limit)) ? Math.min(Math.max(Number(req.query.limit), 1), 50) : 10;
        const pageNo = Number.isFinite(Number(req.query.pageNo)) ? Math.max(Number(req.query.pageNo), 1) : 1;
        const sortBy = ["createdAt", "startDate", "endDate", "paymentAmount", "status"].includes(String(req.query.sortBy)) ? String(req.query.sortBy) : "createdAt";
        const sortOrder = String(req.query.sortOrder || "desc").toLowerCase() === "asc" ? "asc" : "desc";

        const filter = { providerId: req.serviceProvider._id };

        const status = String(req.query.status || "").trim();
        if (status && ["active", "inactive"].includes(status)) filter.status = status;

        const paymentStatus = String(req.query.paymentStatus || "").trim();
        if (paymentStatus && ["success", "failed", "pending"].includes(paymentStatus)) {
            filter.paymentGatewayTransactionStatus = paymentStatus;
        }

        const source = String(req.query.source || "").trim();
        if (source === "self") filter.assignedBy = null;
        if (source === "admin") filter.assignedBy = { $ne: null };

        const pipeline = buildAssignedSubscriptionListPipeline(filter);
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

export const updateProviderSubscriptionPayment = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        await session.startTransaction();

        const provider = req.serviceProvider;
        const razorpayOrderId = String(req.body.razorpay_order_id || "").trim();
        const razorpayPaymentId = String(req.body.razorpay_payment_id || "").trim();
        const razorpaySignature = String(req.body.razorpay_signature || "").trim();

        if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
            if (session.inTransaction()) await session.abortTransaction();
            return res.clientError("Razorpay payment details are required.", 422, [
                { field: "razorpay_order_id", message: "Required." },
                { field: "razorpay_payment_id", message: "Required." },
                { field: "razorpay_signature", message: "Required." },
            ]);
        }

        const assignment = await AssignedSubscription.findOne({ providerId: provider._id, paymentGatewayOrderId: razorpayOrderId }).session(session);
        if (!assignment) {
            if (session.inTransaction()) await session.abortTransaction();
            return res.noRecords();
        }

        const { client, key_secret } = await getRazorpayClient();
        const signatureValid = verifyRazorpayPaymentSignature({ orderId: razorpayOrderId, paymentId: razorpayPaymentId, signature: razorpaySignature, secret: key_secret, });

        if (!signatureValid) {
            await session.commitTransaction();
            return res.clientError("Invalid payment signature.", 422);
        }

        assignment.paymentGatewayTransactionId = razorpayPaymentId;

        const payment = await client.payments.fetch(razorpayPaymentId);
        if (payment.order_id !== razorpayOrderId) {
            assignment.paymentGatewayTransactionStatus = "failed";
            assignment.paymentGatewayTransactionMessage = "Payment order mismatch.";
            await assignment.save({ session });
            await session.commitTransaction();
            return res.clientError("Payment order mismatch.", 422);
        }

        const result = await syncAssignedSubscriptionFromRazorpayPayment({ assignment, payment, session });
        await session.commitTransaction();

        if (result.ok) {
            return res.successUpdate({
                assignmentId: assignment._id,
                voucherNo: assignment.voucherNo,
                paymentGatewayTransactionStatus: assignment.paymentGatewayTransactionStatus,
                status: assignment.status,
                startDate: assignment.startDate,
                endDate: assignment.endDate,
            }, "Payment successful.");
        }

        if (result.reason === "failed") {
            return res.clientError(assignment.paymentGatewayTransactionMessage || "Payment failed.", 422);
        }

        if (result.reason === "amount_mismatch") {
            return res.clientError("Payment amount mismatch.", 422);
        }

        return res.clientError(assignment.paymentGatewayTransactionMessage || "Payment not captured yet. Please try again.", 422);
    } catch (error) {
        if (session.inTransaction()) await session.abortTransaction();
        if (error?.status === 503) return res.clientError(error.message, 503);
        return res.someThingWentWrong(error);
    } finally {
        await session.endSession();
    }
};
