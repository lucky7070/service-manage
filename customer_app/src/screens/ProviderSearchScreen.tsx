import { useCallback, useState } from "react";
import { ActivityIndicator, Image, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRoute, type RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { fetchServiceProviders, resolveUploadUrl, type ProviderListRow } from "../api";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import DetailHeader from "../components/ui/DetailHeader";
import EmptyState from "../components/ui/EmptyState";
import PaginationBar from "../components/ui/PaginationBar";
import Screen from "../components/ui/Screen";
import SearchField from "../components/ui/SearchField";
import type { MainStackParamList } from "../api/types";
import { useRootNavigation } from "../helpers/common";
import { colors, radius, spacing } from "../theme/colors";
import { screenStyles } from "../theme/screenStyles";

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
        <View style={screenStyles.stackRoot}>
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
                    <SearchField
                        value={query}
                        onChangeText={setQuery}
                        onSubmitEditing={onSearch}
                        placeholder="Search by provider name…"
                        returnKeyType="search"
                        onGo={onSearch}
                        style={styles.searchField}
                    />
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
                    <View style={screenStyles.loadingBox}><ActivityIndicator size="large" color={colors.primary} /></View>
                ) : rows.length === 0 ? (
                    <EmptyState
                        icon="users"
                        title="No providers found"
                        message="Try another search or submit a service request and we will assign a professional."
                    />
                ) : (
                    <View style={screenStyles.list}>
                        {rows.map((row) => (
                            <View key={row._id} style={screenStyles.stripeRow}>
                                <View style={[screenStyles.stripe, { backgroundColor: colors.primary }]} />
                                <View style={screenStyles.stripeBody}>
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
            </Screen>
        </View>
    );
}

const styles = StyleSheet.create({
    searchCard: { gap: spacing.md, marginBottom: spacing.md },
    searchField: { marginBottom: 0 },
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
});
