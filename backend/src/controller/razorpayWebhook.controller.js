import mongoose from "mongoose";
import { getRazorpayWebhookSecret, verifyRazorpayWebhookSignature } from "../helpers/razorpay.js";
import { syncAssignedSubscriptionFromRazorpayPayment, processSubscriptionCharged, processSubscriptionMandateUpdate, resolveAssignmentForPaymentWebhook } from "../helpers/subscriptionPayment.js";
import logger from "../helpers/logger.js";

const PAYMENT_EVENTS = new Set(["payment.captured", "payment.failed"]);
const SUBSCRIPTION_EVENTS = new Set(["subscription.authenticated", "subscription.activated", "subscription.charged", "subscription.cancelled", "subscription.halted", "subscription.pending"]);

const handlePaymentWebhook = async ({ body, session }) => {
    const payment = body?.payload?.payment?.entity;
    if (!payment) {
        return { status: 200, message: "No payment entity in webhook.", data: [] };
    }

    const { assignment, autopay, alreadyProcessed } = await resolveAssignmentForPaymentWebhook({ payment, session });
    if (!assignment) {
        return { status: 200, message: "No matching subscription assignment.", data: { orderId: payment.order_id || null } };
    }

    if (alreadyProcessed) {
        return {
            status: 200,
            message: "Payment already processed.",
            data: { assignmentId: assignment._id, alreadyProcessed: true },
        };
    }

    const result = await syncAssignedSubscriptionFromRazorpayPayment({ assignment, payment, session, autopay });

    return {
        status: 200,
        message: result.ok ? "Payment status updated." : "Payment status recorded.",
        data: {
            assignmentId: assignment._id,
            autopaySubscriptionId: autopay?._id || null,
            paymentGatewayTransactionStatus: assignment.paymentGatewayTransactionStatus,
            status: assignment.status,
            alreadyProcessed: Boolean(result.alreadyProcessed),
            reason: result.reason || null,
        },
    };
};

const handleSubscriptionWebhook = async ({ body, session }) => {
    const eventType = String(body?.event || "").trim();
    const subscription = body?.payload?.subscription?.entity;
    const payment = body?.payload?.payment?.entity;
    const razorpaySubscriptionId = String(subscription?.id || "").trim();

    if (!razorpaySubscriptionId) {
        return { status: 200, message: "No subscription entity in webhook.", data: [] };
    }

    if (eventType === "subscription.charged") {
        const result = await processSubscriptionCharged({ razorpaySubscriptionId, payment, subscription, session });
        return {
            status: 200,
            message: result.ok ? "Subscription charge processed." : "Subscription charge recorded.",
            data: {
                assignmentId: result.assignment?._id || null,
                autopaySubscriptionId: result.autopay?._id || null,
                isRenewal: Boolean(result.isRenewal),
                paymentGatewayTransactionStatus: result.assignment?.paymentGatewayTransactionStatus || null,
                status: result.assignment?.status || null,
                alreadyProcessed: Boolean(result.alreadyProcessed),
                reason: result.reason || null,
            },
        };
    }

    if (["subscription.cancelled", "subscription.halted", "subscription.pending"].includes(eventType)) {
        const status = eventType.split(".")[1];
        const result = await processSubscriptionMandateUpdate({ razorpaySubscriptionId, status, subscription, session });
        return {
            status: 200,
            message: result.ok ? "Subscription mandate status updated." : "Subscription event ignored.",
            data: {
                razorpaySubscriptionId,
                autopaySubscriptionId: result.autopay?._id || null,
                mandateStatus: result.mandateStatus || null,
                reason: result.reason || null,
            },
        };
    }

    if (["subscription.authenticated", "subscription.activated"].includes(eventType)) {
        const result = await processSubscriptionMandateUpdate({
            razorpaySubscriptionId,
            status: subscription?.status || eventType.split(".")[1],
            subscription,
            session,
        });
        return {
            status: 200,
            message: result.ok ? "Subscription mandate activated." : "Subscription event ignored.",
            data: {
                razorpaySubscriptionId,
                autopaySubscriptionId: result.autopay?._id || null,
                mandateStatus: result.mandateStatus || null,
                reason: result.reason || null,
            },
        };
    }

    return { status: 200, message: "Subscription event ignored.", data: { event: eventType } };
};

export const razorpayWebhook = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const signature = String(req.headers["x-razorpay-signature"] || "").trim();
        const rawBody = req.body;

        if (!signature || !Buffer.isBuffer(rawBody)) {
            return res.status(400).json({ status: false, message: "Invalid webhook payload.", data: [] });
        }

        const secret = await getRazorpayWebhookSecret();
        if (!secret) {
            return res.status(503).json({ status: false, message: "Razorpay webhook is not configured.", data: [] });
        }

        if (!verifyRazorpayWebhookSignature({ body: rawBody, signature, secret })) {
            return res.status(400).json({ status: false, message: "Invalid webhook signature.", data: [] });
        }

        let body;
        try {
            body = JSON.parse(rawBody.toString("utf8"));
        } catch {
            return res.status(400).json({ status: false, message: "Invalid webhook payload.", data: [] });
        }

        const eventType = String(body?.event || "").trim();
        logger.webhook("Razorpay webhook verified:", {
            event: eventType,
            paymentId: body?.payload?.payment?.entity?.id || null,
            subscriptionId: body?.payload?.subscription?.entity?.id || null,
        });

        if (!PAYMENT_EVENTS.has(eventType) && !SUBSCRIPTION_EVENTS.has(eventType)) {
            return res.status(200).json({ status: true, message: "Event ignored.", data: { event: eventType } });
        }

        await session.startTransaction();
        const response = PAYMENT_EVENTS.has(eventType)
            ? await handlePaymentWebhook({ body, session })
            : await handleSubscriptionWebhook({ body, session });
        await session.commitTransaction();

        logger.webhook("Razorpay webhook processed:", { event: eventType, response });
        return res.status(response.status).json({ status: true, message: response.message, data: response.data });
    } catch (error) {
        if (session.inTransaction()) await session.abortTransaction();
        logger.error("Razorpay webhook error:", error);
        return res.status(500).json({ status: false, message: "Webhook processing failed.", data: [] });
    } finally {
        await session.endSession();
    }
};
