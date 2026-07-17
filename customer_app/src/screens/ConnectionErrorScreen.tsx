import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { colors, radius, shadows, spacing, typography } from "../theme/colors";

type ConnectionErrorScreenProps = {
    onRetry?: () => void;
    retrying?: boolean;
};

const tips = [
    { icon: "wifi" as const, text: "Make sure Wi-Fi or mobile data is on" },
    { icon: "refresh-cw" as const, text: "Toggle airplane mode off and on" },
    { icon: "smartphone" as const, text: "Restart the app if the issue persists" },
];

export default function ConnectionErrorScreen({ onRetry, retrying }: ConnectionErrorScreenProps) {
    return (
        <SafeAreaView style={styles.safe}>
            {/* Gradient hero band */}
            <LinearGradient
                colors={["#FF8C3A", colors.primary, colors.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.hero}
            >
                {/* Decorative blobs */}
                <View style={styles.decorA} />
                <View style={styles.decorB} />
                <View style={styles.decorC} />

                {/* Icon badge */}
                <View style={styles.iconBadge}>
                    <Feather name="wifi-off" size={36} color={colors.primary} />
                </View>

                <Text style={styles.heroTitle}>No connection</Text>
                <Text style={styles.heroSub}>
                    We couldn't reach the server.{"\n"}Please check your internet connection.
                </Text>
            </LinearGradient>

            {/* Content card */}
            <View style={styles.body}>
                <Card elevated style={styles.card}>
                    <Text style={styles.cardTitle}>Quick fixes</Text>

                    <View style={styles.tipList}>
                        {tips.map((tip) => (
                            <View key={tip.text} style={styles.tipRow}>
                                <View style={styles.tipIcon}>
                                    <Feather name={tip.icon} size={15} color={colors.primary} />
                                </View>
                                <Text style={styles.tipText}>{tip.text}</Text>
                            </View>
                        ))}
                    </View>

                    {onRetry ? (
                        <Button
                            label={retrying ? "Connecting…" : "Try again"}
                            onPress={onRetry}
                            fullWidth
                            loading={retrying}
                            style={styles.retryBtn}
                        />
                    ) : null}
                </Card>

                <Text style={styles.footer}>
                    If the problem continues, contact support.
                </Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: colors.muted,
    },
    hero: {
        paddingTop: spacing.x2 + spacing.xl,
        paddingBottom: spacing.x2 + spacing.lg,
        paddingHorizontal: spacing.xl,
        alignItems: "center",
        gap: spacing.md,
        overflow: "hidden",
    },
    decorA: {
        position: "absolute",
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: "rgba(255,255,255,0.08)",
        top: -50,
        right: -30,
    },
    decorB: {
        position: "absolute",
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "rgba(255,255,255,0.06)",
        bottom: 10,
        right: 60,
    },
    decorC: {
        position: "absolute",
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "rgba(255,255,255,0.05)",
        top: 32,
        left: 20,
    },
    iconBadge: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.white,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: spacing.sm,
        ...shadows.card,
    },
    heroTitle: {
        ...typography.hero,
        color: colors.white,
        textAlign: "center",
    },
    heroSub: {
        fontSize: 14,
        lineHeight: 21,
        color: "rgba(255,255,255,0.88)",
        textAlign: "center",
    },

    body: {
        flex: 1,
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.xl,
        gap: spacing.lg,
    },
    card: {
        gap: spacing.md,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: colors.foreground,
    },
    tipList: {
        gap: spacing.sm,
    },
    tipRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
    },
    tipIcon: {
        width: 34,
        height: 34,
        borderRadius: radius.md,
        backgroundColor: "rgba(240,116,26,0.1)",
        alignItems: "center",
        justifyContent: "center",
    },
    tipText: {
        flex: 1,
        fontSize: 13,
        color: colors.foreground,
        lineHeight: 19,
    },
    retryBtn: {
        marginTop: spacing.sm,
    },
    footer: {
        fontSize: 12,
        color: colors.mutedForeground,
        textAlign: "center",
    },
});
