import { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { fetchDashboard, fetchServiceCategoriesHome, resolveUploadUrl, type DashboardData, type HomeServiceCategory } from "../api";
import { useAuth } from "../context/AuthContext";
import BookServiceSearch from "../components/booking/BookServiceSearch";
import { useMainNavigation } from "../navigation/MainNavContext";
import { bookingAccentStripeColor, isBookingChatOpen, useRootNavigation } from "../helpers/common";
import { formatDateTimeShort } from "../helpers/date";
import EmptyState from "../components/ui/EmptyState";
import Screen from "../components/ui/Screen";
import SectionHeader from "../components/ui/SectionHeader";
import StatusBadge from "../components/ui/StatusBadge";
import { BRAND, chatButtonStyles } from "../config/constant";
import { colors, radius, shadows, spacing } from "../theme/colors";

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
}

function shortCategoryName(name: string) {
    return name.replace(/\s+Services?$/i, "").replace(/\s+Service$/i, "").trim();
}

export default function DashboardScreen() {
    const { user } = useAuth();
    const { navigate } = useMainNavigation();
    const rootNav = useRootNavigation();
    const [dashboard, setDashboard] = useState<DashboardData | null>(null);
    const [categories, setCategories] = useState<HomeServiceCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const firstName = (user.name || "there").trim().split(/\s+/)[0];
    const greeting = useMemo(() => getGreeting(), []);

    const load = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        try {
            const [dashRes, catRes] = await Promise.all([fetchDashboard(), fetchServiceCategoriesHome(9)]);
            if (dashRes.status) setDashboard(dashRes.data);
            if (catRes.status && Array.isArray(catRes.data)) setCategories(catRes.data.slice(0, 9));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(useCallback(() => { void load(); }, [load]));

    const pickCategory = (row: HomeServiceCategory) => {
        rootNav.navigate("ServiceCategoryDetail", {
            categorySlug: row.slug,
            categoryName: row.name,
            categoryId: row._id,
        });
    };

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

            <SectionHeader
                title="Service Categories"
                subtitle="Tap a category to view services"
                actionLabel="View All"
                onAction={() => rootNav.navigate("ServiceCategories")}
            />
            {categories.length ? (
                <View style={styles.categoryGrid}>
                    {categories.map((row) => {
                        const imageUri = resolveUploadUrl(row.image);
                        return (
                            <Pressable
                                key={row._id}
                                onPress={() => pickCategory(row)}
                                style={styles.categoryCell}
                            >
                                <View style={styles.categoryImageWrap}>
                                    {imageUri ? (
                                        <Image source={{ uri: imageUri }} style={styles.categoryImage} resizeMode="contain" />
                                    ) : (
                                        <Feather name="briefcase" size={22} color={colors.primary} />
                                    )}
                                </View>
                                <Text style={styles.categoryLabel} numberOfLines={2}>
                                    {shortCategoryName(row.name)}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
            ) : loading ? (
                <View style={styles.categoryLoading}>
                    <ActivityIndicator color={colors.primary} />
                </View>
            ) : null}

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
                                                chatDisabled: !isBookingChatOpen(booking.status),
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
    heroGreeting: { color: "rgba(255,255,255,0.88)", fontSize: 14, fontWeight: "600" },
    heroTitle: { color: colors.white, fontSize: 28, fontWeight: "800", lineHeight: 34, marginTop: 4 },
    walletLabel: { color: "rgba(255,255,255,0.78)", fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
    walletValue: { color: colors.white, fontSize: 20, fontWeight: "800", marginTop: 2 },
    searchOverlap: { marginBottom: spacing.lg, zIndex: 2 },
    categoryGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
        marginBottom: spacing.xl,
    },
    categoryCell: {
        width: "31.5%",
        flexGrow: 1,
        maxWidth: "32.5%",
        alignItems: "center",
        backgroundColor: colors.card,
        borderRadius: radius.x2,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
        gap: spacing.sm,
        ...shadows.card,
        shadowOpacity: 0.04,
    },
    categoryImageWrap: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: colors.muted,
        alignItems: "center",
        justifyContent: "center",
    },
    categoryImage: {
        width: 48,
        height: 48,
    },
    categoryLabel: {
        fontSize: 12,
        fontWeight: "700",
        color: colors.foreground,
        textAlign: "center",
        lineHeight: 16,
        minHeight: 32,
    },
    categoryLoading: { paddingVertical: spacing.xl, alignItems: "center", marginBottom: spacing.lg },
    loadingBox: { paddingVertical: 48, alignItems: "center" },
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
