import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radius, shadows, spacing, typography } from "../../theme/colors";

type LocationCaptureCardProps = {
    latitude: string;
    longitude: string;
    locating: boolean;
    onCapture: () => void;
    error?: string;
};

const STEPS = [
    { icon: "home" as const, text: "Stand at the job site" },
    { icon: "smartphone" as const, text: "Turn on GPS" },
    { icon: "navigation" as const, text: "Tap capture below" },
];

function formatLatitude(value: string) {
    const n = Number(value);
    if (!Number.isFinite(n)) return "—";
    return `${Math.abs(n).toFixed(6)}° ${n >= 0 ? "N" : "S"}`;
}

function formatLongitude(value: string) {
    const n = Number(value);
    if (!Number.isFinite(n)) return "—";
    return `${Math.abs(n).toFixed(6)}° ${n >= 0 ? "E" : "W"}`;
}

function hasValidCoords(latitude: string, longitude: string) {
    const lat = Number(latitude);
    const lng = Number(longitude);
    return Number.isFinite(lat) && Number.isFinite(lng);
}

function MapRadarPanel({ captured, locating }: { captured: boolean; locating: boolean }) {
    return (
        <View style={styles.radarPanel}>
            <LinearGradient
                colors={captured ? ["#059669", "#047857", "#065F46"] : ["#FF8C3A", colors.primary, colors.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />

            <View style={styles.radarDecorA} />
            <View style={styles.radarDecorB} />
            <View style={styles.radarDecorC} />

            <View style={styles.gridH1} />
            <View style={styles.gridH2} />
            <View style={styles.gridV1} />
            <View style={styles.gridV2} />

            <View style={styles.radarRingOuter} />
            <View style={styles.radarRingMid} />
            <View style={styles.radarRingInner} />

            <View style={styles.radarCenter}>
                <View style={styles.radarCenterGlow} />
                <View style={styles.radarCenterCore}>
                    {locating ? (
                        <ActivityIndicator color={captured ? colors.emerald : colors.primary} size="small" />
                    ) : (
                        <Feather
                            name={captured ? "check" : "crosshair"}
                            size={28}
                            color={captured ? colors.emerald : colors.primary}
                        />
                    )}
                </View>
            </View>

            <View style={styles.radarBadge}>
                <Feather name={captured ? "check-circle" : "map-pin"} size={13} color={colors.white} />
                <Text style={styles.radarBadgeText}>{captured ? "GPS locked" : "GPS required"}</Text>
            </View>
        </View>
    );
}

export default function LocationCaptureCard({ latitude, longitude, locating, onCapture, error }: LocationCaptureCardProps) {
    const captured = hasValidCoords(latitude, longitude);

    return (
        <View style={styles.wrap}>
            <Text style={styles.label}>
                Service location <Text style={styles.required}>*</Text>
            </Text>

            <View style={[styles.card, captured && styles.cardCaptured, Boolean(error) && styles.cardError]}>
                <MapRadarPanel captured={captured} locating={locating} />

                {captured ? (
                    <View style={styles.body}>
                        <View style={styles.coordsGlass}>
                            <View style={styles.coordBlock}>
                                <View style={styles.coordIconWrap}>
                                    <Text style={styles.coordIconText}>LAT</Text>
                                </View>
                                <View style={styles.coordCopy}>
                                    <Text style={styles.coordLabel}>Latitude</Text>
                                    <Text style={styles.coordValue}>{formatLatitude(latitude)}</Text>
                                </View>
                            </View>

                            <View style={styles.coordDivider} />

                            <View style={styles.coordBlock}>
                                <View style={styles.coordIconWrap}>
                                    <Text style={styles.coordIconText}>LNG</Text>
                                </View>
                                <View style={styles.coordCopy}>
                                    <Text style={styles.coordLabel}>Longitude</Text>
                                    <Text style={styles.coordValue}>{formatLongitude(longitude)}</Text>
                                </View>
                            </View>
                        </View>

                        <Text style={styles.capturedHint}>
                            Your provider will navigate to this exact spot — no manual pin needed.
                        </Text>

                        <Pressable
                            disabled={locating}
                            onPress={onCapture}
                            style={({ pressed }) => [styles.secondaryBtn, pressed && styles.btnPressed, locating && styles.btnDisabled]}
                        >
                            {locating ? (
                                <ActivityIndicator size="small" color={colors.primary} />
                            ) : (
                                <>
                                    <Feather name="refresh-cw" size={16} color={colors.primary} />
                                    <Text style={styles.secondaryBtnText}>Re-capture location</Text>
                                </>
                            )}
                        </Pressable>
                    </View>
                ) : (
                    <View style={styles.body}>
                        <Text style={styles.title}>Pin where the service happens</Text>
                        <Text style={styles.subtitle}>
                            We only use GPS — coordinates are captured automatically, never typed by hand.
                        </Text>

                        <View style={styles.steps}>
                            {STEPS.map((step, index) => (
                                <View key={step.text} style={styles.stepRow}>
                                    <LinearGradient colors={["#FF8C3A", colors.primary]} style={styles.stepBadge}>
                                        <Text style={styles.stepNumber}>{index + 1}</Text>
                                    </LinearGradient>
                                    <View style={styles.stepIcon}>
                                        <Feather name={step.icon} size={15} color={colors.primary} />
                                    </View>
                                    <Text style={styles.stepText}>{step.text}</Text>
                                </View>
                            ))}
                        </View>

                        <Pressable
                            disabled={locating}
                            onPress={onCapture}
                            style={({ pressed }) => [styles.primaryWrap, locating && styles.btnDisabled, pressed && styles.btnPressed]}
                        >
                            <LinearGradient colors={["#FF8C3A", colors.primary, colors.primaryDark]} style={styles.primaryBtn}>
                                {locating ? (
                                    <>
                                        <ActivityIndicator color={colors.white} />
                                        <Text style={styles.primaryBtnText}>Locating you…</Text>
                                    </>
                                ) : (
                                    <>
                                        <View style={styles.primaryBtnIcon}>
                                            <Feather name="navigation" size={18} color={colors.white} />
                                        </View>
                                        <View style={styles.primaryBtnCopy}>
                                            <Text style={styles.primaryBtnText}>Capture my location</Text>
                                            <Text style={styles.primaryBtnSub}>Uses device GPS · read-only</Text>
                                        </View>
                                        <Feather name="arrow-right" size={18} color="rgba(255,255,255,0.9)" />
                                    </>
                                )}
                            </LinearGradient>
                        </Pressable>
                    </View>
                )}
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { gap: spacing.sm },
    label: { fontSize: 14, fontWeight: "600", color: colors.mutedForeground },
    required: { color: colors.rose },
    card: {
        borderRadius: radius.x3,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
        overflow: "hidden",
        ...shadows.card,
    },
    cardCaptured: {
        borderColor: "rgba(4,120,87,0.35)",
    },
    cardError: {
        borderColor: "rgba(225,29,72,0.45)",
    },
    radarPanel: {
        height: 168,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
    },
    radarDecorA: {
        position: "absolute",
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: "rgba(255,255,255,0.08)",
        top: -36,
        right: -24,
    },
    radarDecorB: {
        position: "absolute",
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: "rgba(255,255,255,0.06)",
        bottom: 12,
        left: 16,
    },
    radarDecorC: {
        position: "absolute",
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.05)",
        top: 18,
        left: 48,
    },
    gridH1: {
        position: "absolute",
        left: 0,
        right: 0,
        top: "33%",
        height: 1,
        backgroundColor: "rgba(255,255,255,0.12)",
    },
    gridH2: {
        position: "absolute",
        left: 0,
        right: 0,
        top: "66%",
        height: 1,
        backgroundColor: "rgba(255,255,255,0.12)",
    },
    gridV1: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: "33%",
        width: 1,
        backgroundColor: "rgba(255,255,255,0.12)",
    },
    gridV2: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: "66%",
        width: 1,
        backgroundColor: "rgba(255,255,255,0.12)",
    },
    radarRingOuter: {
        position: "absolute",
        width: 132,
        height: 132,
        borderRadius: 66,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.22)",
    },
    radarRingMid: {
        position: "absolute",
        width: 92,
        height: 92,
        borderRadius: 46,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.28)",
    },
    radarRingInner: {
        position: "absolute",
        width: 52,
        height: 52,
        borderRadius: 26,
        borderWidth: 1.5,
        borderColor: "rgba(255,255,255,0.35)",
    },
    radarCenter: {
        alignItems: "center",
        justifyContent: "center",
    },
    radarCenterGlow: {
        position: "absolute",
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: "rgba(255,255,255,0.18)",
    },
    radarCenterCore: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.white,
        alignItems: "center",
        justifyContent: "center",
        ...shadows.primaryButton,
    },
    radarBadge: {
        position: "absolute",
        top: spacing.md,
        right: spacing.md,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: radius.x2,
        backgroundColor: "rgba(0,0,0,0.22)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.18)",
    },
    radarBadgeText: {
        fontSize: 11,
        fontWeight: "800",
        color: colors.white,
        letterSpacing: 0.4,
        textTransform: "uppercase",
    },
    body: {
        padding: spacing.lg,
        gap: spacing.md,
        backgroundColor: colors.card,
    },
    title: {
        fontSize: 18,
        fontWeight: "800",
        color: colors.foreground,
        lineHeight: 24,
    },
    subtitle: {
        fontSize: 13,
        lineHeight: 20,
        color: colors.mutedForeground,
        marginTop: -4,
    },
    steps: {
        gap: 10,
        paddingVertical: 4,
    },
    stepRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    stepBadge: {
        width: 22,
        height: 22,
        borderRadius: 11,
        alignItems: "center",
        justifyContent: "center",
    },
    stepNumber: {
        fontSize: 11,
        fontWeight: "800",
        color: colors.white,
    },
    stepIcon: {
        width: 32,
        height: 32,
        borderRadius: radius.md,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.orange50,
        borderWidth: 1,
        borderColor: colors.orange100,
    },
    stepText: {
        flex: 1,
        fontSize: 14,
        fontWeight: "600",
        color: colors.foreground,
    },
    primaryWrap: {
        marginTop: spacing.xs,
    },
    primaryBtn: {
        minHeight: 58,
        borderRadius: radius.xl,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: spacing.lg,
        gap: 12,
        ...shadows.primaryButton,
    },
    primaryBtnIcon: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: "rgba(255,255,255,0.2)",
        alignItems: "center",
        justifyContent: "center",
    },
    primaryBtnCopy: {
        flex: 1,
        gap: 2,
    },
    primaryBtnText: {
        fontSize: 16,
        fontWeight: "800",
        color: colors.white,
    },
    primaryBtnSub: {
        fontSize: 11,
        fontWeight: "600",
        color: "rgba(255,255,255,0.82)",
    },
    coordsGlass: {
        borderRadius: radius.xl,
        borderWidth: 1,
        borderColor: "rgba(4,120,87,0.18)",
        backgroundColor: "#F0FDF4",
        overflow: "hidden",
    },
    coordBlock: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    coordIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: "rgba(4,120,87,0.15)",
        alignItems: "center",
        justifyContent: "center",
    },
    coordIconText: {
        fontSize: 9,
        fontWeight: "800",
        color: colors.emerald,
        letterSpacing: 0.4,
    },
    coordCopy: {
        flex: 1,
        gap: 2,
    },
    coordLabel: {
        ...typography.label,
        color: colors.emerald,
    },
    coordValue: {
        fontSize: 16,
        fontWeight: "800",
        color: colors.foreground,
        fontVariant: ["tabular-nums"],
        letterSpacing: 0.2,
    },
    coordDivider: {
        height: 1,
        backgroundColor: "rgba(4,120,87,0.12)",
        marginHorizontal: spacing.lg,
    },
    capturedHint: {
        fontSize: 13,
        lineHeight: 19,
        color: colors.mutedForeground,
        textAlign: "center",
    },
    secondaryBtn: {
        minHeight: 46,
        borderRadius: radius.xl,
        borderWidth: 1.5,
        borderColor: colors.primary,
        backgroundColor: colors.orange50,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    secondaryBtnText: {
        fontSize: 14,
        fontWeight: "800",
        color: colors.primary,
    },
    btnPressed: { opacity: 0.9 },
    btnDisabled: { opacity: 0.65 },
    error: {
        fontSize: 12,
        color: colors.rose,
        fontWeight: "600",
    },
});
