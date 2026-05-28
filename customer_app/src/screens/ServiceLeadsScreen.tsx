import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { fetchServiceLeads, type ServiceLeadRow } from "../api";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import FilterChips from "../components/ui/FilterChips";
import PageHero from "../components/ui/PageHero";
import PaginationBar from "../components/ui/PaginationBar";
import Screen from "../components/ui/Screen";
import { useRootNavigation } from "../helpers/common";
import { formatDate, formatDateTimeShort } from "../helpers/date";
import { colors, radius, spacing } from "../theme/colors";
import { screenStyles } from "../theme/screenStyles";

const statuses: Array<{ value: "" | "open" | "assigned" | "cancelled"; label: string }> = [
    { value: "", label: "All" },
    { value: "open", label: "Open" },
    { value: "assigned", label: "Assigned" },
    { value: "cancelled", label: "Cancelled" },
];

function leadStatusStyle(status: string) {
    switch (status) {
        case "assigned":
            return { bg: "rgba(240,116,26,0.1)", text: colors.primary, stripe: colors.primary };
        case "cancelled":
            return { bg: colors.muted, text: colors.mutedForeground, stripe: colors.mutedForeground };
        default:
            return { bg: colors.muted, text: colors.foreground, stripe: "#A3A3A3" };
    }
}

function leadHint(status: string) {
    switch (status) {
        case "open":
            return "Finding a provider.";
        case "assigned":
            return "Provider assigned — open your booking to continue.";
        default:
            return "Cancelled.";
    }
}

export default function ServiceLeadsScreen() {
    const rootNav = useRootNavigation();
    const [status, setStatus] = useState<"" | "open" | "assigned" | "cancelled">("");
    const [pageNo, setPageNo] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [rows, setRows] = useState<ServiceLeadRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async (isRefresh = false, page = pageNo) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        try {
            const response = await fetchServiceLeads({ pageNo: page, limit: 5, status: status || undefined });
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
        <Screen
            safe={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor={colors.primary} />}
        >
            <PageHero
                eyebrow="Open requests"
                title="Booking Requests"
                subtitle="Requests submitted without choosing a provider. When we assign one, your booking will appear under Bookings."
            />

            <Card large elevated>
                <FilterChips
                    items={statuses.map((s) => ({ value: s.value, label: s.label }))}
                    value={status}
                    onChange={(v) => setStatus(v as typeof status)}
                />

                {loading ? (
                    <View style={screenStyles.loadingBox}><ActivityIndicator color={colors.primary} /></View>
                ) : rows.length === 0 ? (
                    <EmptyState icon="clipboard" title="No booking requests yet" message="Search for a service and submit a request without choosing a provider." />
                ) : (
                    <View style={screenStyles.list}>
                        {rows.map((lead) => {
                            const tone = leadStatusStyle(lead.status);
                            return (
                                <View key={lead._id} style={screenStyles.stripeRow}>
                                    <View style={[screenStyles.stripe, { backgroundColor: tone.stripe }]} />
                                    <View style={screenStyles.stripeBody}>
                                        <View style={screenStyles.rowTop}>
                                            <View style={screenStyles.rowMain}>
                                                <Text style={screenStyles.primaryNumber}>{lead.leadNumber}</Text>
                                                <Text style={screenStyles.metaLine}>
                                                    {lead.serviceCategoryName || "Service"} · {lead.cityName || "—"}
                                                </Text>
                                                {lead.issueDescription ? (
                                                    <Text style={screenStyles.metaLine} numberOfLines={2}>{lead.issueDescription}</Text>
                                                ) : null}
                                            </View>
                                            <View style={[styles.statusBadge, { backgroundColor: tone.bg }]}>
                                                <Text style={[styles.statusText, { color: tone.text }]}>{lead.status}</Text>
                                            </View>
                                        </View>
                                        <View style={screenStyles.metaRow}>
                                            {lead.scheduledTime ? (
                                                <View style={styles.metaItem}>
                                                    <Feather name="clock" size={12} color={colors.mutedForeground} />
                                                    <Text style={screenStyles.metaText}>{formatDateTimeShort(lead.scheduledTime)}</Text>
                                                </View>
                                            ) : null}
                                            {lead.createdAt ? (
                                                <Text style={screenStyles.metaText}>Submitted {formatDate(lead.createdAt)}</Text>
                                            ) : null}
                                        </View>
                                        <Text style={styles.hint}>{leadHint(lead.status)}</Text>
                                        {lead.status === "assigned" && lead.bookingId ? (
                                            <Pressable
                                                onPress={() => rootNav.navigate("BookingDetail", { bookingId: String(lead.bookingId) })}
                                                style={styles.bookingBtn}
                                            >
                                                <Text style={styles.bookingBtnText}>View in Bookings</Text>
                                                <Feather name="chevron-right" size={14} color={colors.white} />
                                            </Pressable>
                                        ) : null}
                                    </View>
                                </View>
                            );
                        })}
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

const styles = StyleSheet.create({
    statusBadge: { borderRadius: radius.x2, paddingHorizontal: 10, paddingVertical: 4, alignSelf: "flex-start" },
    statusText: { fontSize: 11, fontWeight: "700", textTransform: "capitalize" },
    metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
    hint: { fontSize: 12, color: colors.mutedForeground },
    bookingBtn: {
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: colors.primary,
        borderRadius: radius.md,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    bookingBtnText: { color: colors.white, fontSize: 12, fontWeight: "700" },
});
