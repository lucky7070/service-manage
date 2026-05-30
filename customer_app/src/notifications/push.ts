import { Platform } from "react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";
import * as Application from "expo-application";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import * as SecureStore from "expo-secure-store";

const DEVICE_ID_FALLBACK_KEY = "push_device_id_fallback";

export type PushCredentials = {
    fcmToken: string;
    deviceId: string;
};

/** Remote FCM does not work in Expo Go (SDK 53+). Use a dev build with google-services.json. */
export const isExpoGo = (): boolean =>
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient && Constants.expoGoConfig != null;

export const isPushAvailableInThisBuild = (): boolean => !isExpoGo();

if (isPushAvailableInThisBuild()) {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
            shouldShowBanner: true,
            shouldShowList: true,
        }),
    });
}

async function getPlatformDeviceId(): Promise<string | null> {
    if (Platform.OS === "android") {
        const id = Application.getAndroidId();
        const trimmed = id ? String(id).trim() : "";
        return trimmed || null;
    }

    if (Platform.OS === "ios") {
        const id = await Application.getIosIdForVendorAsync();
        const trimmed = id ? String(id).trim() : "";
        return trimmed || null;
    }

    return null;
}

export async function getStableDeviceId(): Promise<string> {
    const platformId = await getPlatformDeviceId();
    if (platformId) return platformId;

    const existing = await SecureStore.getItemAsync(DEVICE_ID_FALLBACK_KEY);
    if (existing) return existing;

    const generated = `${Platform.OS}-fallback-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
    await SecureStore.setItemAsync(DEVICE_ID_FALLBACK_KEY, generated);
    return generated;
}

/** FCM token + device id for login/register payload only. */
export async function getPushCredentials(): Promise<PushCredentials | null> {
    if (!Device.isDevice) return null;
    if (!isPushAvailableInThisBuild()) return null;

    try {
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
    } catch {
        return null;
    }
}
