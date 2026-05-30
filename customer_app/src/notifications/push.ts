import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import * as SecureStore from "expo-secure-store";

const DEVICE_ID_KEY = "push_device_id";

export type PushCredentials = {
    fcmToken: string;
    deviceId: string;
};

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export async function getStableDeviceId(): Promise<string> {
    const existing = await SecureStore.getItemAsync(DEVICE_ID_KEY);
    if (existing) return existing;

    const generated = `${Platform.OS}-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
    await SecureStore.setItemAsync(DEVICE_ID_KEY, generated);
    return generated;
}

/** FCM token + stable device id for login/register payload only. */
export async function getPushCredentials(): Promise<PushCredentials | null> {
    if (!Device.isDevice) return null;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }
    if (finalStatus !== "granted") return null;

    const tokenResponse = await Notifications.getDevicePushTokenAsync();
    const fcmToken = String(tokenResponse?.data || "").trim();
    if (!fcmToken) return null;

    return {
        fcmToken,
        deviceId: await getStableDeviceId(),
    };
}
