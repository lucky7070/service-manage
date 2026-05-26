import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { fetchBookings, type BookingRow } from "../api";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import FilterChips from "../components/ui/FilterChips";
import PageHero from "../components/ui/PageHero";
import Screen from "../components/ui/Screen";
import StatusBadge from "../components/ui/StatusBadge";
import { bookingAccentStripeColor } from "../helpers/common";
import { formatDateTimeShort } from "../helpers/date";
import { chatButtonStyles } from "../config/constant";
import { useRootNavigation } from "../helpers/common";
import { colors, radius, spacing } from "../theme/colors";

const statusFilters = [
    { value: "", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "price_pending", label: "Price pending" },
    { value: "price_agreed", label: "Price agreed" },
    { value: "confirmed", label: "Confirmed" },
    { value: "in_progress", label: "In progress" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
];

export default function BookingsScreen() {
    const navigation = useRootNavigation();
    const [status, setStatus] = useState("");
    const [pageNo, setPageNo] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [rows, setRows] = useState<BookingRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async (isRefresh = false, page = pageNo) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        try {
            const response = await fetchBookings({ pageNo: page, limit: 5, status: status || undefined });
            if (response.status) {
                setRows(response.data.record || []);
                setTotalPages(response.data.totalPages || 0);
                setPageNo(response.data.current_page || page);
            } else {
                setRows([]);
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [pageNo, status]);

    useFocusEffect(useCallback(() => { void load(false, 1); }, [status]));

    return (
        <Screen safe={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor={colors.primary} />}>
            <PageHero
                eyebrow="My services"
                title="Bookings"
                subtitle="Track your service requests, pricing, and job status in one place."
            />

            <Card large elevated>
                <FilterChips items={statusFilters} value={status} onChange={setStatus} />

                {loading ? (
                    <View style={styles.loadingBox}><ActivityIndicator color={colors.primary} /></View>
                ) : rows.length === 0 ? (
                    <EmptyState icon="calendar" title="No bookings found" message="Try another filter or book a service to get started." />
                ) : (
                    <View style={styles.list}>
                        {rows.map((booking) => (
                            <View key={booking._id} style={styles.bookingCard}>
                                <View style={[styles.stripe, { backgroundColor: bookingAccentStripeColor(booking.status) }]} />
                                <View style={styles.bookingBody}>
                                    <Pressable onPress={() => navigation.navigate("BookingDetail", { bookingId: booking._id })}>
                                        <View style={styles.bookingTop}>
                                            <View style={styles.bookingMain}>
                                                <Text style={styles.bookingNumber}>{booking.bookingNumber}</Text>
                                                <View style={styles.bookingLineRow}>
                                                    <Feather name="briefcase" size={12} color={colors.primary} />
                                                    <Text style={styles.bookingLine}>
                                                        {booking.serviceCategoryName || "Service"} · with {booking.providerName || "your professional"}
                                                    </Text>
                                                </View>
                                                {booking.cityName ? (
                                                    <View style={styles.metaRow}><Feather name="map-pin" size={12} color={colors.mutedForeground} /><Text style={styles.metaLine}>{booking.cityName}</Text></View>
                                                ) : null}
                                                {booking.scheduledTime ? (
                                                    <View style={styles.metaRow}><Feather name="clock" size={12} color={colors.mutedForeground} /><Text style={styles.metaLine}>{formatDateTimeShort(booking.scheduledTime)}</Text></View>
                                                ) : null}
                                            </View>
                                            <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
                                        </View>
                                    </Pressable>
                                    <View style={styles.bookingFooter}>
                                        <StatusBadge status={booking.status} />
                                        <View style={styles.footerActions}>
                                            <Pressable
                                                onPress={() => navigation.navigate("BookingChat", {
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
                                            {booking.finalPrice ? <Text style={styles.price}>₹{Number(booking.finalPrice).toLocaleString("en-IN")}</Text> : null}
                                        </View>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {totalPages > 1 && !loading ? (
                    <View style={styles.pagination}>
                        <Pressable disabled={pageNo <= 1} onPress={() => void load(false, Math.max(pageNo - 1, 1))} style={[styles.pageBtn, pageNo <= 1 && styles.pageBtnDisabled]}>
                            <Text style={styles.pageBtnText}>Previous</Text>
                        </Pressable>
                        <Text style={styles.pageInfo}>Page {pageNo} of {totalPages}</Text>
                        <Pressable disabled={pageNo >= totalPages} onPress={() => void load(false, pageNo + 1)} style={[styles.pageBtn, pageNo >= totalPages && styles.pageBtnDisabled]}>
                            <Text style={styles.pageBtnText}>Next</Text>
                        </Pressable>
                    </View>
                ) : null}
            </Card>
        </Screen>
    );
}

const styles = StyleSheet.create({
    loadingBox: { paddingVertical: 40, alignItems: "center" },
    list: { gap: 12 },
    bookingCard: {
        borderRadius: radius.x2,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.background,
        overflow: "hidden",
        flexDirection: "row",
    },
    stripe: { width: 4 },
    bookingBody: { flex: 1, padding: spacing.md, gap: spacing.sm },
    bookingTop: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
    bookingMain: { flex: 1, gap: 4 },
    bookingNumber: { fontSize: 15, fontWeight: "800", color: colors.primary },
    bookingLineRow: { flexDirection: "row", alignItems: "center", gap: 4 },
    bookingLine: { flex: 1, fontSize: 12, color: colors.mutedForeground, lineHeight: 18 },
    metaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
    metaLine: { fontSize: 12, color: colors.mutedForeground },
    bookingFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    footerActions: { flexDirection: "row", alignItems: "center", gap: 10 },
    price: { fontSize: 15, fontWeight: "800", color: colors.foreground },
    pagination: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: spacing.lg, gap: 8 },
    pageBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: colors.card },
    pageBtnDisabled: { opacity: 0.45 },
    pageBtnText: { fontSize: 13, fontWeight: "600", color: colors.foreground },
    pageInfo: { fontSize: 12, color: colors.mutedForeground },
});
