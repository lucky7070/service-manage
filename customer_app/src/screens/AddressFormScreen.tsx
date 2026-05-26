import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Formik } from "formik";
import { useRoute, type RouteProp } from "@react-navigation/native";
import { createAddress, fetchAddresses, fetchCities, fetchStates, updateAddress, type AddressRow, type SelectOption } from "../api";
import FormField from "../components/form/FormField";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import DetailHeader from "../components/ui/DetailHeader";
import Input from "../components/ui/Input";
import type { MainStackParamList } from "../api/types";
import { useRootNavigation } from "../helpers/common";
import { addressSchema } from "../validation/schemas";
import { colors, radius, spacing } from "../theme/colors";

const locationTypes = ["home", "office", "other"] as const;

type AddressFormValues = {
    addressLine1: string;
    addressLine2: string;
    landmark: string;
    state: string;
    city: string;
    pincode: string;
    latitude: string;
    longitude: string;
    locationType: (typeof locationTypes)[number];
    isDefault: boolean;
};

const emptyValues: AddressFormValues = {
    addressLine1: "",
    addressLine2: "",
    landmark: "",
    state: "",
    city: "",
    pincode: "",
    latitude: "",
    longitude: "",
    locationType: "home",
    isDefault: false,
};

export default function AddressFormScreen() {
    const navigation = useRootNavigation();
    const route = useRoute<RouteProp<MainStackParamList, "AddressForm">>();
    const addressId = route.params?.addressId;
    const isEdit = Boolean(addressId);

    const [loading, setLoading] = useState(isEdit);
    const [initialValues, setInitialValues] = useState<AddressFormValues>(emptyValues);

    const [stateQuery, setStateQuery] = useState("");
    const [cityQuery, setCityQuery] = useState("");
    const [stateOptions, setStateOptions] = useState<SelectOption[]>([]);
    const [cityOptions, setCityOptions] = useState<SelectOption[]>([]);
    const [selectedState, setSelectedState] = useState<SelectOption | null>(null);
    const [selectedCity, setSelectedCity] = useState<SelectOption | null>(null);

    useEffect(() => {
        if (!isEdit || !addressId) return;
        void (async () => {
            const response = await fetchAddresses();
            if (response.status && Array.isArray(response.data)) {
                const row = response.data.find((a: AddressRow) => a._id === addressId);
                if (row) {
                    setInitialValues({
                        addressLine1: row.addressLine1 || "",
                        addressLine2: row.addressLine2 || "",
                        landmark: row.landmark || "",
                        state: row.state || "",
                        city: row.city || "",
                        pincode: row.pincode || "",
                        latitude: row.latitude != null ? String(row.latitude) : "",
                        longitude: row.longitude != null ? String(row.longitude) : "",
                        locationType: row.locationType || "home",
                        isDefault: Boolean(row.isDefault),
                    });
                    if (row.state) setSelectedState({ value: row.state, label: row.stateName || "State" });
                    if (row.city) setSelectedCity({ value: row.city, label: row.cityName || "City" });
                }
            }
            setLoading(false);
        })();
    }, [addressId, isEdit]);

    useEffect(() => {
        const timer = setTimeout(() => {
            void fetchStates(stateQuery).then((res) => {
                if (res.status && Array.isArray(res.data)) setStateOptions(res.data);
            });
        }, 250);
        return () => clearTimeout(timer);
    }, [stateQuery]);

    useEffect(() => {
        if (!selectedState?.value) {
            setCityOptions([]);
            return;
        }
        const timer = setTimeout(() => {
            void fetchCities(selectedState.value, cityQuery).then((res) => {
                if (res.status && Array.isArray(res.data)) setCityOptions(res.data);
            });
        }, 250);
        return () => clearTimeout(timer);
    }, [selectedState, cityQuery]);

    if (loading) {
        return (
            <View style={styles.root}>
                <DetailHeader title={isEdit ? "Edit address" : "Add address"} onBack={() => navigation.goBack()} />
                <View style={styles.loader}><ActivityIndicator size="large" color={colors.primary} /></View>
            </View>
        );
    }

    return (
        <View style={styles.root}>
            <DetailHeader title={isEdit ? "Edit address" : "Add address"} subtitle="Coordinates help your provider find the job location." onBack={() => navigation.goBack()} />
            <Formik
                initialValues={initialValues}
                enableReinitialize
                validationSchema={addressSchema}
                onSubmit={async (values, { setSubmitting }) => {
                    try {
                        const payload = {
                            addressLine1: values.addressLine1.trim(),
                            addressLine2: values.addressLine2.trim(),
                            landmark: values.landmark.trim(),
                            state: values.state,
                            city: values.city,
                            pincode: values.pincode.trim(),
                            latitude: Number(values.latitude),
                            longitude: Number(values.longitude),
                            locationType: values.locationType,
                            isDefault: values.isDefault,
                        };
                        const response = isEdit && addressId
                            ? await updateAddress(addressId, payload)
                            : await createAddress(payload);
                        if (response.status) {
                            Alert.alert("Saved", response.message || "Address saved.", [{ text: "OK", onPress: () => navigation.goBack() }]);
                        } else {
                            Alert.alert("Could not save", response.message || "Try again.");
                        }
                    } finally {
                        setSubmitting(false);
                    }
                }}
            >
                {({ values, errors, touched, submitCount, isSubmitting, setFieldValue, handleSubmit }) => (
                    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                        <Card large elevated style={styles.form}>
                            <FormField name="addressLine1" label="Address line 1" required placeholder="House number, street" />
                            <FormField name="addressLine2" label="Address line 2" required placeholder="Area, apartment" />
                            <FormField name="landmark" label="Landmark" placeholder="Nearby landmark" />

                            <Input
                                label="Search state"
                                required
                                value={selectedState ? selectedState.label : stateQuery}
                                onChangeText={(v) => {
                                    setStateQuery(v);
                                    setSelectedState(null);
                                    setSelectedCity(null);
                                    setCityQuery("");
                                    void setFieldValue("state", "");
                                    void setFieldValue("city", "");
                                }}
                                placeholder="Type to search state"
                                error={(touched.state || submitCount > 0) && errors.state ? errors.state : undefined}
                            />
                            {!selectedState && stateOptions.length ? (
                                <View style={styles.optionList}>
                                    {stateOptions.slice(0, 6).map((opt) => (
                                        <Pressable
                                            key={opt.value}
                                            onPress={() => {
                                                setSelectedState(opt);
                                                setStateQuery("");
                                                setSelectedCity(null);
                                                void setFieldValue("state", opt.value);
                                                void setFieldValue("city", "");
                                            }}
                                            style={styles.option}
                                        >
                                            <Text style={styles.optionText}>{opt.label}</Text>
                                        </Pressable>
                                    ))}
                                </View>
                            ) : null}

                            <Input
                                label="Search city"
                                required
                                value={selectedCity ? selectedCity.label : cityQuery}
                                onChangeText={setCityQuery}
                                placeholder={selectedState ? "Type to search city" : "Select state first"}
                                editable={Boolean(selectedState)}
                                error={(touched.city || submitCount > 0) && errors.city ? errors.city : undefined}
                            />
                            {selectedState && !selectedCity && cityOptions.length ? (
                                <View style={styles.optionList}>
                                    {cityOptions.slice(0, 6).map((opt) => (
                                        <Pressable
                                            key={opt.value}
                                            onPress={() => {
                                                setSelectedCity(opt);
                                                setCityQuery("");
                                                void setFieldValue("city", opt.value);
                                            }}
                                            style={styles.option}
                                        >
                                            <Text style={styles.optionText}>{opt.label}</Text>
                                        </Pressable>
                                    ))}
                                </View>
                            ) : null}

                            <FormField name="pincode" label="Pincode" required keyboardType="number-pad" maxLength={6} />
                            <View style={styles.row}>
                                <View style={styles.half}>
                                    <FormField name="latitude" label="Latitude" required keyboardType="decimal-pad" placeholder="26.9124" />
                                </View>
                                <View style={styles.half}>
                                    <FormField name="longitude" label="Longitude" required keyboardType="decimal-pad" placeholder="75.7873" />
                                </View>
                            </View>

                            <Text style={styles.groupLabel}>Location type</Text>
                            <View style={styles.typeRow}>
                                {locationTypes.map((type) => (
                                    <Pressable
                                        key={type}
                                        onPress={() => void setFieldValue("locationType", type)}
                                        style={[styles.typeChip, values.locationType === type && styles.typeChipActive]}
                                    >
                                        <Text style={[styles.typeText, values.locationType === type && styles.typeTextActive]}>{type}</Text>
                                    </Pressable>
                                ))}
                            </View>

                            <Pressable onPress={() => void setFieldValue("isDefault", !values.isDefault)} style={styles.defaultRow}>
                                <View style={[styles.checkbox, values.isDefault && styles.checkboxActive]}>
                                    {values.isDefault ? <Text style={styles.checkMark}>✓</Text> : null}
                                </View>
                                <Text style={styles.defaultLabel}>Set as default address</Text>
                            </Pressable>

                            <Button label={isSubmitting ? "Saving…" : "Save address"} onPress={() => handleSubmit()} loading={isSubmitting} fullWidth />
                        </Card>
                    </ScrollView>
                )}
            </Formik>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.muted },
    loader: { flex: 1, alignItems: "center", justifyContent: "center" },
    content: { padding: spacing.lg, paddingBottom: spacing.x2 },
    form: { gap: spacing.lg },
    optionList: { gap: 6, marginTop: -4 },
    option: { backgroundColor: colors.muted, borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: 10 },
    optionText: { fontSize: 14, color: colors.foreground },
    row: { flexDirection: "row", gap: spacing.sm },
    half: { flex: 1 },
    groupLabel: { fontSize: 14, fontWeight: "600", color: colors.mutedForeground },
    typeRow: { flexDirection: "row", gap: 8 },
    typeChip: { flex: 1, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, paddingVertical: 10, alignItems: "center", backgroundColor: colors.card },
    typeChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    typeText: { fontSize: 13, fontWeight: "700", color: colors.mutedForeground, textTransform: "capitalize" },
    typeTextActive: { color: colors.white },
    defaultRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
    checkboxActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    checkMark: { color: colors.white, fontSize: 14, fontWeight: "800" },
    defaultLabel: { fontSize: 14, fontWeight: "600", color: colors.foreground },
});
