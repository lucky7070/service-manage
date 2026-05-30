import { Linking, Platform, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Button from "../components/ui/Button";
import { colors, radius, spacing } from "../theme/colors";

type ForceUpdateScreenProps = {
    message: string;
    storeUrl: string;
    applicationName?: string;
    currentVersion: string;
    requiredVersion: string;
};

export default function ForceUpdateScreen({
    message,
    storeUrl,
    applicationName,
    currentVersion,
    requiredVersion,
}: ForceUpdateScreenProps) {
    const openStore = () => {
        if (!storeUrl) return;
        void Linking.openURL(storeUrl);
    };

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                <View style={styles.iconWrap}>
                    <Feather name="download-cloud" size={40} color={colors.primary} />
                </View>

                <Text style={styles.title}>Update required</Text>
                {applicationName ? <Text style={styles.appName}>{applicationName}</Text> : null}

                <Text style={styles.message}>{message}</Text>

                <Text style={styles.versionLine}>
                    Your version: {currentVersion} · Required: {requiredVersion}
                </Text>

                <Button
                    label={Platform.OS === "ios" ? "Open App Store" : "Open Play Store"}
                    onPress={openStore}
                    fullWidth
                    disabled={!storeUrl}
                />

                {!storeUrl ? (
                    <Text style={styles.hint}>Store link is not configured. Contact support.</Text>
                ) : null}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: colors.muted,
    },
    container: {
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: spacing.xl,
        gap: spacing.md,
    },
    iconWrap: {
        alignSelf: "center",
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: "rgba(240,116,26,0.12)",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: spacing.sm,
    },
    title: {
        fontSize: 24,
        fontWeight: "800",
        color: colors.foreground,
        textAlign: "center",
    },
    appName: {
        fontSize: 15,
        fontWeight: "600",
        color: colors.mutedForeground,
        textAlign: "center",
        marginTop: -spacing.sm,
    },
    message: {
        fontSize: 15,
        lineHeight: 22,
        color: colors.foreground,
        textAlign: "center",
    },
    versionLine: {
        fontSize: 12,
        color: colors.mutedForeground,
        textAlign: "center",
        marginBottom: spacing.sm,
    },
    hint: {
        fontSize: 12,
        color: colors.destructive,
        textAlign: "center",
    },
});
