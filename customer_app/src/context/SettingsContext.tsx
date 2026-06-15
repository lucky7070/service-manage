import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { fetchGeneralSettings } from "../api";
import type { GeneralSettings } from "../api/types";

type SettingsContextValue = {
    settings: GeneralSettings;
    bootstrapping: boolean;
    refreshSettings: () => Promise<boolean>;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

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

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<GeneralSettings>(DEFAULT_APP_SETTINGS);
    const [bootstrapping, setBootstrapping] = useState(true);

    const refreshSettings = useCallback(async () => {
        const response = await fetchGeneralSettings();
        if (response.status && response.data) {
            setSettings({ ...DEFAULT_APP_SETTINGS, ...(response.data || {}) });
            return true;
        }
        return false;
    }, []);

    useEffect(() => {
        void (async () => {
            await refreshSettings();
            setBootstrapping(false);
        })();
    }, [refreshSettings]);

    const value = useMemo(() => ({ settings, bootstrapping, refreshSettings }), [settings, bootstrapping, refreshSettings]);
    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
    const ctx = useContext(SettingsContext);
    if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
    return ctx;
}
