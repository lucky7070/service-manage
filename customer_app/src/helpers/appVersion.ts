import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Application from "expo-application";
import type { GeneralSettings } from "../api/types";
import { isExpoGo } from "../notifications/push";

export function getCurrentAppVersion(): string {
    return Application.nativeApplicationVersion ?? Constants.expoConfig?.version ?? "0.0.0";
}

export function compareVersions(a: string, b: string): number {
    const parse = (v: string) => v.trim().split(".").map((part) => {
        const n = parseInt(part.replace(/[^\d]/g, ""), 10);
        return Number.isFinite(n) ? n : 0;
    });

    const pa = parse(a);
    const pb = parse(b);
    const len = Math.max(pa.length, pb.length);

    for (let i = 0; i < len; i += 1) {
        const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
        if (diff !== 0) return diff < 0 ? -1 : 1;
    }

    return 0;
}

export type AppUpdateStatus = {
    blocking: boolean;
    message: string;
    storeUrl: string;
    currentVersion: string;
    requiredVersion: string;
};

function platformUpdateFields(settings: GeneralSettings) {
    if (Platform.OS === "android") {
        return {
            requiredVersion: settings.app_version_android?.trim() ?? "",
            forceUpdate: settings.force_update_android === "1",
            message: settings.force_update_message_android?.trim() ?? "",
            storeUrl: settings.app_url_android?.trim() ?? "",
        };
    }

    if (Platform.OS === "ios") {
        return {
            requiredVersion: settings.app_version_ios?.trim() ?? "",
            forceUpdate: settings.force_update_ios === "1",
            message: settings.force_update_message_ios?.trim() ?? "",
            storeUrl: settings.app_url_ios?.trim() ?? "",
        };
    }
    return null;
}

export function getAppUpdateStatus(settings: GeneralSettings): AppUpdateStatus {
    const currentVersion = getCurrentAppVersion();
    const empty: AppUpdateStatus = { blocking: false, message: "", storeUrl: "", currentVersion, requiredVersion: "", };

    if (Platform.OS !== "android" && Platform.OS !== "ios") return empty;
    if (isExpoGo()) return empty;

    const platform = platformUpdateFields(settings);
    if (!platform?.forceUpdate || !platform.requiredVersion) return empty;

    const isOutdated = compareVersions(currentVersion, platform.requiredVersion) < 0;
    if (!isOutdated) return empty;

    return {
        blocking: true,
        message: platform.message || "A new version of the app is available. Please update from the store to continue.",
        storeUrl: platform.storeUrl,
        currentVersion,
        requiredVersion: platform.requiredVersion,
    };
}
