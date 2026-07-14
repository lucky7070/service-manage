import mongoose from "mongoose";
import { getRazorpayWebhookSecret, verifyRazorpayWebhookSignature } from "../helpers/razorpay.js";
import { syncAssignedSubscriptionFromRazorpayPayment, processSubscriptionCharged, processSubscriptionMandateUpdate, resolveAssignmentForPaymentWebhook } from "../helpers/subscriptionPayment.js";
import logger from "../helpers/logger.js";

const PAYMENT_EVENTS = new Set(["payment.captured", "payment.failed"]);
const SUBSCRIPTION_EVENTS = new Set(["subscription.authenticated", "subscription.activated", "subscription.paused", "subscription.resumed", "subscription.charged", "subscription.cancelled", "subscription.halted", "subscription.pending"]);

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

    if (["subscription.cancelled", "subscription.paused", "subscription.resumed", "subscription.halted", "subscription.pending"].includes(eventType)) {
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

const logResponse = (res, response, statusCode = 200) => {
    logger.webhook("Razorpay webhook processed:", { statusCode, response });
    return res.status(statusCode).json(response);
};

export const razorpayWebhook = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const signature = String(req.headers["x-razorpay-signature"] || "").trim();
        const rawBody = req.body;

        if (!signature || !Buffer.isBuffer(rawBody)) {
            return res.status(400).json({ status: false, message: "Invalid webhook payload.", data: [] });
        }

        let body;
        try {
            body = JSON.parse(rawBody.toString("utf8"));
        } catch {
            return logResponse(res, { status: false, message: "Invalid webhook payload.", data: rawBody.toString("utf8") }, 400);
        }

        logger.webhook("Razorpay webhook verified:", { body, signature });
        const secret = await getRazorpayWebhookSecret();
        if (!secret) {
            return logResponse(res, { status: false, message: "Razorpay webhook is not configured.", data: [] }, 503);
        }

        if (!verifyRazorpayWebhookSignature({ body: rawBody, signature, secret })) {
            return logResponse(res, { status: false, message: "Invalid webhook signature.", data: [] }, 400);
        }

        const eventType = String(body?.event || "").trim();
        if (!PAYMENT_EVENTS.has(eventType) && !SUBSCRIPTION_EVENTS.has(eventType)) {
            return logResponse(res, { status: true, message: "Event ignored.", data: { event: eventType } }, 200);
        }

        await session.startTransaction();
        const response = PAYMENT_EVENTS.has(eventType)
            ? await handlePaymentWebhook({ body, session })
            : await handleSubscriptionWebhook({ body, session });
        await session.commitTransaction();

        return logResponse(res, { status: true, statusCode: response.status, message: response.message, data: response.data }, 200);
    } catch (error) {
        if (session.inTransaction()) await session.abortTransaction();
        logger.error("Razorpay webhook error:", error);
        return res.status(500).json({ status: false, message: "Webhook processing failed.", data: [] });
    } finally {
        await session.endSession();
    }
};
