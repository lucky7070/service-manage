import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { Formik, FormikErrors } from "formik";
import * as Yup from "yup";
import { useRoute, type RouteProp } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import { createServiceLead, fetchServiceTypesByCategory, type AddressRow } from "../api";
import AddressPicker from "../components/form/AddressPicker";
import DateTimeField from "../components/form/DateTimeField";
import ServiceTypePicker from "../components/form/ServiceTypePicker";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import DetailHeader from "../components/ui/DetailHeader";
import Textarea from "../components/ui/Textarea";
import { mapApiFieldErrors } from "../helpers/common";
import { toApiDateTime } from "../helpers/date";
import type { MainStackParamList } from "../api/types";
import { useRootNavigation } from "../helpers/common";
import { colors, radius, spacing } from "../theme/colors";
import { screenStyles } from "../theme/screenStyles";

const schema = Yup.object({
    serviceTypeIds: Yup.array().of(Yup.string().required()).min(1, "Select at least one service / issue type."),
    scheduledTime: Yup.date().required("Scheduled date and time is required."),
    addressId: Yup.string().required("Service address is required."),
    issueDescription: Yup.string().max(5000).optional(),
});

type ServiceLeadFormValues = {
    serviceTypeIds: string[];
    scheduledTime: Date | null;
    addressId: string;
    issueDescription: string;
};

export default function ServiceLeadFormScreen() {
    const navigation = useRootNavigation();
    const route = useRoute<RouteProp<MainStackParamList, "ServiceLeadForm">>();
    const { cityId: routeCityId, cityName, categoryId, categoryName, categorySlug, preselectedServiceTypeIds = [] } = route.params;

    const [loadingMeta, setLoadingMeta] = useState(true);
    const [services, setServices] = useState<Array<{ id: string; name: string; description?: string | null; price?: number | null; estimatedTimeMinutes?: number | null }>>([]);
    const [addresses, setAddresses] = useState<AddressRow[]>([]);

    const initialServiceTypeIds = useMemo(() => preselectedServiceTypeIds.filter(Boolean), [preselectedServiceTypeIds]);
    const selectedServiceLabels = useMemo(() => {
        if (!initialServiceTypeIds.length) return [];
        return services.filter((row) => initialServiceTypeIds.includes(row.id));
    }, [services, initialServiceTypeIds]);

    useEffect(() => {
        void (async () => {
            setLoadingMeta(true);
            try {
                const response = await fetchServiceTypesByCategory(categorySlug);
                if (response.status && Array.isArray(response.data)) {
                    setServices(
                        response.data.map((row) => ({
                            id: row._id,
                            name: row.name,
                            description: row.description,
                            price: row.basePrice,
                            estimatedTimeMinutes: row.estimatedTimeMinutes,
                        }))
                    );
                }
            } finally {
                setLoadingMeta(false);
            }
        })();
    }, [categorySlug]);

    const subtitle = cityName ? `${cityName} · we will assign a professional` : "Confirm address and time — we will assign a professional";

    return (
        <View style={screenStyles.stackRoot}>
            <DetailHeader
                title={`Request — ${categoryName}`}
                subtitle={subtitle}
                onBack={() => navigation.goBack()}
            />
            <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                <ScrollView contentContainerStyle={screenStyles.formContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                    <Card large elevated>
                        <Formik<ServiceLeadFormValues>
                            enableReinitialize
                            initialValues={{
                                serviceTypeIds: initialServiceTypeIds,
                                scheduledTime: null,
                                addressId: "",
                                issueDescription: "",
                            }}
                            validationSchema={schema}
                            onSubmit={async (values, { setSubmitting, setErrors, resetForm }) => {
                                if (!values.scheduledTime) return;

                                const selectedAddress = addresses.find((row) => row._id === values.addressId);
                                const cityId = routeCityId || (selectedAddress?.city ? String(selectedAddress.city) : "");
                                if (!cityId) {
                                    Alert.alert(
                                        "Address required",
                                        "Please select an address with a city, or add one from Addresses."
                                    );
                                    setSubmitting(false);
                                    return;
                                }

                                const response = await createServiceLead({
                                    cityId,
                                    serviceCategoryId: categoryId,
                                    serviceTypeId: values.serviceTypeIds,
                                    addressId: values.addressId,
                                    scheduledTime: toApiDateTime(values.scheduledTime),
                                    issueDescription: values.issueDescription.trim() || undefined,
                                });
                                if (response.status) {
                                    resetForm();
                                    Alert.alert("Request submitted", response.message || "We will assign a professional and notify you.", [
                                        {
                                            text: "View requests",
                                            onPress: () =>
                                                navigation.reset({
                                                    index: 0,
                                                    routes: [{ name: "Main", params: { initialTab: "ServiceLeads" } }],
                                                }),
                                        },
                                    ]);
                                } else {
                                    Alert.alert("Could not submit", response.message || "Try again.");
                                    if (Array.isArray(response.data)) {
                                        setErrors(mapApiFieldErrors(response.data, { serviceTypeId: "serviceTypeIds" }));
                                    } else {
                                        setErrors(response.data as FormikErrors<ServiceLeadFormValues>);
                                    }
                                }

                                setSubmitting(false);
                            }}
                        >
                            {({ values, errors, touched, setFieldValue, handleSubmit, isSubmitting }) => (
                                <View style={screenStyles.formCard}>
                                    <Text style={screenStyles.intro}>
                                        Submit your job details. Our team will assign a verified {categoryName.toLowerCase()} professional
                                        {cityName ? ` in ${cityName}` : ""}.
                                    </Text>

                                    {selectedServiceLabels.length ? (
                                        <View style={styles.selectedBox}>
                                            <Text style={styles.selectedEyebrow}>
                                                Selected service{selectedServiceLabels.length > 1 ? "s" : ""}
                                            </Text>
                                            {selectedServiceLabels.map((row) => (
                                                <View key={row.id} style={styles.selectedRow}>
                                                    <Text style={styles.selectedName}>{row.name}</Text>
                                                    {row.price != null ? (
                                                        <Text style={styles.selectedPrice}>
                                                            ₹{Number(row.price).toLocaleString("en-IN")}
                                                        </Text>
                                                    ) : null}
                                                </View>
                                            ))}
                                        </View>
                                    ) : (
                                        <>
                                            <Text style={screenStyles.sectionTitle}>Issue type / services</Text>
                                            <ServiceTypePicker
                                                items={services}
                                                selectedIds={values.serviceTypeIds}
                                                onToggle={(id) => {
                                                    const next = values.serviceTypeIds.includes(id)
                                                        ? values.serviceTypeIds.filter((row) => row !== id)
                                                        : [...values.serviceTypeIds, id];
                                                    void setFieldValue("serviceTypeIds", next);
                                                }}
                                                error={touched.serviceTypeIds && errors.serviceTypeIds ? String(errors.serviceTypeIds) : undefined}
                                                emptyLabel={loadingMeta ? "Loading services…" : "No service types for this category."}
                                            />
                                        </>
                                    )}

                                    <DateTimeField
                                        label="Scheduled date & time"
                                        value={values.scheduledTime}
                                        onChange={(date) => void setFieldValue("scheduledTime", date)}
                                        error={touched.scheduledTime && errors.scheduledTime ? String(errors.scheduledTime) : undefined}
                                        minimumDate={new Date()}
                                    />

                                    <Text style={screenStyles.sectionTitle}>Service address</Text>
                                    <AddressPicker
                                        value={values.addressId}
                                        onChange={(addressId) => void setFieldValue("addressId", addressId)}
                                        onAddressesLoaded={setAddresses}
                                        error={touched.addressId && errors.addressId ? errors.addressId : undefined}
                                        onAddAddress={() => navigation.navigate("AddressForm", {})}
                                    />

                                    <Textarea
                                        label="Issue description (optional)"
                                        value={values.issueDescription}
                                        onChangeText={(text) => void setFieldValue("issueDescription", text)}
                                        placeholder="Describe the issue or special instructions…"
                                        error={touched.issueDescription && errors.issueDescription ? errors.issueDescription : undefined}
                                    />

                                    <Button label="Submit request" onPress={() => handleSubmit()} loading={isSubmitting} fullWidth />
                                </View>
                            )}
                        </Formik>
                    </Card>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    selectedBox: {
        borderWidth: 1,
        borderColor: "rgba(240,116,26,0.25)",
        backgroundColor: "rgba(240,116,26,0.08)",
        borderRadius: radius.x2,
        padding: spacing.md,
        gap: spacing.sm,
    },
    selectedEyebrow: {
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 0.5,
        textTransform: "uppercase",
        color: colors.primary,
    },
    selectedRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: spacing.sm,
    },
    selectedName: { flex: 1, fontSize: 14, fontWeight: "700", color: colors.foreground },
    selectedPrice: { fontSize: 13, fontWeight: "700", color: colors.primary },
});
