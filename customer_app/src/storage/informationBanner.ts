import * as SecureStore from "expo-secure-store";

const DISMISS_KEY = "customer_information_banner_dismiss";
const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

type DismissRecord = {
    dismissedAt: number;
    bannerPath: string;
};

async function readDismiss(): Promise<DismissRecord | null> {
    try {
        const raw = await SecureStore.getItemAsync(DISMISS_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as DismissRecord;
        if (!parsed?.dismissedAt || !parsed.bannerPath) return null;
        return parsed;
    } catch {
        return null;
    }
}

export async function shouldShowInformationBanner(bannerPath: string): Promise<boolean> {
    const path = bannerPath.trim();
    if (!path) return false;

    const record = await readDismiss();
    if (!record) return true;
    if (record.bannerPath !== path) return true;

    return Date.now() - record.dismissedAt >= TWO_HOURS_MS;
}

export async function dismissInformationBanner(bannerPath: string) {
    const payload: DismissRecord = {
        dismissedAt: Date.now(),
        bannerPath: bannerPath.trim(),
    };
    await SecureStore.setItemAsync(DISMISS_KEY, JSON.stringify(payload));
}
