import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { fetchLedger, type LedgerRow } from "../api";
import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import FilterChips from "../components/ui/FilterChips";
import IconBox from "../components/ui/IconBox";
import PageHero from "../components/ui/PageHero";
import Screen from "../components/ui/Screen";
import { formatDateTime } from "../helpers/date";
import { colors, radius, spacing } from "../theme/colors";

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
                            <Text style={styles.balanceValue}>₹{Number(user?.balance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</Text>
                        </View>
                    </View>
                }
            />

            <Card large elevated>
                <View style={styles.searchRow}>
                    <Feather name="search" size={16} color={colors.mutedForeground} />
                    <TextInput
                        value={query}
                        onChangeText={setQuery}
                        placeholder="Search voucher or particulars..."
                        placeholderTextColor={colors.mutedForeground}
                        style={styles.searchInput}
                        returnKeyType="search"
                    />
                </View>

                <FilterChips items={paymentTypes} value={paymentType} onChange={setPaymentType} />

                {loading ? (
                    <View style={styles.loadingBox}><ActivityIndicator color={colors.primary} /></View>
                ) : rows.length === 0 ? (
                    <EmptyState icon="credit-card" title="No ledger entries" message="Wallet activity will appear here once you receive credits or make payments." />
                ) : (
                    <View style={styles.list}>
                        {rows.map((row) => (
                            <View key={row._id} style={styles.rowCard}>
                                <View style={styles.rowIcon}>
                                    <Feather name="credit-card" size={18} color={colors.primary} />
                                </View>
                                <View style={styles.rowBody}>
                                    <View style={styles.rowTop}>
                                        <View style={styles.rowMain}>
                                            <Text style={styles.voucher}>{row.voucherNo || "—"}</Text>
                                            <Text style={styles.particulars} numberOfLines={2}>{row.particulars || "N/A"}</Text>
                                        </View>
                                        <Text style={[styles.amount, row.paymentType === 1 ? styles.credit : styles.debit]}>
                                            {row.paymentType === 1 ? "+" : "-"} ₹{Number(row.amount || 0).toFixed(2)}
                                        </Text>
                                    </View>
                                    {row.createdAt ? (
                                        <Text style={styles.date}>{formatDateTime(row.createdAt)}</Text>
                                    ) : null}
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {totalPages > 1 && !loading ? (
                    <View style={styles.pagination}>
                        <Pressable
                            disabled={pageNo <= 1}
                            onPress={() => void load(false, Math.max(pageNo - 1, 1))}
                            style={[styles.pageBtn, pageNo <= 1 && styles.pageBtnDisabled]}
                        >
                            <Text style={styles.pageBtnText}>Previous</Text>
                        </Pressable>
                        <Text style={styles.pageInfo}>Page {pageNo} of {totalPages}</Text>
                        <Pressable
                            disabled={pageNo >= totalPages}
                            onPress={() => void load(false, pageNo + 1)}
                            style={[styles.pageBtn, pageNo >= totalPages && styles.pageBtnDisabled]}
                        >
                            <Text style={styles.pageBtnText}>Next</Text>
                        </Pressable>
                    </View>
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
    searchRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.xl,
        backgroundColor: colors.background,
        paddingHorizontal: spacing.md,
        marginBottom: spacing.md,
    },
    searchInput: { flex: 1, paddingVertical: 12, fontSize: 14, color: colors.foreground },
    filters: { gap: 8, paddingBottom: spacing.lg },
    chip: {
        borderRadius: radius.xl,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.muted,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    chipText: { fontSize: 13, fontWeight: "600", color: colors.mutedForeground },
    chipTextActive: { color: colors.white },
    loadingBox: { paddingVertical: 40, alignItems: "center" },
    empty: { textAlign: "center", color: colors.mutedForeground, paddingVertical: 32 },
    list: { gap: 10 },
    rowCard: {
        flexDirection: "row",
        gap: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.xl,
        backgroundColor: colors.background,
        padding: spacing.md,
    },
    rowIcon: {
        width: 40,
        height: 40,
        borderRadius: radius.lg,
        backgroundColor: "rgba(240,116,26,0.1)",
        alignItems: "center",
        justifyContent: "center",
    },
    rowBody: { flex: 1, gap: 6 },
    rowTop: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
    rowMain: { flex: 1, gap: 2 },
    voucher: { fontSize: 14, fontWeight: "700", color: colors.foreground },
    particulars: { fontSize: 12, color: colors.mutedForeground, lineHeight: 18 },
    amount: { fontSize: 16, fontWeight: "800" },
    credit: { color: colors.emerald },
    debit: { color: colors.rose },
    date: { fontSize: 11, color: colors.mutedForeground },
    pagination: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: spacing.lg,
        gap: 8,
    },
    pageBtn: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.lg,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: colors.card,
    },
    pageBtnDisabled: { opacity: 0.45 },
    pageBtnText: { fontSize: 13, fontWeight: "600", color: colors.foreground },
    pageInfo: { fontSize: 12, color: colors.mutedForeground },
});
