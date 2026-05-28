import { useCallback, useRef, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Formik, type FormikHelpers, type FormikProps } from "formik";
import { useFocusEffect } from "@react-navigation/native";
import * as Yup from "yup";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { fetchCitiesWithState, fetchServiceCategories } from "../../api";
import SearchableSelect, { type SearchOption } from "../form/SearchableSelect";
import { useRootNavigation } from "../../helpers/common";
import { colors, radius, shadows, spacing } from "../../theme/colors";

const schema = Yup.object({
    citySlug: Yup.string().required("City is required."),
    categorySlug: Yup.string().required("Service category is required."),
});

const popularServices: Array<{ name: string; icon: keyof typeof Feather.glyphMap }> = [
    { name: "Plumber", icon: "droplet" },
    { name: "Electrician", icon: "zap" },
    { name: "AC Repair", icon: "wind" },
    { name: "Cleaning", icon: "sun" },
    { name: "Carpenter", icon: "tool" },
];

type BookServiceSearchProps = {
    elevated?: boolean;
    embedded?: boolean;
};

type SearchFormValues = {
    citySlug: string;
    categorySlug: string;
};

export default function BookServiceSearch({ elevated = true, embedded = false }: BookServiceSearchProps) {
    const navigation = useRootNavigation();
    const formikRef = useRef<FormikProps<SearchFormValues>>(null);
    const [city, setCity] = useState<SearchOption | null>(null);
    const [category, setCategory] = useState<SearchOption | null>(null);
    const [pickingPopular, setPickingPopular] = useState<string | null>(null);

    useFocusEffect(
        useCallback(() => {
            formikRef.current?.setSubmitting(false);
        }, [])
    );

    const loadCities = useCallback(async (query: string) => {
        const response = await fetchCitiesWithState(query);
        if (response.status && Array.isArray(response.data)) {
            return response.data.map((row) => ({ value: row.value, label: row.label, slug: row.slug }));
        }
        return [];
    }, []);

    const loadCategories = useCallback(async (query: string) => {
        const response = await fetchServiceCategories(query);
        if (response.status && Array.isArray(response.data)) {
            return response.data.map((row) => ({ value: row.value, label: row.label, slug: row.slug }));
        }
        return [];
    }, []);

    const navigateToSearch = (values: SearchFormValues, { setSubmitting }: FormikHelpers<SearchFormValues>) => {
        if (!city?.slug || !category?.slug || !city.value || !category.value) {
            Alert.alert("Missing selection", "Please choose both city and service category.");
            setSubmitting(false);
            return;
        }

        navigation.navigate("ProviderSearch", {
            citySlug: values.citySlug,
            cityName: city.label,
            cityId: city.value,
            categorySlug: values.categorySlug,
            categoryName: category.label,
            categoryId: category.value,
        });
        setSubmitting(false);
    };

    return (
        <View style={[styles.card, elevated && styles.cardElevated, embedded && styles.cardEmbedded]}>
            <LinearGradient colors={["rgba(240,116,26,0.14)", "rgba(255,255,255,0)"]} style={styles.cardGlow} pointerEvents="none" />

            {!embedded ? (
                <View style={styles.cardHeader}>
                    <View style={styles.iconBadge}>
                        <Feather name="search" size={20} color={colors.primary} />
                    </View>
                    <View style={styles.cardHeaderText}>
                        <Text style={styles.cardTitle}>Book a verified professional</Text>
                        <Text style={styles.cardSubtitle}>Search by city and service — compare pros or request assignment.</Text>
                    </View>
                </View>
            ) : (
                <View style={styles.embeddedHeader}>
                    <LinearGradient colors={["#FF8C3A", colors.primary]} style={styles.embeddedIcon}>
                        <Feather name="search" size={18} color={colors.white} />
                    </LinearGradient>
                    <View style={styles.embeddedCopy}>
                        <Text style={styles.embeddedTitle}>Book a service</Text>
                        <Text style={styles.embeddedSub}>Pick your city and service</Text>
                    </View>
                </View>
            )}

            <View style={styles.stepsRow}>
                {["City", "Service", "Book"].map((step, index) => (
                    <View key={step} style={styles.stepItem}>
                        <View style={[styles.stepDot, index === 0 && styles.stepDotActive]}>
                            <Text style={styles.stepDotText}>{index + 1}</Text>
                        </View>
                        <Text style={styles.stepLabel}>{step}</Text>
                        {index < 2 ? <View style={styles.stepLine} /> : null}
                    </View>
                ))}
            </View>

            <Formik<SearchFormValues>
                innerRef={formikRef}
                initialValues={{ citySlug: "", categorySlug: "" }}
                validationSchema={schema}
                onSubmit={navigateToSearch}
            >
                {({ values, errors, touched, setFieldValue, handleSubmit, isSubmitting }) => (
                    <View style={styles.form}>
                        <View style={styles.fieldShell}>
                            <View style={styles.fieldBody}>
                                <SearchableSelect
                                    label="Your city"
                                    icon="map-pin"
                                    placeholder="Jaipur, Nagpur, Delhi…"
                                    value={city}
                                    onChange={(option) => {
                                        setCity(option);
                                        void setFieldValue("citySlug", option?.slug || "");
                                    }}
                                    loadOptions={loadCities}
                                    error={touched.citySlug && errors.citySlug ? errors.citySlug : undefined}
                                    required
                                />
                            </View>
                        </View>

                        <View style={styles.fieldShell}>
                            <View style={styles.fieldBody}>
                                <SearchableSelect
                                    label="Service needed"
                                    icon="briefcase"
                                    placeholder="Plumber, electrician, etc."
                                    value={category}
                                    onChange={(option) => {
                                        setCategory(option);
                                        void setFieldValue("categorySlug", option?.slug || "");
                                    }}
                                    loadOptions={loadCategories}
                                    error={touched.categorySlug && errors.categorySlug ? errors.categorySlug : undefined}
                                    required
                                />
                            </View>
                        </View>

                        <View style={styles.popularBlock}>
                            <Text style={styles.popularLabel}>Popular right now</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.popularRow}>
                                {popularServices.map(({ name, icon }) => {
                                    const active = category?.label?.toLowerCase().includes(name.toLowerCase());
                                    return (
                                        <Pressable
                                            key={name}
                                            disabled={pickingPopular === name}
                                            onPress={async () => {
                                                setPickingPopular(name);
                                                try {
                                                    const rows = await loadCategories(name);
                                                    const match = rows.find((row) =>
                                                        row.label.toLowerCase().includes(name.toLowerCase())
                                                    ) || rows[0];
                                                    if (match) {
                                                        setCategory(match);
                                                        void setFieldValue("categorySlug", match.slug || "");
                                                    }
                                                } finally {
                                                    setPickingPopular(null);
                                                }
                                            }}
                                            style={[styles.popularChip, active && styles.popularChipActive]}
                                        >
                                            <Feather name={icon} size={14} color={active ? colors.primary : colors.mutedForeground} />
                                            <Text style={[styles.popularChipText, active && styles.popularChipTextActive]}>{name}</Text>
                                        </Pressable>
                                    );
                                })}
                            </ScrollView>
                        </View>

                        <Pressable
                            disabled={!values.citySlug || !values.categorySlug || isSubmitting}
                            onPress={() => handleSubmit()}
                            style={({ pressed }) => [
                                styles.ctaWrap,
                                (!values.citySlug || !values.categorySlug || isSubmitting) && styles.ctaDisabled,
                                pressed && styles.ctaPressed,
                            ]}
                        >
                            <LinearGradient colors={["#FF8C3A", colors.primary, colors.primaryDark]} style={styles.ctaGradient}>
                                <Feather name="users" size={18} color={colors.white} />
                                <Text style={styles.ctaText}>{isSubmitting ? "Searching…" : "Find professionals"}</Text>
                                <Feather name="arrow-right" size={18} color={colors.white} />
                            </LinearGradient>
                        </Pressable>
                    </View>
                )}
            </Formik>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.card,
        borderRadius: radius.x3,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.lg,
        overflow: "hidden",
    },
    cardEmbedded: {
        borderColor: "rgba(240,116,26,0.2)",
        paddingTop: spacing.md,
    },
    cardElevated: {
        ...shadows.card,
        shadowOpacity: 0.14,
        shadowRadius: 20,
        elevation: 8,
    },
    cardGlow: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 100,
    },
    cardHeader: { flexDirection: "row", gap: spacing.md, marginBottom: spacing.md },
    embeddedHeader: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.md },
    embeddedIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
    },
    embeddedCopy: { flex: 1, gap: 2 },
    embeddedTitle: { fontSize: 18, fontWeight: "800", color: colors.foreground },
    embeddedSub: { fontSize: 13, color: colors.mutedForeground },
    iconBadge: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: "rgba(240,116,26,0.12)",
        alignItems: "center",
        justifyContent: "center",
    },
    cardHeaderText: { flex: 1, gap: 4 },
    cardTitle: { fontSize: 20, fontWeight: "800", color: colors.foreground, lineHeight: 26 },
    cardSubtitle: { fontSize: 13, color: colors.mutedForeground, lineHeight: 19 },
    stepsRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: spacing.lg,
        backgroundColor: colors.muted,
        borderRadius: radius.x2,
        padding: spacing.sm,
    },
    stepItem: { flexDirection: "row", alignItems: "center", flex: 1 },
    stepDot: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: colors.border,
        alignItems: "center",
        justifyContent: "center",
    },
    stepDotActive: { backgroundColor: colors.primary },
    stepDotText: { color: colors.white, fontSize: 11, fontWeight: "800" },
    stepLabel: { marginLeft: 6, fontSize: 11, fontWeight: "700", color: colors.mutedForeground },
    stepLine: { flex: 1, height: 1, backgroundColor: colors.border, marginHorizontal: 6 },
    form: { gap: spacing.lg },
    fieldShell: { flexDirection: "row", gap: spacing.sm, alignItems: "flex-start" },
    fieldIcon: { marginTop: 28 },
    fieldBody: { flex: 1 },
    popularBlock: { gap: spacing.sm },
    popularLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 0.6, color: colors.mutedForeground, textTransform: "uppercase" },
    popularRow: { gap: 8, paddingRight: spacing.sm },
    popularChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        borderRadius: radius.x2,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.muted,
        paddingHorizontal: 12,
        paddingVertical: 9,
    },
    popularChipActive: {
        backgroundColor: "rgba(240,116,26,0.12)",
        borderColor: "rgba(240,116,26,0.35)",
    },
    popularChipText: { fontSize: 12, fontWeight: "700", color: colors.foreground },
    popularChipTextActive: { color: colors.primary },
    ctaWrap: { borderRadius: radius.x2, overflow: "hidden", ...shadows.primaryButton },
    ctaDisabled: { opacity: 0.55 },
    ctaPressed: { opacity: 0.92 },
    ctaGradient: {
        minHeight: 54,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        paddingHorizontal: spacing.lg,
    },
    ctaText: { color: colors.white, fontSize: 16, fontWeight: "800" },
});
