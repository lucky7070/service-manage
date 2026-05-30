import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { fetchGeneralSettings } from "../api";
import type { GeneralSettings } from "../api/types";
import { DEFAULT_APP_SETTINGS, mergeAppSettings } from "./settingsDefaults";

type SettingsContextValue = {
    settings: GeneralSettings;
    bootstrapping: boolean;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<GeneralSettings>(DEFAULT_APP_SETTINGS);
    const [bootstrapping, setBootstrapping] = useState(true);

    useEffect(() => {
        void (async () => {
            const response = await fetchGeneralSettings();
            if (response.status && response.data) {
                setSettings(mergeAppSettings(response.data));
                setBootstrapping(false);
            } else {
                setBootstrapping(false);
            }
        })();
    }, []);

    const value = useMemo(() => ({ settings, bootstrapping }), [settings, bootstrapping]);
    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
    const ctx = useContext(SettingsContext);
    if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
    return ctx;
}
