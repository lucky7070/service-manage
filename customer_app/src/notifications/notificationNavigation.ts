import type { NotificationResponse } from "expo-notifications";
import { navigateToBookingDetail } from "../navigation/rootNavigation";

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

/** Resolve booking id from FCM data payload (type=booking, relatedId or bookingId). */
export const getBookingIdFromPushData = (data: PushNotificationData): string | null => {
    if (String(data.type || "").trim() !== "booking") return null;
    const id = String(data.relatedId || data.bookingId || "").trim();
    return id || null;
};

export const handleNotificationResponse = (response: NotificationResponse | null | undefined) => {
    const data = parsePushNotificationData(response);
    const bookingId = getBookingIdFromPushData(data);
    if (bookingId) {
        navigateToBookingDetail(bookingId);
    }
};
