import { useCallback, useState } from "react";
import { ActivityIndicator, Image, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";
import { useFocusEffect, useRoute, type RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { fetchServiceProviders, resolveUploadUrl, type ProviderListRow } from "../api";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import DetailHeader from "../components/ui/DetailHeader";
import EmptyState from "../components/ui/EmptyState";
import Screen from "../components/ui/Screen";
import type { MainStackParamList } from "../api/types";
import { useRootNavigation } from "../helpers/common";
import { colors, radius, spacing } from "../theme/colors";

function providerRating(row: ProviderListRow) {
    const count = Number(row.ratingCount || 0);
    if (!count) return "New";
    const avg = Number(row.totalRating || 0) / count;
    return `${avg.toFixed(1)} (${count})`;
}

export default function ProviderSearchScreen() {
    const navigation = useRootNavigation();
    const route = useRoute<RouteProp<MainStackParamList, "ProviderSearch">>();
    const { citySlug, cityName, cityId, categorySlug, categoryName, categoryId } = route.params;

    const [query, setQuery] = useState("");
    const [pageNo, setPageNo] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [rows, setRows] = useState<ProviderListRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async (isRefresh = false, page = pageNo, search = query) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        try {
            const response = await fetchServiceProviders(citySlug, categorySlug, { pageNo: page, limit: 12, query: search || undefined });
            if (response.status && response.data) {
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
    }, [categorySlug, citySlug, pageNo, query]);

    useFocusEffect(useCallback(() => { void load(false, 1); }, [citySlug, categorySlug]));

    const onSearch = () => void load(false, 1, query);

    return (
        <View style={styles.root}>
            <DetailHeader
                title={`${categoryName} in ${cityName}`}
                subtitle="Choose a professional or request assignment"
                onBack={() => navigation.goBack()}
            />
            <Screen
                safe={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true, pageNo)} tintColor={colors.primary} />}
            >
                <Card elevated style={styles.searchCard}>
                    <View style={styles.searchRow}>
                        <Feather name="search" size={16} color={colors.mutedForeground} />
                        <TextInput
                            value={query}
                            onChangeText={setQuery}
                            onSubmitEditing={onSearch}
                            placeholder="Search by provider name…"
                            placeholderTextColor={colors.mutedForeground}
                            style={styles.searchInput}
                            returnKeyType="search"
                        />
                        <Pressable onPress={onSearch} style={styles.searchBtn}>
                            <Text style={styles.searchBtnText}>Go</Text>
                        </Pressable>
                    </View>
                    <Button
                        label="Request without choosing a provider"
                        variant="outline"
                        onPress={() =>
                            navigation.navigate("ServiceLeadForm", { cityId, cityName, categoryId, categoryName, categorySlug, })
                        }
                        fullWidth
                    />
                </Card>

                {loading ? (
                    <View style={styles.loader}><ActivityIndicator size="large" color={colors.primary} /></View>
                ) : rows.length === 0 ? (
                    <EmptyState
                        icon="users"
                        title="No providers found"
                        message="Try another search or submit a service request and we will assign a professional."
                    />
                ) : (
                    <View style={styles.list}>
                        {rows.map((row) => (
                            <Card key={row._id} elevated style={styles.providerCard}>
                                <View style={styles.providerTop}>
                                    <View style={styles.avatarWrap}>
                                        {row.image ? (
                                            <Image source={{ uri: resolveUploadUrl(row.image) }} style={styles.avatar} />
                                        ) : (
                                            <View style={styles.avatarFallback}>
                                                <Text style={styles.avatarText}>{row.name.charAt(0).toUpperCase()}</Text>
                                            </View>
                                        )}
                                    </View>
                                    <View style={styles.providerMeta}>
                                        <Text style={styles.providerName}>{row.name}</Text>
                                        <Text style={styles.providerSub}>{categoryName}</Text>
                                        <View style={styles.metaRow}>
                                            <Feather name="briefcase" size={12} color={colors.mutedForeground} />
                                            <Text style={styles.metaText}>{row.experienceYears || 0} yrs exp</Text>
                                            <Feather name="star" size={12} color={colors.amber} />
                                            <Text style={styles.metaText}>{providerRating(row)}</Text>
                                        </View>
                                    </View>
                                </View>
                                <View style={styles.actions}>
                                    <Button
                                        label="View profile"
                                        variant="outline"
                                        onPress={() => navigation.navigate("ProviderDetail", { providerSlug: row.slug })}
                                        style={styles.actionBtn}
                                    />
                                    <Button
                                        label="Book now"
                                        onPress={() =>
                                            navigation.navigate("BookProvider", {
                                                providerId: row._id,
                                                providerSlug: row.slug,
                                                providerName: row.name,
                                            })
                                        }
                                        style={styles.actionBtn}
                                    />
                                </View>
                            </Card>
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
            </Screen>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.muted },
    searchCard: { gap: spacing.md, marginBottom: spacing.md },
    searchRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.x2,
        backgroundColor: colors.background,
        paddingHorizontal: spacing.md,
    },
    searchInput: { flex: 1, fontSize: 15, color: colors.foreground, paddingVertical: 12 },
    searchBtn: { backgroundColor: colors.primary, borderRadius: radius.lg, paddingHorizontal: 12, paddingVertical: 8 },
    searchBtnText: { color: colors.white, fontWeight: "700", fontSize: 13 },
    loader: { paddingVertical: 48, alignItems: "center" },
    list: { gap: spacing.md },
    providerCard: { gap: spacing.md },
    providerTop: { flexDirection: "row", gap: spacing.md },
    avatarWrap: { width: 56, height: 56, borderRadius: 28, overflow: "hidden" },
    avatar: { width: 56, height: 56 },
    avatarFallback: { width: 56, height: 56, backgroundColor: colors.muted, alignItems: "center", justifyContent: "center" },
    avatarText: { fontSize: 20, fontWeight: "800", color: colors.primary },
    providerMeta: { flex: 1, gap: 2 },
    providerName: { fontSize: 16, fontWeight: "800", color: colors.foreground },
    providerSub: { fontSize: 12, color: colors.mutedForeground },
    metaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4, flexWrap: "wrap" },
    metaText: { fontSize: 12, color: colors.mutedForeground, marginRight: 6 },
    actions: { flexDirection: "row", gap: spacing.sm },
    actionBtn: { flex: 1 },
    pagination: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: spacing.lg, gap: 8 },
    pageBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: colors.card },
    pageBtnDisabled: { opacity: 0.45 },
    pageBtnText: { fontSize: 13, fontWeight: "600", color: colors.foreground },
    pageInfo: { fontSize: 12, color: colors.mutedForeground },
});
