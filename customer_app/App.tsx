import { useMemo, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { SettingsProvider, useSettings } from "./src/context/SettingsContext";
import { getAppUpdateStatus, getMaintenanceStatus } from "./src/helpers/appVersion";
import InformationBannerOverlay from "./src/components/InformationBannerOverlay";
import AppNavigator from "./src/navigation/AppNavigator";
import ForceUpdateScreen from "./src/screens/ForceUpdateScreen";
import MaintenanceScreen from "./src/screens/MaintenanceScreen";
import ConnectionErrorScreen from "./src/screens/ConnectionErrorScreen";
import { colors } from "./src/theme/colors";

function AppBootstrap() {
    const { bootstrapping: settingsBoot, settings, refreshSettings } = useSettings();
    const { bootstrapping: authBoot } = useAuth();
    const [retryingSettings, setRetryingSettings] = useState(false);

    const maintenanceStatus = useMemo(() => getMaintenanceStatus(settings), [settings]);
    const updateStatus = useMemo(() => getAppUpdateStatus(settings), [settings]);

    const onRetrySettings = () => {
        setRetryingSettings(true);
        void refreshSettings().finally(() => setRetryingSettings(false));
    };

    if (!settingsBoot && !settings.application_name) {
        return (
            <>
                <ConnectionErrorScreen onRetry={onRetrySettings} retrying={retryingSettings} />
                <StatusBar style="dark" />
            </>
        );
    }

    if (settingsBoot || authBoot) {
        return (
            <View style={styles.splash}>
                <ActivityIndicator size="large" color={colors.primary} />
                {settings.application_name ? (
                    <Text style={styles.splashTitle}>{settings.application_name}</Text>
                ) : null}
            </View>
        );
    }

    if (maintenanceStatus.blocking) {
        return (
            <>
                <MaintenanceScreen
                    message={maintenanceStatus.message}
                    applicationName={settings.application_name}
                    onRetry={onRetrySettings}
                    retrying={retryingSettings}
                />
                <StatusBar style="dark" />
            </>
        );
    }

    if (updateStatus.blocking) {
        return (
            <>
                <ForceUpdateScreen
                    message={updateStatus.message}
                    storeUrl={updateStatus.storeUrl}
                    applicationName={settings.application_name}
                    currentVersion={updateStatus.currentVersion}
                    requiredVersion={updateStatus.requiredVersion}
                />
                <StatusBar style="dark" />
            </>
        );
    }

    return (
        <>
            <InformationBannerOverlay>
                <AppNavigator />
            </InformationBannerOverlay>
            <StatusBar style="dark" />
        </>
    );
}

export default function App() {
    return (
        <SafeAreaProvider>
            <SettingsProvider>
                <AuthProvider>
                    <AppBootstrap />
                </AuthProvider>
            </SettingsProvider>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    splash: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.muted,
        gap: 16,
        paddingHorizontal: 24,
    },
    splashTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: colors.foreground,
        textAlign: "center",
    },
});
