import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Formik, FormikErrors } from "formik";
import * as Location from "expo-location";
import { useRoute, type RouteProp } from "@react-navigation/native";
import { createAddress, fetchAddresses, fetchCities, fetchStates, updateAddress, type AddressRow } from "../api";
import FormField from "../components/form/FormField";
import LocationCaptureCard from "../components/form/LocationCaptureCard";
import SearchableSelect, { type SearchOption } from "../components/form/SearchableSelect";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import DetailHeader from "../components/ui/DetailHeader";
import type { MainStackParamList } from "../api/types";
import { useRootNavigation } from "../helpers/common";
import { addressSchema } from "../validation/schemas";
import { colors, radius } from "../theme/colors";
import { screenStyles } from "../theme/screenStyles";

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

async function captureCurrentLocation(
    setFieldValue: (field: "latitude" | "longitude", value: string) => void,
    setLocating: (value: boolean) => void,
) {
    setLocating(true);
    try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
            Alert.alert(
                "Permission needed",
                "Enable location access in your device settings to pin your service location.",
            );
            return;
        }
        const position = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
        });
        void setFieldValue("latitude", String(position.coords.latitude));
        void setFieldValue("longitude", String(position.coords.longitude));
    } catch {
        Alert.alert(
            "Location unavailable",
            "Could not read your current location. Move outdoors, enable GPS, and try again.",
        );
    } finally {
        setLocating(false);
    }
}

export default function AddressFormScreen() {
    const navigation = useRootNavigation();
    const route = useRoute<RouteProp<MainStackParamList, "AddressForm">>();
    const addressId = route.params?.addressId;
    const isEdit = Boolean(addressId);

    const [loading, setLoading] = useState(isEdit);
    const [initialValues, setInitialValues] = useState<AddressFormValues>(emptyValues);
    const [selectedState, setSelectedState] = useState<SearchOption | null>(null);
    const [selectedCity, setSelectedCity] = useState<SearchOption | null>(null);
    const [locating, setLocating] = useState(false);

    const loadStates = useCallback(async (query: string) => {
        const response = await fetchStates(query);
        if (response.status && Array.isArray(response.data)) {
            return response.data.map((row) => ({ value: row.value, label: row.label }));
        }
        return [];
    }, []);

    const loadCities = useCallback(async (query: string) => {
        if (!selectedState?.value) return [];
        const response = await fetchCities(selectedState.value, query);
        if (response.status && Array.isArray(response.data)) {
            return response.data.map((row) => ({ value: row.value, label: row.label }));
        }
        return [];
    }, [selectedState?.value]);

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

    if (loading) {
        return (
            <View style={screenStyles.stackRoot}>
                <DetailHeader title={isEdit ? "Edit address" : "Add address"} onBack={() => navigation.goBack()} />
                <View style={screenStyles.loadingBox}><ActivityIndicator size="large" color={colors.primary} /></View>
            </View>
        );
    }

    return (
        <View style={screenStyles.stackRoot}>
            <DetailHeader title={isEdit ? "Edit address" : "Add address"} subtitle="Coordinates help your provider find the job location." onBack={() => navigation.goBack()} />
            <Formik
                initialValues={initialValues}
                enableReinitialize
                validationSchema={addressSchema}
                onSubmit={async (values, { setSubmitting, setErrors }) => {
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
                        const response = isEdit && addressId ? await updateAddress(addressId, payload) : await createAddress(payload);
                        if (response.status) {
                            Alert.alert("Saved", response.message || "Address saved.", [{ text: "OK", onPress: () => navigation.goBack() }]);
                        } else {
                            Alert.alert("Could not save", response.message || "Try again.");
                            setErrors(response.data as FormikErrors<AddressFormValues>);
                        }
                    } finally {
                        setSubmitting(false);
                    }
                }}
            >
                {({ values, errors, touched, submitCount, isSubmitting, setFieldValue, handleSubmit }) => (
                    <ScrollView contentContainerStyle={screenStyles.formContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                        <Card large elevated style={screenStyles.formCard}>
                            <FormField icon="map" name="addressLine1" label="Address line 1" required placeholder="House number, street" />
                            <FormField icon="map" name="addressLine2" label="Address line 2" required placeholder="Area, apartment" />
                            <FormField icon="map" name="landmark" label="Landmark" placeholder="Nearby landmark" />

                            <View style={[styles.selectWrap, styles.selectWrapState]}>
                                <SearchableSelect
                                    label="State"
                                    icon="map-pin"
                                    placeholder="Search state…"
                                    value={selectedState}
                                    onChange={(option) => {
                                        setSelectedState(option);
                                        setSelectedCity(null);
                                        void setFieldValue("state", option?.value || "");
                                        void setFieldValue("city", "");
                                    }}
                                    loadOptions={loadStates}
                                    error={(touched.state || submitCount > 0) && errors.state ? errors.state : undefined}
                                    required
                                />
                            </View>

                            <View style={styles.selectWrap}>
                                <SearchableSelect
                                    label="City"
                                    icon="map-pin"
                                    placeholder={selectedState ? "Search city…" : "Select state first"}
                                    value={selectedCity}
                                    disabled={!selectedState}
                                    onChange={(option) => {
                                        setSelectedCity(option);
                                        void setFieldValue("city", option?.value || "");
                                    }}
                                    loadOptions={loadCities}
                                    error={(touched.city || submitCount > 0) && errors.city ? errors.city : undefined}
                                    required
                                />
                            </View>

                            <FormField icon="navigation" name="pincode" label="Pincode" required keyboardType="number-pad" placeholder="Enter pincode" maxLength={6} />
                            <LocationCaptureCard
                                latitude={values.latitude}
                                longitude={values.longitude}
                                locating={locating}
                                onCapture={() => void captureCurrentLocation(setFieldValue, setLocating)}
                                error={
                                    submitCount > 0 && (errors.latitude || errors.longitude) ? errors.latitude || errors.longitude : undefined
                                }
                            />

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
    selectWrap: { zIndex: 1 },
    selectWrapState: { zIndex: 2 },
    groupLabel: { fontSize: 14, fontWeight: "600", color: colors.mutedForeground },
    typeRow: { flexDirection: "row", gap: 8 },
    typeChip: { flex: 1, borderRadius: radius.x2, borderWidth: 1, borderColor: colors.border, paddingVertical: 10, alignItems: "center", backgroundColor: colors.card },
    typeChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    typeText: { fontSize: 13, fontWeight: "700", color: colors.mutedForeground, textTransform: "capitalize" },
    typeTextActive: { color: colors.white },
    defaultRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
    checkboxActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    checkMark: { color: colors.white, fontSize: 14, fontWeight: "800" },
    defaultLabel: { fontSize: 14, fontWeight: "600", color: colors.foreground },
});
