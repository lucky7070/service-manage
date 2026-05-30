import admin from "firebase-admin";
import { readFileSync } from "node:fs";
import logger from "../helpers/logger.js";

let messaging = null;

export const initFirebase = () => {
    if (messaging) return messaging;

    try {
        const jsonRaw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
        const jsonPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

        if (jsonRaw) {
            const serviceAccount = JSON.parse(jsonRaw);
            admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
            messaging = admin.messaging();
            return messaging;
        } else if (jsonPath) {
            const serviceAccount = JSON.parse(readFileSync(jsonPath, "utf8"));
            admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
            messaging = admin.messaging();
            return messaging;
        } else {
            return null;
        }
    } catch (error) {
        logger.error(`Firebase init failed: ${error?.message || error}`);
        return null;
    }
};

export const isFirebaseEnabled = () => Boolean(initFirebase());

export const sendPushNotification = async ({ tokens, title, body, data = {} }) => {
    const msg = initFirebase();
    const uniqueTokens = [...new Set((tokens || []).map((t) => String(t).trim()).filter(Boolean))];
    if (!msg || uniqueTokens.length === 0) {
        return { sent: 0, failed: 0, skipped: true };
    }

    const stringData = Object.fromEntries(
        Object.entries(data || {}).map(([key, value]) => [key, value == null ? "" : String(value)])
    );

    const response = await msg.sendEachForMulticast({
        tokens: uniqueTokens,
        notification: { title: String(title || ""), body: String(body || "") },
        data: stringData,
        android: { priority: "high" },
        apns: { payload: { aps: { sound: "default" } } }
    });

    const invalidTokens = [];
    const errors = [];
    const discardTokenCodes = new Set([
        "messaging/registration-token-not-registered",
        "messaging/invalid-registration-token",
        "messaging/mismatched-credential",
        "messaging/invalid-argument"
    ]);

    response.responses.forEach((item, index) => {
        if (!item.success) {
            const code = item.error?.code || "unknown";
            const message = item.error?.message || "Unknown error";
            errors.push({ code, message });
            if (discardTokenCodes.has(code)) {
                invalidTokens.push(uniqueTokens[index]);
            } else {
                logger.warn(`FCM delivery failed [${code}]: ${message}`);
            }
        }
    });

    return {
        sent: response.successCount,
        failed: response.failureCount,
        invalidTokens,
        errors,
        skipped: false
    };
};
