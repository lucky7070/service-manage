import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { fetchBookings, type BookingRow } from "../api";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import FilterChips from "../components/ui/FilterChips";
import PageHero from "../components/ui/PageHero";
import PaginationBar from "../components/ui/PaginationBar";
import Screen from "../components/ui/Screen";
import StatusBadge from "../components/ui/StatusBadge";
import { bookingAccentStripeColor } from "../helpers/common";
import { formatDateTimeShort } from "../helpers/date";
import { chatButtonStyles } from "../config/constant";
import { useRootNavigation } from "../helpers/common";
import { colors } from "../theme/colors";
import { screenStyles } from "../theme/screenStyles";

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
                    <View style={screenStyles.loadingBox}><ActivityIndicator color={colors.primary} /></View>
                ) : rows.length === 0 ? (
                    <EmptyState icon="calendar" title="No bookings found" message="Try another filter or book a service to get started." />
                ) : (
                    <View style={screenStyles.list}>
                        {rows.map((booking) => (
                            <View key={booking._id} style={screenStyles.stripeRow}>
                                <View style={[screenStyles.stripe, { backgroundColor: bookingAccentStripeColor(booking.status) }]} />
                                <View style={screenStyles.stripeBody}>
                                    <Pressable onPress={() => navigation.navigate("BookingDetail", { bookingId: booking._id })}>
                                        <View style={screenStyles.rowTop}>
                                            <View style={screenStyles.rowMain}>
                                                <Text style={screenStyles.primaryNumber}>{booking.bookingNumber}</Text>
                                                <View style={screenStyles.metaRow}>
                                                    <Feather name="briefcase" size={12} color={colors.primary} />
                                                    <Text style={screenStyles.metaLine}>
                                                        {booking.serviceCategoryName || "Service"} · with {booking.providerName || "your professional"}
                                                    </Text>
                                                </View>
                                                {booking.cityName ? (
                                                    <View style={screenStyles.metaRow}><Feather name="map-pin" size={12} color={colors.mutedForeground} /><Text style={screenStyles.metaLine}>{booking.cityName}</Text></View>
                                                ) : null}
                                                {booking.scheduledTime ? (
                                                    <View style={screenStyles.metaRow}><Feather name="clock" size={12} color={colors.mutedForeground} /><Text style={screenStyles.metaLine}>{formatDateTimeShort(booking.scheduledTime)}</Text></View>
                                                ) : null}
                                            </View>
                                            <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
                                        </View>
                                    </Pressable>
                                    <View style={screenStyles.rowFooter}>
                                        <StatusBadge status={booking.status} />
                                        <View style={screenStyles.footerActions}>
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
                                            {booking.finalPrice ? <Text style={screenStyles.price}>₹{Number(booking.finalPrice).toLocaleString("en-IN")}</Text> : null}
                                        </View>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {!loading ? (
                    <PaginationBar
                        pageNo={pageNo}
                        totalPages={totalPages}
                        onPrevious={() => void load(false, Math.max(pageNo - 1, 1))}
                        onNext={() => void load(false, pageNo + 1)}
                    />
                ) : null}
            </Card>
        </Screen>
    );
}

