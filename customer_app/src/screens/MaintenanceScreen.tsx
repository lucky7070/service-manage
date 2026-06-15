import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Button from "../components/ui/Button";
import { colors, spacing } from "../theme/colors";

type MaintenanceScreenProps = {
    message: string;
    applicationName?: string;
    onRetry?: () => void;
    retrying?: boolean;
};

export default function MaintenanceScreen({
    message,
    applicationName,
    onRetry,
    retrying,
}: MaintenanceScreenProps) {
    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                <View style={styles.iconWrap}>
                    <Feather name="tool" size={40} color={colors.primary} />
                </View>

                <Text style={styles.title}>Under maintenance</Text>
                {applicationName ? <Text style={styles.appName}>{applicationName}</Text> : null}

                <Text style={styles.message}>{message}</Text>

                {onRetry ? (
                    <Button
                        label={retrying ? "Checking…" : "Try again"}
                        onPress={onRetry}
                        fullWidth
                        loading={retrying}
                        variant="outline"
                    />
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
});
