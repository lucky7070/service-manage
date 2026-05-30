import { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { fetchDashboard, type DashboardData } from "../api";
import { useAuth } from "../context/AuthContext";
import BookServiceSearch from "../components/booking/BookServiceSearch";
import { useMainNavigation } from "../navigation/MainNavContext";
import { useRootNavigation } from "../helpers/common";
import { bookingAccentStripeColor } from "../helpers/common";
import { formatDateTimeShort } from "../helpers/date";
import EmptyState from "../components/ui/EmptyState";
import Screen from "../components/ui/Screen";
import SectionHeader from "../components/ui/SectionHeader";
import StatusBadge from "../components/ui/StatusBadge";
import { BRAND, chatButtonStyles } from "../config/constant";
import { colors, radius, shadows, spacing } from "../theme/colors";

type QuickAction = {
    route: "Bookings" | "ServiceLeads" | "ReferEarn" | "Addresses" | "Ledger";
    label: string;
    subtitle: string;
    icon: keyof typeof Feather.glyphMap;
    gradient: [string, string];
    highlight?: boolean;
};

const quickActions: QuickAction[] = [
    { route: "Bookings", label: "Bookings", subtitle: "Track jobs", icon: "calendar", gradient: ["#FF8C3A", colors.primary] },
    { route: "ServiceLeads", label: "Requests", subtitle: "Open leads", icon: "clipboard", gradient: ["#6366F1", "#4F46E5"] },
    { route: "ReferEarn", label: "Refer & earn", subtitle: "Get rewards", icon: "gift", gradient: ["#F59E0B", "#D97706"], highlight: true },
    { route: "Addresses", label: "Addresses", subtitle: "Saved places", icon: "map-pin", gradient: ["#10B981", "#059669"] },
    { route: "Ledger", label: "Wallet", subtitle: "Transactions", icon: "credit-card", gradient: ["#0EA5E9", "#0284C7"] },
];

const statCards = [
    { key: "total", label: "Total bookings", icon: "layers" as const, tone: colors.primary, bg: "rgba(240,116,26,0.1)" },
    { key: "pending", label: "In progress", icon: "clock" as const, tone: colors.amber, bg: "rgba(245,158,11,0.1)" },
    { key: "completed", label: "Completed", icon: "check-circle" as const, tone: colors.emerald, bg: "rgba(4,120,87,0.1)" },
    { key: "cancelled", label: "Cancelled", icon: "x-circle" as const, tone: colors.rose, bg: "rgba(225,29,72,0.08)" },
];

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
}

export default function DashboardScreen() {
    const { user } = useAuth();
    const { navigate } = useMainNavigation();
    const rootNav = useRootNavigation();
    const [dashboard, setDashboard] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const firstName = (user.name || "there").trim().split(/\s+/)[0];
    const greeting = useMemo(() => getGreeting(), []);

    const load = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        try {
            const response = await fetchDashboard();
            if (response.status) setDashboard(response.data);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(useCallback(() => { void load(); }, [load]));

    return (
        <Screen safe={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor={colors.primary} />}>
            <LinearGradient colors={["#FF8C3A", colors.primary, colors.primaryDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
                <View style={styles.heroDecorA} />
                <View style={styles.heroDecorB} />
                <View style={styles.heroDecorC} />

                <View style={styles.heroTop}>
                    <View style={styles.heroBrand}>
                        <View style={styles.heroMark}><Text style={styles.heroMarkText}>{BRAND.mark}</Text></View>
                        <Text style={styles.heroBrandName}>{BRAND.name}</Text>
                    </View>
                    {user.balance != null ? <View style={{ flexDirection: "column", alignItems: "flex-end", gap: spacing.sm }}>
                        <Text style={styles.walletLabel}>Wallet Balance</Text>
                        <Text style={styles.walletValue}>₹{Number(user.balance || 0).toLocaleString("en-IN")}</Text>
                    </View> : null}
                </View>

                <Text style={styles.heroGreeting}>{greeting}, {firstName}</Text>
                <Text style={styles.heroTitle}>Your home services,{"\n"}one tap away</Text>
            </LinearGradient>

            <View style={styles.searchOverlap}>
                <BookServiceSearch embedded />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickScroll}>
                {quickActions.map((action) => (
                    <Pressable
                        key={action.route}
                        onPress={() => navigate(action.route)}
                        style={[styles.quickCard, action.highlight && styles.quickCardHighlight, { alignItems: "center" }]}
                    >
                        <LinearGradient colors={action.gradient} style={styles.quickIcon}>
                            <Feather name={action.icon} size={18} color={colors.white} />
                        </LinearGradient>
                        <Text style={styles.quickLabel}>{action.label}</Text>
                        <Text style={styles.quickSub}>
                            {action.route === "Addresses" && dashboard?.addressCount != null
                                ? `${dashboard.addressCount} saved`
                                : action.subtitle}
                        </Text>
                    </Pressable>
                ))}
            </ScrollView>

            {loading ? (
                <View style={styles.loadingBox}><ActivityIndicator size="large" color={colors.primary} /></View>
            ) : (
                <>
                    <SectionHeader title="Recent bookings" subtitle="Live booking overview" actionLabel="View All" onAction={() => navigate("Bookings")} />
                    {dashboard?.recentBookings?.length ? dashboard.recentBookings.map((booking) => (
                        <Pressable
                            key={booking._id}
                            onPress={() => rootNav.navigate("BookingDetail", { bookingId: booking._id })}
                            style={styles.bookingRow}
                        >
                            <View style={[styles.bookingStripe, { backgroundColor: bookingAccentStripeColor(booking.status) }]} />
                            <View style={styles.bookingContent}>
                                <View style={styles.bookingTop}>
                                    <View style={styles.bookingMain}>
                                        <Text style={styles.bookingNumber}>{booking.bookingNumber}</Text>
                                        <Text style={styles.bookingMeta} numberOfLines={2}>
                                            {booking.serviceCategoryName || "Service"} · {booking.providerName || "Provider"}
                                        </Text>
                                        {booking.bookingTime ? (
                                            <View style={styles.bookingTimeRow}>
                                                <Feather name="clock" size={12} color={colors.mutedForeground} />
                                                <Text style={styles.bookingTime}>{formatDateTimeShort(booking.bookingTime)}</Text>
                                            </View>
                                        ) : null}
                                    </View>
                                    <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
                                </View>
                                <View style={styles.bookingFooter}>
                                    <StatusBadge status={booking.status} />
                                    {booking.status !== "cancelled" ? (
                                        <Pressable
                                            onPress={() => rootNav.navigate("BookingChat", {
                                                bookingId: booking._id,
                                                bookingNumber: booking.bookingNumber,
                                                providerName: booking.providerName,
                                                chatDisabled: booking.status === "cancelled",
                                            })}
                                            style={chatButtonStyles.btn}
                                            hitSlop={6}
                                        >
                                            <Feather name="message-circle" size={14} color={colors.primary} />
                                            <Text style={chatButtonStyles.text}>Chat</Text>
                                        </Pressable>
                                    ) : null}
                                </View>
                            </View>
                        </Pressable>
                    )) : (
                        <EmptyState icon="calendar" title="No bookings yet" message="Use the search above to book your first home service." />
                    )}
                </>
            )}
        </Screen>
    );
}

const styles = StyleSheet.create({
    hero: {
        borderRadius: radius.x3,
        padding: spacing.xl,
        paddingBottom: spacing.x2 + 32,
        marginBottom: -32,
        overflow: "hidden",
    },
    heroDecorA: {
        position: "absolute",
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: "rgba(255,255,255,0.08)",
        top: -60,
        right: -40,
    },
    heroDecorB: {
        position: "absolute",
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "rgba(255,255,255,0.06)",
        bottom: 48,
        left: 16,
    },
    heroDecorC: {
        position: "absolute",
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "rgba(255,255,255,0.05)",
        top: 80,
        right: 60,
    },
    heroTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: spacing.lg,
    },
    heroBrand: { flexDirection: "row", alignItems: "center", gap: 8 },
    heroMark: {
        width: 34,
        height: 34,
        borderRadius: 11,
        backgroundColor: "rgba(255,255,255,0.18)",
        alignItems: "center",
        justifyContent: "center",
    },
    heroMarkText: { color: colors.white, fontWeight: "800", fontSize: 15 },
    heroBrandName: { color: colors.white, fontWeight: "800", fontSize: 16 },
    heroAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(255,255,255,0.18)",
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.35)",
        alignItems: "center",
        justifyContent: "center",
    },
    heroAvatarText: { color: colors.white, fontSize: 18, fontWeight: "800" },
    heroGreeting: { color: "rgba(255,255,255,0.88)", fontSize: 14, fontWeight: "600" },
    heroTitle: { color: colors.white, fontSize: 28, fontWeight: "800", lineHeight: 34, marginTop: 4 },
    walletCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: spacing.lg,
        backgroundColor: "rgba(255,255,255,0.14)",
        borderRadius: radius.x2,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.18)",
    },
    walletLeft: { flexDirection: "row", alignItems: "center", gap: spacing.md },
    walletLabel: { color: "rgba(255,255,255,0.78)", fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
    walletValue: { color: colors.white, fontSize: 20, fontWeight: "800", marginTop: 2 },
    walletBtn: { flexDirection: "row", alignItems: "center", gap: 2, paddingHorizontal: 10, paddingVertical: 6 },
    walletBtnText: { color: colors.white, fontSize: 13, fontWeight: "700" },
    searchOverlap: { marginBottom: spacing.lg, zIndex: 2 },
    quickScroll: { gap: spacing.sm, paddingBottom: spacing.lg },
    quickCard: {
        width: 108,
        backgroundColor: colors.card,
        borderRadius: radius.x2,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        ...shadows.card,
        shadowOpacity: 0.05,
    },
    quickCardHighlight: {
        borderColor: colors.amberRing,
        backgroundColor: colors.amberBg,
    },
    quickIcon: {
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: spacing.sm,
    },
    quickLabel: { fontSize: 12, fontWeight: "800", color: colors.foreground },
    quickSub: { fontSize: 10, color: colors.mutedForeground, marginTop: 2, fontWeight: "600" },
    howCard: { marginBottom: spacing.lg, gap: spacing.md },
    howTitle: { fontSize: 16, fontWeight: "800", color: colors.foreground },
    howRow: { flexDirection: "row", justifyContent: "space-between" },
    howStep: { flex: 1, alignItems: "center", position: "relative", gap: 4 },
    howIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "rgba(240,116,26,0.1)",
        alignItems: "center",
        justifyContent: "center",
    },
    howStepTitle: { fontSize: 12, fontWeight: "800", color: colors.foreground },
    howStepSub: { fontSize: 10, color: colors.mutedForeground, textAlign: "center" },
    howArrow: { position: "absolute", right: -6, top: 10 },
    loadingBox: { paddingVertical: 48, alignItems: "center" },
    statsScroll: { gap: spacing.sm, paddingBottom: spacing.lg },
    statCard: {
        width: 132,
        borderRadius: radius.x2,
        padding: spacing.md,
        gap: 6,
        borderWidth: 1,
        borderColor: "rgba(232,231,230,0.8)",
    },
    statIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    statValue: { fontSize: 26, fontWeight: "800", lineHeight: 30 },
    statLabel: { fontSize: 11, fontWeight: "600", color: colors.mutedForeground, lineHeight: 15 },
    recentCard: { gap: spacing.sm, marginBottom: spacing.lg },
    bookingRow: {
        flexDirection: "row",
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.background,
        borderRadius: radius.x2,
        overflow: "hidden",
        marginBottom: spacing.sm,
    },
    bookingStripe: { width: 4 },
    bookingContent: { flex: 1, padding: spacing.md, gap: spacing.sm },
    bookingTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: spacing.sm },
    bookingMain: { flex: 1, gap: 4 },
    bookingNumber: { fontSize: 15, fontWeight: "800", color: colors.primary },
    bookingMeta: { fontSize: 13, color: colors.mutedForeground, lineHeight: 18 },
    bookingTimeRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
    bookingTime: { fontSize: 11, color: colors.mutedForeground, fontWeight: "600" },
    bookingFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
});
