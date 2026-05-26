import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useFocusEffect, useRoute, type RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { fetchPublicProvider, resolveUploadUrl, type PublicProviderDetail } from "../api";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import DetailHeader from "../components/ui/DetailHeader";
import ImageGalleryModal from "../components/ui/ImageGalleryModal";
import type { MainStackParamList } from "../api/types";
import { useRootNavigation } from "../helpers/common";
import { colors, radius, spacing } from "../theme/colors";

const GRID_COLUMNS = 3;
const GRID_GAP = 5;
const CARD_PADDING = 24;

export default function ProviderDetailScreen() {
    const navigation = useRootNavigation();
    const route = useRoute<RouteProp<MainStackParamList, "ProviderDetail">>();
    const { providerSlug } = route.params;
    const { width: screenWidth } = useWindowDimensions();

    const [provider, setProvider] = useState<PublicProviderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [galleryOpen, setGalleryOpen] = useState(false);
    const [galleryIndex, setGalleryIndex] = useState(0);

    const load = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        try {
            const response = await fetchPublicProvider(providerSlug);
            if (response.status) setProvider(response.data);
            else {
                Alert.alert("Not found", response.message || "Provider not found.", [{ text: "OK", onPress: () => navigation.goBack() }]);
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [navigation, providerSlug]);

    useFocusEffect(useCallback(() => { void load(); }, [load]));

    const ratingLabel = provider?.averageRating != null && provider.averageRating !== "N/A"
        ? String(provider.averageRating)
        : "New";

    const photoUrls = useMemo(
        () => (provider?.photos || []).map((photo) => resolveUploadUrl(photo)),
        [provider?.photos]
    );

    const openGallery = (index: number) => {
        setGalleryIndex(index);
        setGalleryOpen(true);
    };

    const gridWidth = screenWidth - spacing.lg * 2 - CARD_PADDING * 2;
    const cellSize = (gridWidth - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;

    return (
        <View style={styles.root}>
            <DetailHeader title={provider?.name || "Provider"} subtitle={provider?.serviceCategoryName || "Professional profile"} onBack={() => navigation.goBack()} />
            {loading ? (
                <View style={styles.loader}><ActivityIndicator size="large" color={colors.primary} /></View>
            ) : provider ? (
                <ScrollView
                    contentContainerStyle={styles.content}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor={colors.primary} />}
                    showsVerticalScrollIndicator={false}
                >
                    <Card large elevated style={styles.hero}>
                        <View style={styles.heroTop}>
                            {provider.image ? (
                                <Image source={{ uri: resolveUploadUrl(provider.image) }} style={styles.avatar} />
                            ) : (
                                <View style={styles.avatarFallback}>
                                    <Text style={styles.avatarText}>{provider.name.charAt(0).toUpperCase()}</Text>
                                </View>
                            )}
                            <View style={styles.heroMeta}>
                                <Text style={styles.name}>{provider.name}</Text>
                                <Text style={styles.category}>{provider.serviceCategoryName}</Text>
                                <View style={styles.badge}>
                                    <Feather name="check-circle" size={14} color={colors.emerald} />
                                    <Text style={styles.badgeText}>Verified professional</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.stats}>
                            <View style={styles.stat}><Feather name="map-pin" size={14} color={colors.primary} /><Text style={styles.statText}>{provider.cityName || "—"}</Text></View>
                            <View style={styles.stat}><Feather name="briefcase" size={14} color={colors.primary} /><Text style={styles.statText}>{provider.experienceYears || 0} yrs</Text></View>
                            <View style={styles.stat}><Feather name="star" size={14} color={colors.amber} /><Text style={styles.statText}>{ratingLabel} ({provider.ratingCount || 0})</Text></View>
                            <View style={styles.stat}><Feather name="check" size={14} color={colors.emerald} /><Text style={styles.statText}>{provider.totalCompletedServices || 0} jobs</Text></View>
                        </View>
                        <Button
                            label="Book this professional"
                            onPress={() =>
                                navigation.navigate("BookProvider", {
                                    providerId: provider._id,
                                    providerSlug: provider.slug,
                                    providerName: provider.name,
                                })
                            }
                            fullWidth
                        />
                    </Card>

                    <Card large elevated style={styles.section}>
                        <View style={styles.galleryHeader}>
                            <Feather name="shield" size={18} color={colors.foreground} />
                            <Text style={styles.sectionTitle}>About</Text>
                        </View>
                        <Text style={styles.about}>
                            {provider.experienceDescription?.trim()
                                || `${provider.name} is a verified ${provider.serviceCategoryName || "service"} professional ready to help with your booking.`}
                        </Text>
                    </Card>

                    {provider.providerServices?.length ? (
                        <Card large elevated style={styles.section}>
                            <View style={styles.galleryHeader}>
                                <Feather name="layers" size={18} color={colors.foreground} />
                                <Text style={styles.sectionTitle}>Services offered</Text>
                            </View>
                            <View style={styles.serviceList}>
                                {provider.providerServices.map((service) => (
                                    <View key={service.serviceTypeId} style={styles.serviceRow}>
                                        <View style={styles.serviceMain}>
                                            <Text style={styles.serviceName}>{service.name}</Text>
                                            {service.description ? <Text style={styles.serviceDesc} numberOfLines={2}>{service.description}</Text> : null}
                                        </View>
                                        <Text style={styles.servicePrice}>₹{Number(service.price ?? service.basePrice ?? 0).toLocaleString("en-IN")}</Text>
                                    </View>
                                ))}
                            </View>
                        </Card>
                    ) : null}

                    {photoUrls.length ? (
                        <Card large elevated style={styles.section}>
                            <View style={styles.galleryHeader}>
                                <Feather name="grid" size={18} color={colors.foreground} />
                                <Text style={styles.sectionTitle}>Work photos</Text>
                                <Text style={styles.photoCount}>{photoUrls.length}</Text>
                            </View>
                            <View style={[styles.photoGrid, { width: gridWidth }]}>
                                {photoUrls.map((photo, index) => (
                                    <Pressable
                                        key={`${photo}-${index}`}
                                        onPress={() => openGallery(index)}
                                        style={({ pressed }) => [
                                            styles.photoCell,
                                            { width: cellSize, height: cellSize },
                                            pressed && styles.photoCellPressed,
                                        ]}
                                    >
                                        <Image source={{ uri: photo }} style={styles.photoImage} />
                                    </Pressable>
                                ))}
                            </View>
                        </Card>
                    ) : null}
                </ScrollView>
            ) : null}

            <ImageGalleryModal
                visible={galleryOpen}
                images={photoUrls}
                initialIndex={galleryIndex}
                onClose={() => setGalleryOpen(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.muted },
    loader: { flex: 1, alignItems: "center", justifyContent: "center" },
    content: { padding: spacing.lg, paddingBottom: spacing.x2, gap: spacing.md },
    hero: { gap: spacing.md },
    heroTop: { flexDirection: "row", gap: spacing.md },
    avatar: { width: 88, height: 88, borderRadius: 44 },
    avatarFallback: { width: 88, height: 88, borderRadius: 44, backgroundColor: colors.muted, alignItems: "center", justifyContent: "center" },
    avatarText: { fontSize: 32, fontWeight: "800", color: colors.primary },
    heroMeta: { flex: 1, gap: 4 },
    name: { fontSize: 22, fontWeight: "800", color: colors.foreground },
    category: { fontSize: 14, color: colors.mutedForeground },
    badge: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
    badgeText: { fontSize: 12, fontWeight: "700", color: colors.emerald },
    stats: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
    stat: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: colors.muted, borderRadius: radius.xl, paddingHorizontal: 10, paddingVertical: 6 },
    statText: { fontSize: 12, fontWeight: "600", color: colors.foreground },
    section: { gap: spacing.md, },
    sectionTitle: { fontSize: 17, fontWeight: "800", color: colors.foreground },
    about: { fontSize: 14, color: colors.mutedForeground, lineHeight: 22 },
    serviceList: { gap: spacing.sm },
    serviceRow: { flexDirection: "row", gap: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, padding: spacing.md },
    serviceMain: { flex: 1, gap: 2 },
    serviceName: { fontSize: 14, fontWeight: "700", color: colors.foreground },
    serviceDesc: { fontSize: 12, color: colors.mutedForeground },
    servicePrice: { fontSize: 14, fontWeight: "800", color: colors.primary },
    galleryHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    photoCount: {
        marginLeft: "auto",
        fontSize: 13,
        fontWeight: "700",
        color: colors.mutedForeground,
    },
    photoGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: GRID_GAP,
    },
    photoCell: {
        overflow: "hidden",
        backgroundColor: colors.muted,
        borderRadius: radius.xl,
        borderWidth: 1,
        borderColor: colors.border,
    },
    photoCellPressed: { opacity: 0.85 },
    photoImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
});
