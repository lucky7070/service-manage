import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { fetchDashboard, type DashboardData } from "../api";
import { useAuth } from "../context/AuthContext";
import BookServiceSearch from "../components/booking/BookServiceSearch";
import { useMainNavigation } from "../navigation/MainLayout";
import { useRootNavigation } from "../helpers/common";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import Screen from "../components/ui/Screen";
import SectionHeader from "../components/ui/SectionHeader";
import StatTile from "../components/ui/StatTile";
import StatusBadge from "../components/ui/StatusBadge";
import { BRAND, LOGIN_STATS } from "../config/constant";
import { colors, radius, spacing } from "../theme/colors";

const statCards = [
    { key: "total", label: "Total", icon: "calendar" as const, tone: "primary" as const },
    { key: "pending", label: "Pending", icon: "clock" as const, tone: "amber" as const },
    { key: "completed", label: "Done", icon: "check-circle" as const, tone: "emerald" as const },
    { key: "cancelled", label: "Cancelled", icon: "x-circle" as const, tone: "rose" as const },
];

export default function DashboardScreen() {
    const { user } = useAuth();
    const { navigate } = useMainNavigation();
    const rootNav = useRootNavigation();
    const [dashboard, setDashboard] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const firstName = (user?.name || "there").trim().split(/\s+/)[0];

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
                <View style={styles.heroTop}>
                    <View style={styles.heroBrand}>
                        <View style={styles.heroMark}><Text style={styles.heroMarkText}>{BRAND.mark}</Text></View>
                        <Text style={styles.heroBrandName}>{BRAND.name}</Text>
                    </View>
                    {user?.balance != null ? (
                        <View style={styles.walletPill}>
                            <Feather name="credit-card" size={14} color="rgba(255,255,255,0.9)" />
                            <Text style={styles.walletText}>₹ {Number(user.balance).toLocaleString("en-IN")}</Text>
                        </View>
                    ) : null}
                </View>

                <Text style={styles.heroGreeting}>Hi {firstName} 👋</Text>
                <Text style={styles.heroTitle}>What can we fix{"\n"}for you today?</Text>
                <Text style={styles.heroSub}>Trusted home services — book a pro in minutes.</Text>
            </LinearGradient>

            <View style={styles.searchOverlap}>
                <BookServiceSearch />
            </View>

            {loading ? (
                <View style={styles.loadingBox}><ActivityIndicator size="large" color={colors.primary} /></View>
            ) : (
                <View style={styles.dashboardContainer}>
                    <SectionHeader title="Your activity" subtitle="Booking overview" />
                    <View style={styles.statsGrid}>
                        {statCards.map(({ key, label, icon, tone }) => (
                            <StatTile
                                key={key}
                                label={label}
                                icon={icon}
                                tone={tone}
                                value={dashboard?.bookingStats?.[key] ?? 0}
                            />
                        ))}
                    </View>

                    <Card large elevated style={styles.recentCard}>
                        <View style={styles.recentHeader}>
                            <Text style={styles.recentTitle}>Recent bookings</Text>
                            <Pressable onPress={() => navigate("Bookings")}>
                                <Text style={styles.viewAll}>View all</Text>
                            </Pressable>
                        </View>

                        {dashboard?.recentBookings?.length ? dashboard.recentBookings.map((booking) => (
                            <Pressable key={booking._id} onPress={() => rootNav.navigate("BookingDetail", { bookingId: booking._id })} style={styles.bookingRow}>
                                <View style={styles.bookingAccent} />
                                <View style={styles.bookingContent}>
                                    <View style={styles.bookingTop}>
                                        <View style={styles.bookingMain}>
                                            <Text style={styles.bookingNumber}>{booking.bookingNumber}</Text>
                                            <Text style={styles.bookingMeta}>
                                                {booking.serviceCategoryName || "Service"} with {booking.providerName || "provider"}
                                            </Text>
                                        </View>
                                        <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
                                    </View>
                                    <StatusBadge status={booking.status} />
                                </View>
                            </Pressable>
                        )) : (
                            <EmptyState icon="calendar" title="No bookings yet" message="Search above to book your first service." />
                        )}
                    </Card>
                </View>
            )}
        </Screen>
    );
}

const styles = StyleSheet.create({
    dashboardContainer: {
        paddingVertical: spacing.lg,
    },
    hero: {
        borderRadius: radius.x3,
        padding: spacing.xl,
        paddingBottom: spacing.x2 + 28,
        marginBottom: -28,
        overflow: "hidden",
    },
    heroDecorA: {
        position: "absolute",
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: "rgba(255,255,255,0.08)",
        top: -50,
        right: -30,
    },
    heroDecorB: {
        position: "absolute",
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: "rgba(255,255,255,0.06)",
        bottom: 40,
        left: 20,
    },
    heroTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: spacing.lg,
    },
    heroBrand: { flexDirection: "row", alignItems: "center", gap: 8 },
    heroMark: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: "rgba(255,255,255,0.18)",
        alignItems: "center",
        justifyContent: "center",
    },
    heroMarkText: { color: colors.white, fontWeight: "800", fontSize: 14 },
    heroBrandName: { color: colors.white, fontWeight: "800", fontSize: 15 },
    walletPill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "rgba(255,255,255,0.16)",
        borderRadius: radius.x2,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.18)",
    },
    walletText: { color: colors.white, fontSize: 13, fontWeight: "800" },
    heroGreeting: { color: "rgba(255,255,255,0.88)", fontSize: 15, fontWeight: "600" },
    heroTitle: { color: colors.white, fontSize: 30, fontWeight: "800", lineHeight: 36, marginTop: 4 },
    heroSub: { color: "rgba(255,255,255,0.85)", fontSize: 14, lineHeight: 21, marginTop: 8, maxWidth: "90%" },
    statsRow: { flexDirection: "row", gap: 8, marginTop: spacing.lg },
    statPill: {
        flex: 1,
        backgroundColor: "rgba(255,255,255,0.12)",
        borderRadius: radius.xl,
        paddingVertical: 10,
        paddingHorizontal: 8,
        alignItems: "center",
    },
    statValue: { color: colors.white, fontSize: 15, fontWeight: "800" },
    statLabel: { color: "rgba(255,255,255,0.75)", fontSize: 9, fontWeight: "700", marginTop: 2, textAlign: "center" },
    searchOverlap: { marginBottom: spacing.lg, zIndex: 2 },
    quickRow: {
        flexDirection: "row",
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    quickLink: {
        flex: 1,
        alignItems: "center",
        gap: 6,
        backgroundColor: colors.card,
        borderRadius: radius.x2,
        paddingVertical: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    quickIcon: {
        width: 34,
        height: 34,
        borderRadius: 12,
        backgroundColor: "rgba(240,116,26,0.1)",
        alignItems: "center",
        justifyContent: "center",
    },
    quickLabel: { fontSize: 10, fontWeight: "700", color: colors.foreground, textAlign: "center" },
    loadingBox: { paddingVertical: 48, alignItems: "center" },
    statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md, marginBottom: spacing.lg },
    recentCard: { gap: spacing.md },
    recentHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
    recentTitle: { fontSize: 18, fontWeight: "800", color: colors.foreground },
    viewAll: { color: colors.primary, fontWeight: "700", fontSize: 14 },
    bookingRow: {
        flexDirection: "row",
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.background,
        borderRadius: radius.xl,
        overflow: "hidden",
        marginBottom: spacing.sm,
    },
    bookingAccent: { width: 4, backgroundColor: colors.primary },
    bookingContent: { flex: 1, padding: spacing.md, gap: spacing.sm },
    bookingTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: spacing.sm },
    bookingMain: { flex: 1, gap: 4 },
    bookingNumber: { fontSize: 15, fontWeight: "800", color: colors.primary },
    bookingMeta: { fontSize: 13, color: colors.mutedForeground, lineHeight: 18 },
});
