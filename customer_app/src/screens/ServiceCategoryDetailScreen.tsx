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
import { useFocusEffect, useRoute, type RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
    fetchServiceCategoryBySlug,
    resolveUploadUrl,
    type CategoryServiceType,
    type ServiceCategoryDetail,
} from "../api";
import Button from "../components/ui/Button";
import DetailHeader from "../components/ui/DetailHeader";
import EmptyState from "../components/ui/EmptyState";
import Screen from "../components/ui/Screen";
import type { MainStackParamList } from "../api/types";
import { useRootNavigation } from "../helpers/common";
import { colors, radius, shadows, spacing } from "../theme/colors";
import { screenStyles } from "../theme/screenStyles";

function formatPrice(value?: number | null) {
    if (value == null || Number.isNaN(Number(value))) return null;
    return `₹${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export default function ServiceCategoryDetailScreen() {
    const navigation = useRootNavigation();
    const insets = useSafeAreaInsets();
    const route = useRoute<RouteProp<MainStackParamList, "ServiceCategoryDetail">>();
    const { categorySlug, categoryName: paramName } = route.params;

    const [category, setCategory] = useState<ServiceCategoryDetail | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const serviceTypes = category?.serviceTypes || [];
    const selectedCount = selectedIds.length;

    const load = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        try {
            const response = await fetchServiceCategoryBySlug(categorySlug);
            if (response.status && response.data) {
                setCategory(response.data);
            } else {
                setCategory(null);
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [categorySlug]);

    useFocusEffect(useCallback(() => { void load(); }, [load]));

    const toggleType = (id: string) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((row) => row !== id) : [...prev, id]));
    };

    const clearSelection = () => setSelectedIds([]);

    const handleContinue = () => {
        if (!category || !selectedIds.length) return;
        navigation.navigate("ServiceLeadForm", {
            categoryId: category._id,
            categoryName: category.name,
            categorySlug: category.slug,
            preselectedServiceTypeIds: selectedIds,
        });
    };

    const title = category?.name || paramName || "Service";
    const description =
        (category?.description && String(category.description).trim()) ||
        "Select the services you need. We will assign a verified professional.";

    const headerImage = useMemo(() => resolveUploadUrl(category?.image), [category?.image]);

    return (
        <View style={screenStyles.stackRoot}>
            <DetailHeader title={title} subtitle="Choose services to request" onBack={() => navigation.goBack()} />
            <Screen
                safe={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor={colors.primary} />}
                contentContainerStyle={styles.screenContent}
            >
                {loading ? (
                    <View style={screenStyles.loadingBox}><ActivityIndicator size="large" color={colors.primary} /></View>
                ) : !category ? (
                    <EmptyState icon="briefcase" title="Category not found" message="This service category is unavailable." />
                ) : (
                    <>
                        <View style={styles.heroCard}>
                            <View style={styles.heroImageWrap}>
                                {headerImage ? (
                                    <Image source={{ uri: headerImage }} style={styles.heroImage} resizeMode="contain" />
                                ) : (
                                    <Feather name="briefcase" size={32} color={colors.primary} />
                                )}
                            </View>
                            <Text style={styles.heroTitle}>{category.name}</Text>
                            <Text style={styles.heroDesc}>{description}</Text>
                        </View>

                        <View style={styles.sectionHead}>
                            <View style={styles.sectionCopy}>
                                <Text style={styles.sectionTitle}>Choose a service</Text>
                                <Text style={styles.sectionSub}>Select one or more services, then continue.</Text>
                            </View>
                            {selectedCount ? (
                                <Text style={styles.selectedCount}>{selectedCount} selected</Text>
                            ) : null}
                        </View>

                        {!serviceTypes.length ? (
                            <EmptyState
                                icon="tool"
                                title="No services yet"
                                message="Services for this category will appear here soon."
                            />
                        ) : (
                            <View style={styles.list}>
                                {serviceTypes.map((type) => (
                                    <ServiceTypeCard
                                        key={type._id}
                                        type={type}
                                        selected={selectedIds.includes(type._id)}
                                        onPress={() => toggleType(type._id)}
                                    />
                                ))}
                            </View>
                        )}
                    </>
                )}
            </Screen>

            {!loading && category && serviceTypes.length ? (
                <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
                    <Text style={styles.footerHint}>
                        {selectedCount
                            ? `${selectedCount} service${selectedCount > 1 ? "s" : ""} selected`
                            : "Select at least one service to continue"}
                    </Text>
                    <View style={styles.footerActions}>
                        {selectedCount ? (
                            <Button label="Clear" variant="outline" onPress={clearSelection} style={styles.footerBtn} />
                        ) : null}
                        <Button
                            label="Continue"
                            onPress={handleContinue}
                            disabled={!selectedCount}
                            style={styles.footerBtnPrimary}
                        />
                    </View>
                </View>
            ) : null}
        </View>
    );
}

function ServiceTypeCard({
    type,
    selected,
    onPress,
}: {
    type: CategoryServiceType;
    selected: boolean;
    onPress: () => void;
}) {
    const thumb = resolveUploadUrl(type.image);
    const price = formatPrice(type.basePrice);

    return (
        <Pressable onPress={onPress} style={[styles.typeCard, selected && styles.typeCardSelected]}>
            <View style={styles.typeThumb}>
                {thumb ? (
                    <Image source={{ uri: thumb }} style={styles.typeImage} resizeMode="cover" />
                ) : (
                    <Feather name="tool" size={22} color={colors.primary} />
                )}
            </View>
            <View style={styles.typeBody}>
                <View style={styles.typeTop}>
                    <Text style={[styles.typeName, selected && styles.typeNameSelected]} numberOfLines={2}>
                        {type.name}
                    </Text>
                    <View style={[styles.check, selected && styles.checkSelected]}>
                        {selected ? <Feather name="check" size={12} color={colors.white} /> : null}
                    </View>
                </View>
                {type.description ? (
                    <Text style={styles.typeDesc} numberOfLines={2}>{type.description}</Text>
                ) : null}
                <View style={styles.typeMeta}>
                    {price ? <Text style={styles.typePrice}>From {price}</Text> : null}
                    {type.estimatedTimeMinutes != null ? (
                        <View style={styles.timeRow}>
                            <Feather name="clock" size={12} color={colors.mutedForeground} />
                            <Text style={styles.typeTime}>~{type.estimatedTimeMinutes} min</Text>
                        </View>
                    ) : null}
                </View>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    screenContent: { paddingBottom: 120 },
    heroCard: {
        backgroundColor: colors.card,
        borderRadius: radius.x2,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.lg,
        marginBottom: spacing.lg,
        gap: spacing.sm,
        ...shadows.card,
        shadowOpacity: 0.04,
    },
    heroImageWrap: {
        width: 72,
        height: 72,
        borderRadius: 18,
        backgroundColor: colors.muted,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        marginBottom: spacing.xs,
    },
    heroImage: { width: 64, height: 64 },
    heroTitle: { fontSize: 22, fontWeight: "800", color: colors.foreground },
    heroDesc: { fontSize: 14, color: colors.mutedForeground, lineHeight: 21 },
    sectionHead: {
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    sectionCopy: { flex: 1, gap: 2 },
    sectionTitle: { fontSize: 17, fontWeight: "800", color: colors.foreground },
    sectionSub: { fontSize: 13, color: colors.mutedForeground },
    selectedCount: { fontSize: 13, fontWeight: "700", color: colors.primary, marginBottom: 2 },
    list: { gap: spacing.sm },
    typeCard: {
        flexDirection: "row",
        gap: spacing.md,
        backgroundColor: colors.card,
        borderRadius: radius.x2,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.md,
        ...shadows.card,
        shadowOpacity: 0.04,
    },
    typeCardSelected: {
        borderColor: colors.primary,
    },
    typeThumb: {
        width: 56,
        height: 56,
        borderRadius: 14,
        backgroundColor: "rgba(240,116,26,0.1)",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    },
    typeImage: { width: 56, height: 56 },
    typeBody: { flex: 1, gap: 4 },
    typeTop: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
    typeName: { flex: 1, fontSize: 15, fontWeight: "700", color: colors.foreground },
    typeNameSelected: { color: colors.primary },
    check: {
        width: 20,
        height: 20,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.white,
        alignItems: "center",
        justifyContent: "center",
    },
    checkSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primary,
    },
    typeDesc: { fontSize: 12, color: colors.mutedForeground, lineHeight: 17 },
    typeMeta: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 10, marginTop: 2 },
    typePrice: { fontSize: 12, fontWeight: "700", color: colors.primary },
    timeRow: { flexDirection: "row", alignItems: "center", gap: 4 },
    typeTime: { fontSize: 12, color: colors.mutedForeground, fontWeight: "600" },
    footer: {
        borderTopWidth: 1,
        borderTopColor: "rgba(240,116,26,0.18)",
        backgroundColor: colors.card,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        gap: spacing.sm,
        ...shadows.card,
    },
    footerHint: { fontSize: 13, color: colors.mutedForeground },
    footerActions: { flexDirection: "row", gap: spacing.sm },
    footerBtn: { flex: 0, minWidth: 100 },
    footerBtnPrimary: { flex: 1 },
});
