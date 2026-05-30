import type { GeneralSettings } from "../api/types";

export const DEFAULT_APP_SETTINGS: GeneralSettings = {
    favicon: "",
    logo: "",
    application_name: "",
    copyright: "",
    address: "",
    email: "",
    phone: "",
    brand_tagline: "",
    facebook: "",
    twitter: "",
    linkdin: "",
    instagram: "",
    force_update_android: "",
    force_update_ios: "",
    app_version_android: "",
    app_version_ios: "",
    app_url_android: "",
    app_url_ios: "",
    force_update_message_android: "",
    force_update_message_ios: "",
    maintenance: "",
    maintenance_toggle: "",
    information_banner: "",
    information_banner_toggle: "",
    baseUrl: "",
    uploadUrl: "",
};

export const mergeAppSettings = (partial?: Partial<GeneralSettings> | null): GeneralSettings => ({ ...DEFAULT_APP_SETTINGS, ...(partial || {}) });