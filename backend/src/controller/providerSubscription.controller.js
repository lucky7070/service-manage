import mongoose from "mongoose";
import { AssignedSubscription, Subscription } from "../models/index.js";
import { ObjectId } from "../helpers/utils.js";
import { resolveProviderPurchaseSchedule } from "../helpers/subscriptionAssignment.js";
import { getRazorpayClient, rupeesToPaise, verifyRazorpayPaymentSignature } from "../helpers/razorpay.js";

export const createProviderSubscriptionOrder = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        await session.startTransaction();

        const provider = req.serviceProvider;
        const plan = await Subscription.findOne({ _id: ObjectId(req.body.subscriptionId), deletedAt: null, isActive: true }).session(session).lean();
        if (!plan) {
            if (session.inTransaction()) await session.abortTransaction();
            return res.clientError("Active subscription plan not found.", 422, [{ field: "subscriptionId", message: "Active subscription plan not found." }]);
        }

        const paymentAmount = Number(plan.price) || 0;
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
            paymentStatus: "unpaid",
            paymentDate: null,
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
        assignment.orderId = razorpayOrder.id;
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
            paymentStatus: assignment.paymentStatus,
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

        const assignment = await AssignedSubscription.findOne({ providerId: provider._id, paymentStatus: "unpaid", paymentGatewayOrderId: razorpayOrderId }).session(session);
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

        if (payment.status === "failed") {
            assignment.paymentGatewayTransactionStatus = "failed";
            assignment.paymentGatewayTransactionMessage = "Payment failed.";
            await assignment.save({ session });
            await session.commitTransaction();
            return res.clientError("Payment failed.", 422);
        }

        if (payment.amount !== rupeesToPaise(assignment.paymentAmount)) {
            assignment.paymentGatewayTransactionStatus = "failed";
            assignment.paymentGatewayTransactionMessage = "Payment amount mismatch.";
            await assignment.save({ session });
            await session.commitTransaction();
            return res.clientError("Payment amount mismatch.", 422);
        }

        if (payment.status === "captured") {
            assignment.paymentGatewayOrderId = razorpayOrderId;
            assignment.paymentGatewayTransactionStatus = "success";
            assignment.paymentGatewayTransactionMessage = "Payment successful.";
            assignment.paymentStatus = "paid";
            assignment.paymentDate = new Date();
            assignment.status = moment(assignment.startDate).isSame(moment(), "day") ? "active" : "inactive";
            await assignment.save({ session });
            await session.commitTransaction();

            return res.successUpdate({
                assignmentId: assignment._id,
                voucherNo: assignment.voucherNo,
                paymentStatus: assignment.paymentStatus,
                paymentDate: assignment.paymentDate,
                paymentGatewayTransactionStatus: assignment.paymentGatewayTransactionStatus,
                status: assignment.status,
                startDate: assignment.startDate,
                endDate: assignment.endDate,
            }, assignment.status === "active" ? "Subscription activated." : "Payment successful. Plan is queued to start on the scheduled date.");
        } else {
            assignment.paymentGatewayTransactionStatus = "pending";
            assignment.paymentGatewayTransactionMessage = "Payment not captured yet.";
            await assignment.save({ session });
            await session.commitTransaction();
            return res.clientError("Payment not captured yet. Please try again.", 422);
        }
    } catch (error) {
        if (session.inTransaction()) await session.abortTransaction();
        if (error?.status === 503) return res.clientError(error.message, 503);
        return res.someThingWentWrong(error);
    } finally {
        await session.endSession();
    }
};
