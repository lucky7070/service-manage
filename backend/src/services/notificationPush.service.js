import { Notification, Customer, ServiceProvider } from "../models/index.js";
import { sendPushNotification } from "../libraries/firebase.js";
import logger from "../helpers/logger.js";

const loadUserFcmToken = async ({ userId, userType }) => {
    const Model = userType === "customer" ? Customer : ServiceProvider;
    const row = await Model.findById(userId, { fcmToken: 1 }).lean();
    const token = row?.fcmToken ? String(row.fcmToken).trim() : "";
    return token ? [token] : [];
};

export const notifyUser = async ({
    userId,
    userType,
    title,
    message,
    type = "system",
    relatedId = null,
    data = {}
}) => {
    await Notification.create({
        userId,
        userType,
        title: String(title).trim(),
        message: String(message).trim(),
        type,
        relatedId: relatedId || null,
        isRead: false,
        readAt: null
    });

    const tokens = await loadUserFcmToken({ userId, userType });
    if (!tokens.length) return { push: { sent: 0, failed: 0, skipped: true } };

    const push = await sendPushNotification({
        tokens,
        title,
        body: message,
        data: {
            type: String(type),
            relatedId: relatedId ? String(relatedId) : "",
            userType: String(userType),
            ...data
        }
    });

    if (push.skipped) {
        logger.warn(`Push skipped for ${userType} ${userId} (Firebase not configured or no valid token).`);
    } else if (push.failed > 0) {
        const detail = (push.errors || []).map((e) => `${e.code}: ${e.message}`).join("; ");
        logger.warn(`Push failed for ${userType} ${userId}: ${detail || "unknown error"}`);
    } else {
        logger.info(`Push sent: ${push.sent}/${tokens.length}`);
    }

    if (push.invalidTokens?.length) {
        const Model = userType === "customer" ? Customer : ServiceProvider;
        await Model.updateMany({ fcmToken: { $in: push.invalidTokens } }, { $set: { fcmToken: null } });
    }

    return { push };
};
