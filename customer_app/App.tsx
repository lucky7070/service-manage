import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { SettingsProvider, useSettings } from "./src/context/SettingsContext";
import AppNavigator from "./src/navigation/AppNavigator";
import { colors } from "./src/theme/colors";

function AppBootstrap() {
    const { bootstrapping: settingsBoot, settings } = useSettings();
    const { bootstrapping: authBoot } = useAuth();

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

    return (
        <>
            <AppNavigator />
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
