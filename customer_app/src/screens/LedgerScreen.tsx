import { useCallback, useState } from "react";
import { ActivityIndicator, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { fetchLedger, type LedgerRow } from "../api";
import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import FilterChips from "../components/ui/FilterChips";
import IconBox from "../components/ui/IconBox";
import PageHero from "../components/ui/PageHero";
import PaginationBar from "../components/ui/PaginationBar";
import Screen from "../components/ui/Screen";
import SearchField from "../components/ui/SearchField";
import { formatDateTime } from "../helpers/date";
import { colors, radius, spacing } from "../theme/colors";
import { screenStyles } from "../theme/screenStyles";

const paymentTypes = [
    { value: "", label: "All entries" },
    { value: "1", label: "Credit" },
    { value: "2", label: "Debit" },
];

export default function LedgerScreen() {
    const { user } = useAuth();
    const [paymentType, setPaymentType] = useState("");
    const [query, setQuery] = useState("");
    const [rows, setRows] = useState<LedgerRow[]>([]);
    const [pageNo, setPageNo] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async (isRefresh = false, page = pageNo) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        try {
            const response = await fetchLedger({
                pageNo: page,
                limit: 10,
                paymentType: paymentType || undefined,
                query: query.trim() || undefined,
            });
            if (response.status) {
                setRows(response.data.record || []);
                setTotalPages(response.data.totalPages || 0);
                setPageNo(response.data.current_page || page);
            } else {
                setRows([]);
                setTotalPages(0);
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [pageNo, paymentType, query]);

    useFocusEffect(useCallback(() => { void load(false, 1); }, [paymentType, query]));

    return (
        <Screen safe={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true, pageNo)} tintColor={colors.primary} />}>
            <PageHero
                eyebrow="Wallet"
                title="My Ledger"
                subtitle="View wallet credits, debits, rewards, and referral bonuses."
                footer={
                    <View style={styles.balancePill}>
                        <IconBox name="credit-card" tone="amber" />
                        <View>
                            <Text style={styles.balanceLabel}>Current balance</Text>
                            <Text style={styles.balanceValue}>₹{Number(user.balance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</Text>
                        </View>
                    </View>
                }
            />

            <Card large elevated>
                <SearchField
                    value={query}
                    onChangeText={setQuery}
                    placeholder="Search voucher or particulars..."
                    returnKeyType="search"
                    onSubmitEditing={() => void load(false, 1)}
                />

                <FilterChips items={paymentTypes} value={paymentType} onChange={setPaymentType} />

                {loading ? (
                    <View style={screenStyles.loadingBox}><ActivityIndicator color={colors.primary} /></View>
                ) : rows.length === 0 ? (
                    <EmptyState icon="credit-card" title="No ledger entries" message="Wallet activity will appear here once you receive credits or make payments." />
                ) : (
                    <View style={screenStyles.list}>
                        {rows.map((row) => (
                            <View key={row._id} style={screenStyles.listRow}>
                                <View style={screenStyles.iconTile}>
                                    <Feather name="credit-card" size={18} color={colors.primary} />
                                </View>
                                <View style={{ flex: 1, gap: 6 }}>
                                    <View style={screenStyles.rowTop}>
                                        <View style={screenStyles.rowMain}>
                                            <Text style={styles.voucher}>{row.voucherNo || "—"}</Text>
                                            <Text style={screenStyles.metaLine} numberOfLines={2}>{row.particulars || "N/A"}</Text>
                                        </View>
                                        <Text style={[styles.amount, row.paymentType === 1 ? styles.credit : styles.debit]}>
                                            {row.paymentType === 1 ? "+" : "-"} ₹{Number(row.amount || 0).toFixed(2)}
                                        </Text>
                                    </View>
                                    {row.createdAt ? (
                                        <Text style={screenStyles.metaText}>{formatDateTime(row.createdAt)}</Text>
                                    ) : null}
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

const styles = StyleSheet.create({
    balancePill: {
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
    balanceLabel: { color: "rgba(255,255,255,0.82)", fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
    balanceValue: { color: colors.white, fontSize: 20, fontWeight: "800", marginTop: 2 },
    voucher: { fontSize: 14, fontWeight: "700", color: colors.foreground },
    amount: { fontSize: 16, fontWeight: "800" },
    credit: { color: colors.emerald },
    debit: { color: colors.rose },
});
