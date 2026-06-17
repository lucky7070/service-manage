import crypto from "crypto";
import Razorpay from "razorpay";
import { getSettings } from "./database.js";

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

export const rupeesToPaise = (amount) => Math.round(Number(amount) * 100);
