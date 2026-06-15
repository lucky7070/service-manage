import type { NotificationResponse } from "expo-notifications";
import { navigateToBookingChat, navigateToBookingDetail } from "../navigation/rootNavigation";

export type PushNotificationData = {
    type?: string;
    relatedId?: string;
    bookingId?: string;
    userType?: string;
};

const asRecord = (value: unknown): Record<string, string> => {
    if (!value || typeof value !== "object") return {};
    return Object.fromEntries(
        Object.entries(value as Record<string, unknown>).map(([key, val]) => [key, val == null ? "" : String(val)])
    );
};

export const parsePushNotificationData = (response: NotificationResponse | null | undefined): PushNotificationData => {
    const raw = response?.notification?.request?.content?.data;
    return asRecord(raw);
};

/** Resolve booking id from FCM data payload (type=booking|chat, relatedId or bookingId). */
export const getBookingIdFromPushData = (data: PushNotificationData): string | null => {
    const type = String(data.type || "").trim();
    if (!["booking", "chat"].includes(type)) return null;
    const id = String(data.relatedId || data.bookingId || "").trim();
    return id || null;
};

export const handleNotificationResponse = (response: NotificationResponse | null | undefined) => {
    const data = parsePushNotificationData(response);
    const bookingId = getBookingIdFromPushData(data);
    if (!bookingId) return;

    if (String(data.type || "").trim() === "chat") {
        navigateToBookingChat(bookingId);
        return;
    }

    navigateToBookingDetail(bookingId);
};

export const openInAppNotification = (row: { type?: string; relatedId?: string | null }) => {
    const bookingId = getBookingIdFromPushData({
        type: row.type,
        relatedId: row.relatedId ? String(row.relatedId) : "",
    });
    if (bookingId) {
        navigateToBookingDetail(bookingId);
    }
};
