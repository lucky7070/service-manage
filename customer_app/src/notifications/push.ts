import { Platform } from "react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";
import * as Application from "expo-application";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import * as SecureStore from "expo-secure-store";
import { getApp, getApps } from "@react-native-firebase/app";
import { getAPNSToken, getMessaging, getToken, registerDeviceForRemoteMessages, } from "@react-native-firebase/messaging";

const DEVICE_ID_FALLBACK_KEY = "push_device_id_fallback";
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export type PushCredentials = {
    fcmToken: string;
    deviceId: string;
};

/** Remote FCM does not work in Expo Go (SDK 53+). Use a native build with Firebase client configs. */
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

async function waitForFirebaseApp(attempts = 10): Promise<boolean> {
    for (let i = 0; i < attempts; i++) {
        if (getApps().length) return true;
        await sleep(300);
    }
    return getApps().length > 0;
}

/**
 * Native FCM registration token (Android + iOS).
 * Required on iOS: Expo getDevicePushTokenAsync returns an APNs token, which firebase-admin cannot deliver to.
 */
async function getNativeFcmToken(): Promise<string | null> {
    const ready = await waitForFirebaseApp();
    if (!ready) return null;

    const messaging = getMessaging(getApp());

    if (Platform.OS === "ios") {
        await registerDeviceForRemoteMessages(messaging);
        let apns: string | null = null;
        for (let i = 0; i < 15; i++) {
            apns = await getAPNSToken(messaging);
            if (apns) break;
            await sleep(400);
        }
        if (!apns) return null;
    }

    for (let i = 0; i < 5; i++) {
        const token = String((await getToken(messaging)) || "").trim();
        if (token) return token;
        await sleep(400);
    }

    return null;
}

/** FCM token + device id for login/register / push-token sync. */
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

        const fcmToken = await getNativeFcmToken();
        if (!fcmToken) return null;

        return {
            fcmToken,
            deviceId: await getStableDeviceId(),
        };
    } catch {
        return null;
    }
}
