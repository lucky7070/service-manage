import { useCallback, useState } from "react";
import { ActivityIndicator, Image, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { fetchServiceCategoriesHome, resolveUploadUrl, type HomeServiceCategory } from "../api";
import DetailHeader from "../components/ui/DetailHeader";
import EmptyState from "../components/ui/EmptyState";
import Screen from "../components/ui/Screen";
import { useRootNavigation } from "../helpers/common";
import { colors, radius, shadows, spacing } from "../theme/colors";
import { screenStyles } from "../theme/screenStyles";

function shortCategoryName(name: string) {
    return name
        .replace(/\s+Services?$/i, "")
        .replace(/\s+Service$/i, "")
        .trim();
}

export default function ServiceCategoriesScreen() {
    const navigation = useRootNavigation();
    const [categories, setCategories] = useState<HomeServiceCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        try {
            const response = await fetchServiceCategoriesHome(100);
            if (response.status && Array.isArray(response.data)) setCategories(response.data);
            else setCategories([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(useCallback(() => { void load(); }, [load]));

    const openCategory = (row: HomeServiceCategory) => {
        navigation.navigate("ServiceCategoryDetail", {
            categorySlug: row.slug,
            categoryName: row.name,
            categoryId: row._id,
        });
    };

    return (
        <View style={screenStyles.stackRoot}>
            <DetailHeader
                title="Service Categories"
                subtitle="Browse all services and open a request"
                onBack={() => navigation.goBack()}
            />
            <Screen
                safe={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor={colors.primary} />}
            >
                {loading ? (
                    <View style={screenStyles.loadingBox}><ActivityIndicator size="large" color={colors.primary} /></View>
                ) : categories.length === 0 ? (
                    <EmptyState icon="briefcase" title="No categories" message="Service categories will appear here once available." />
                ) : (
                    <View style={styles.categoryGrid}>
                        {categories.map((row) => {
                            const imageUri = resolveUploadUrl(row.image);
                            return (
                                <Pressable
                                    key={row._id}
                                    onPress={() => openCategory(row)}
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
                )}
            </Screen>
        </View>
    );
}

const styles = StyleSheet.create({
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
});
