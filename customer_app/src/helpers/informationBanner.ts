import env from "../config/env";
import type { GeneralSettings } from "../api/types";

const COOLDOWN_MS = 2 * 60 * 60 * 1000;

export function isInformationBannerEnabled(settings: GeneralSettings): boolean {
    return settings.information_banner_toggle === "1" && Boolean(settings.information_banner?.trim());
}

export function resolveSettingsAssetUrl(path: string, uploadUrl?: string) {
    const trimmed = path?.trim() ?? "";
    if (!trimmed) return "";
    if (/^https?:\/\//i.test(trimmed)) return trimmed;

    const base = (uploadUrl?.trim() || env.uploadUrl).replace(/\/$/, "");
    const normalized = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    return `${base}${normalized}`;
}

export function getInformationBannerImageUri(settings: GeneralSettings) {
    if (!isInformationBannerEnabled(settings)) return "";
    return resolveSettingsAssetUrl(settings.information_banner, settings.uploadUrl);
}
export { COOLDOWN_MS as INFORMATION_BANNER_COOLDOWN_MS };
