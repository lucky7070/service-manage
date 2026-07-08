import crypto from "crypto";
import Razorpay from "razorpay";
import { getSettings } from "./database.js";
import logger from "./logger.js";

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

export const verifyRazorpayWebhookSignature = ({ body, signature, secret }) => {
    if (!body || !signature || !secret) return false;
    const payload = typeof body === "string" ? body : JSON.stringify(body);
    const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
    return expected === signature;
};

export const getRazorpayWebhookSecret = async () => {
    const settings = await getSettings(["razorpay_webhook_secret", "razorpay_secret"]);
    return String(settings.razorpay_webhook_secret || settings.razorpay_secret || "").trim();
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
