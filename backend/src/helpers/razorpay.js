import crypto from "crypto";
import Razorpay from "razorpay";
import { getSettings } from "./database.js";
import logger from "./logger.js";
import { config } from "../config/index.js";

export const getRazorpayClient = async () => {
    const settings = await getSettings(["razorpay_key", "razorpay_secret"]);
    const key_id = String(settings.razorpay_key || "").trim();
    const key_secret = String(settings.razorpay_secret || "").trim();

    if (!key_id || !key_secret) {
        const error = new Error("Razorpay is not configured. Contact support.");
        error.status = 503;
        throw error;
    }

    return { client: new Razorpay({ key_id, key_secret }), key_id, key_secret };
};

export const verifyRazorpayPaymentSignature = ({ orderId, paymentId, signature, secret }) => {
    const body = `${orderId}|${paymentId}`;
    const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
    return expected === signature;
};

export const verifyRazorpaySubscriptionPaymentSignature = ({ subscriptionId, paymentId, signature, secret }) => {
    const body = `${paymentId}|${subscriptionId}`;
    const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
    return expected === signature;
};

export const verifyRazorpayWebhookSignature = ({ body, signature, secret }) => {
    if (!body || !signature || !secret) return false;
    const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
    return expected === signature;
};

export const getRazorpayWebhookSecret = async () => {
    const settings = await getSettings(["razorpay_webhook_secret"]);
    return String(settings.razorpay_webhook_secret || "").trim();
};

export const rupeesToPaise = (amount) => Math.round(Number(amount) * 100);

export const getRazorpayOrderStatus = async (orderId) => {
    try {
        const { client } = await getRazorpayClient();
        const { items, count } = await client.orders.fetchPayments(orderId);
        if (!items.length) return null;
        if (count === 1) return items[0];

        const PAYMENT_STATUS_PRIORITY = { captured: 5, authorized: 4, failed: 3, created: 2, };
        return [...items].sort((left, right) => {
            const byStatus = (PAYMENT_STATUS_PRIORITY[right.status] || 0) - (PAYMENT_STATUS_PRIORITY[left.status] || 0);
            if (byStatus !== 0) return byStatus;
            return Number(right.created_at || 0) - Number(left.created_at || 0);
        })[0];
    } catch (error) {
        logger.error('Error getting Razorpay : ', error);
        return null;
    }
};

export const getRazorpayGatewaySnapshot = async (orderId) => {
    const { client } = await getRazorpayClient();

    // Get the order    
    const order = await client.orders.fetch(orderId);

    // Get all payments for the order and sort them by created_at in descending order
    const payments = await client.orders.fetchPayments(orderId);
    const sortedPayments = payments?.items?.sort((a, b) => b.created_at - a.created_at) || [];

    return { order, latestPayment: sortedPayments[0] || null, payments: sortedPayments };
};

export const paiseToRupees = (amount) => Number(amount || 0) / 100;

export const createRazorpayPlan = async (data) => {
    try {
        const { client } = await getRazorpayClient();

        if (data.period === "day") data.period = "daily";
        if (data.period === "month") data.period = "monthly";
        if (data.period === "year") data.period = "yearly";
        return await client.plans.create(data);
    } catch ({ error }) {
        throw new Error(`Razorpay Plan Error : ${error.description}`);
    }
};

export const planAmountWithTaxPaise = (price) => {
    const taxPct = config.taxPercentage || 0;
    const amountWithTax = Number(price) + (Number(price) * taxPct / 100);
    return rupeesToPaise(amountWithTax);
};

export const ensureRazorpayPlanId = async ({ name, description, price, interval, intervalCount, features }) => {
    const razorpayPlan = await createRazorpayPlan({
        period: interval,
        interval: intervalCount,
        item: {
            name,
            amount: planAmountWithTaxPaise(price),
            currency: "INR",
            description,
        },
        notes: features.reduce((acc, feature) => ({ ...acc, [feature.name]: feature.description }), {}),
    });

    return razorpayPlan.id;
};

export const createRazorpaySubscription = async (data) => {
    try {
        const { client } = await getRazorpayClient();
        return await client.subscriptions.create({ total_count: 100, quantity: 1, customer_notify: 1, ...data });
    } catch ({ error }) {
        throw new Error(`Razorpay Subscription Error : ${error?.description || "Unknown error"}`);
    }
};

export const getRazorpaySubscriptionStatus = async (subscriptionId) => {
    try {
        const { client } = await getRazorpayClient();
        return await client.subscriptions.fetch(subscriptionId);
    } catch (error) {
        logger.error("Error fetching Razorpay subscription:", error);
        return null;
    }
};

export const getRazorpaySubscriptionLatestPayment = async (subscriptionId) => {
    try {
        const { client } = await getRazorpayClient();
        const { items = [] } = await client.payments.all({ subscription_id: subscriptionId, count: 10 });
        if (!items.length) return null;

        const PAYMENT_STATUS_PRIORITY = { captured: 5, authorized: 4, failed: 3, created: 2 };
        return [...items].sort((left, right) => {
            const byStatus = (PAYMENT_STATUS_PRIORITY[right.status] || 0) - (PAYMENT_STATUS_PRIORITY[left.status] || 0);
            if (byStatus !== 0) return byStatus;
            return Number(right.created_at || 0) - Number(left.created_at || 0);
        })[0];
    } catch (error) {
        logger.error("Error fetching Razorpay subscription payment:", error);
        return null;
    }
};
