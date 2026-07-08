import mongoose from "mongoose";
import { AssignedSubscription } from "../models/index.js";
import { getRazorpayWebhookSecret, verifyRazorpayWebhookSignature } from "../helpers/razorpay.js";
import { syncAssignedSubscriptionFromRazorpayPayment } from "../helpers/subscriptionPayment.js";
import logger from "../helpers/logger.js";

const HANDLED_EVENTS = new Set(["payment.captured", "payment.failed"]);

export const razorpayWebhook = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const signature = String(req.headers["x-razorpay-signature"] || "").trim();
        const body = req.body;

        logger.webhook("Razorpay webhook received:", { signature, body });
        if (!signature || !body || typeof body !== "object") {
            return res.status(400).json({ status: false, message: "Invalid webhook payload.", data: [] });
        }

        const secret = await getRazorpayWebhookSecret();
        if (!secret) {
            return res.status(503).json({ status: false, message: "Razorpay webhook is not configured.", data: [] });
        }

        const signatureValid = verifyRazorpayWebhookSignature({ body, signature, secret });
        if (!signatureValid) {
            return res.status(400).json({ status: false, message: "Invalid webhook signature.", data: [] });
        }

        const eventType = String(body?.event || "").trim();
        if (!HANDLED_EVENTS.has(eventType)) {
            return res.status(200).json({ status: true, message: "Event ignored.", data: { event: eventType } });
        }

        const payment = body?.payload?.payment?.entity;
        const razorpayOrderId = String(payment?.order_id || "").trim();

        if (!payment || !razorpayOrderId) {
            return res.status(200).json({ status: true, message: "No payment entity in webhook.", data: [] });
        }

        await session.startTransaction();

        const assignment = await AssignedSubscription.findOne({ paymentGatewayOrderId: razorpayOrderId }).session(session);
        if (!assignment) {
            if (session.inTransaction()) await session.abortTransaction();
            return res.status(200).json({ status: true, message: "No matching subscription assignment.", data: [] });
        }

        const result = await syncAssignedSubscriptionFromRazorpayPayment({ assignment, payment, session });
        await session.commitTransaction();

        return res.status(200).json({
            status: true,
            message: result.ok ? "Payment status updated." : "Payment status recorded.",
            data: {
                assignmentId: assignment._id,
                paymentGatewayTransactionStatus: assignment.paymentGatewayTransactionStatus,
                status: assignment.status,
                alreadyProcessed: Boolean(result.alreadyProcessed),
                reason: result.reason || null,
            },
        });
    } catch (error) {
        if (session.inTransaction()) await session.abortTransaction();
        console.error("Razorpay webhook error:", error);
        return res.status(500).json({ status: false, message: "Webhook processing failed.", data: [] });
    } finally {
        await session.endSession();
    }
};
