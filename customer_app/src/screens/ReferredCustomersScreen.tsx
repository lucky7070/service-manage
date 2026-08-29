import { useCallback, useState } from "react";
import { ActivityIndicator, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { fetchReferredCustomers, type ReferredCustomerRow } from "../api";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import IconBox from "../components/ui/IconBox";
import PageHero from "../components/ui/PageHero";
import PaginationBar from "../components/ui/PaginationBar";
import Screen from "../components/ui/Screen";
import SearchField from "../components/ui/SearchField";
import { formatDateTimeShort } from "../helpers/date";
import { colors, radius, spacing } from "../theme/colors";
import { screenStyles } from "../theme/screenStyles";

export default function ReferredCustomersScreen() {
    const [query, setQuery] = useState("");
    const [pageNo, setPageNo] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [rows, setRows] = useState<ReferredCustomerRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async (isRefresh = false, page = pageNo) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        try {
            const response = await fetchReferredCustomers({
                pageNo: page,
                limit: 10,
                query: query.trim() || undefined,
            });
            if (response.status) {
                setRows(response.data.record || []);
                setTotalPages(response.data.totalPages || 0);
                setTotalCount(response.data.count || 0);
                setPageNo(response.data.current_page || page);
            } else {
                setRows([]);
                setTotalPages(0);
                setTotalCount(0);
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [pageNo, query]);

    useFocusEffect(useCallback(() => { void load(false, 1); }, [query]));

    return (
        <Screen
            safe={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true, pageNo)} tintColor={colors.primary} />}
        >
            <PageHero
                eyebrow="Refer & Earn"
                title="Referred customers"
                subtitle="Customers who signed up using your referral code."
                eyebrowRight={`Total: ${totalCount}`}
            />

            <Card large elevated>
                <SearchField
                    value={query}
                    onChangeText={setQuery}
                    placeholder="Search by name or user ID..."
                    returnKeyType="search"
                    onSubmitEditing={() => void load(false, 1)}
                />

                {loading ? (
                    <View style={screenStyles.loadingBox}><ActivityIndicator color={colors.primary} /></View>
                ) : rows.length === 0 ? (
                    <EmptyState
                        icon="users"
                        title="No referred customers yet"
                        message="Share your referral code from Refer & Earn. When someone registers with it, they will appear here."
                    />
                ) : (
                    <View style={screenStyles.list}>
                        {rows.map((row) => (
                            <View key={row._id} style={screenStyles.stripeRow}>
                                <View style={[screenStyles.stripe, { backgroundColor: colors.primary }]} />
                                <View style={screenStyles.stripeBody}>
                                    <View style={screenStyles.rowTop}>
                                        <View style={screenStyles.rowMain}>
                                            <Text style={screenStyles.primaryNumber}>{row.name || "Customer"}</Text>
                                            <Text style={screenStyles.metaLine}>
                                                {row.userId ? `User ID: ${row.userId}` : "Registered via your referral"}
                                            </Text>
                                        </View>
                                        <View style={[styles.statusBadge, row.status === 1 ? styles.statusActive : styles.statusInactive]}>
                                            <Text style={[styles.statusText, row.status === 1 ? styles.statusTextActive : styles.statusTextInactive]}>
                                                {row.status === 1 ? "Active" : "Inactive"}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={screenStyles.metaRow}>
                                        <Feather name="calendar" size={13} color={colors.mutedForeground} />
                                        <Text style={screenStyles.metaText}>Joined {formatDateTimeShort(row.createdAt)}</Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                <PaginationBar
                    pageNo={pageNo}
                    totalPages={totalPages}
                    onPrevious={() => void load(false, Math.max(pageNo - 1, 1))}
                    onNext={() => void load(false, Math.min(pageNo + 1, totalPages))}
                />
            </Card>
        </Screen>
    );
}

const styles = StyleSheet.create({
    summaryPill: {
        marginTop: spacing.lg,
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        alignSelf: "flex-start",
        backgroundColor: "rgba(255,255,255,0.16)",
        borderRadius: radius.x2,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.18)",
    },
    summaryLabel: {
        color: "rgba(255,255,255,0.82)",
        fontSize: 11,
        fontWeight: "700",
        textTransform: "uppercase",
    },
    summaryValue: {
        color: colors.white,
        fontSize: 20,
        fontWeight: "800",
        marginTop: 2,
    },
    statusBadge: {
        borderRadius: radius.xl,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    statusActive: {
        backgroundColor: "rgba(16,185,129,0.12)",
    },
    statusInactive: {
        backgroundColor: colors.muted,
    },
    statusText: {
        fontSize: 11,
        fontWeight: "700",
        textTransform: "capitalize",
    },
    statusTextActive: {
        color: colors.emerald,
    },
    statusTextInactive: {
        color: colors.mutedForeground,
    },
});
