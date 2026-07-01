import { useCallback, useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { Formik, FormikErrors } from "formik";
import * as Yup from "yup";
import { useRoute, type RouteProp } from "@react-navigation/native";
import { createBooking, fetchPublicProvider } from "../api";
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
import Badge from "../components/ui/Badge";

const schema = Yup.object({
    serviceTypeIds: Yup.array().of(Yup.string().required()).min(1, "Select at least one service."),
    scheduledTime: Yup.date().required("Scheduled date and time is required."),
    addressId: Yup.string().required("Service address is required."),
    issueDescription: Yup.string().max(5000).optional(),
});

type BookProviderFormValues = {
    serviceTypeIds: string[];
    scheduledTime: Date | null;
    addressId: string;
    issueDescription: string;
};

export default function BookProviderScreen() {
    const navigation = useRootNavigation();
    const route = useRoute<RouteProp<MainStackParamList, "BookProvider">>();
    const { providerId, providerSlug, providerName } = route.params;

    const [loadingMeta, setLoadingMeta] = useState(true);
    const [services, setServices] = useState<Array<{ id: string; name: string; description?: string | null; price?: number | null; estimatedTimeMinutes?: number | null }>>([]);

    const loadProvider = useCallback(async () => {
        setLoadingMeta(true);
        try {
            const response = await fetchPublicProvider(providerSlug || providerId);
            if (response.status && response.data) {
                setServices(
                    (response.data.providerServices || []).map((row) => ({
                        id: row.serviceTypeId,
                        name: row.name,
                        description: row.description,
                        price: row.price ?? row.basePrice,
                        estimatedTimeMinutes: row.estimatedTimeMinutes,
                    }))
                );
            }
        } finally {
            setLoadingMeta(false);
        }
    }, [providerId, providerSlug]);

    useEffect(() => { void loadProvider(); }, [loadProvider]);

    const title = providerName ? `Book ${providerName}` : "Confirm booking";

    return (
        <View style={screenStyles.stackRoot}>
            <DetailHeader title={title} subtitle="Select services, schedule, and address" onBack={() => navigation.goBack()} />
            <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                <ScrollView contentContainerStyle={screenStyles.formContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                    <Card large elevated>
                        <Formik<BookProviderFormValues>
                            initialValues={{
                                serviceTypeIds: [],
                                scheduledTime: null,
                                addressId: "",
                                issueDescription: "",
                            }}
                            validationSchema={schema}
                            onSubmit={async (values, { setSubmitting, setErrors }) => {
                                if (!values.scheduledTime) return;
                                const response = await createBooking({
                                    providerId,
                                    serviceTypeId: values.serviceTypeIds,
                                    addressId: values.addressId,
                                    scheduledTime: toApiDateTime(values.scheduledTime),
                                    issueDescription: values.issueDescription.trim() || undefined,
                                });
                                if (response.status && response.data && !Array.isArray(response.data) && response.data._id) {
                                    const bookingId = response.data._id;
                                    Alert.alert("Booking created", response.message || "Your booking was submitted.", [
                                        {
                                            text: "View booking",
                                            onPress: () => {
                                                navigation.reset({
                                                    index: 1,
                                                    routes: [
                                                        { name: "Main" },
                                                        { name: "BookingDetail", params: { bookingId } },
                                                    ],
                                                });
                                            },
                                        },
                                    ]);
                                } else {
                                    Alert.alert("Could not book", response.message || "Try again.");
                                    if (Array.isArray(response.data)) {
                                        setErrors(mapApiFieldErrors(response.data, { serviceTypeId: "serviceTypeIds" }));
                                    } else {
                                        setErrors(response.data as FormikErrors<BookProviderFormValues>);
                                    }
                                }
                                setSubmitting(false);
                            }}
                        >
                            {({ values, errors, touched, setFieldValue, handleSubmit, isSubmitting }) => {
                                const selectedRows = services.filter((row) => values.serviceTypeIds.includes(row.id));
                                const estimatedTotal = selectedRows.reduce((sum, row) => sum + Number(row.price || 0), 0);
                                const estimatedMinutes = selectedRows.reduce((sum, row) => sum + Number(row.estimatedTimeMinutes || 0), 0);

                                return (
                                    <View style={screenStyles.formCard}>
                                        <View style={styles.servicesHeader}>
                                            <Text style={screenStyles.sectionTitle}>Services</Text>
                                            <Badge>
                                                <Text style={styles.servicesHeaderCount}>{values.serviceTypeIds.length} selected</Text>
                                            </Badge>
                                        </View>
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
                                            emptyLabel={loadingMeta ? "Loading services…" : "No services configured for this provider."}
                                        />

                                        {selectedRows.length ? (
                                            <View style={styles.summary}>
                                                <Text style={styles.summaryText}>Estimated base: <Text style={styles.summaryBold}>₹{estimatedTotal.toLocaleString("en-IN")}</Text></Text>
                                                <Text style={styles.summaryText}>Estimated time: <Text style={styles.summaryBold}>{estimatedMinutes} min</Text></Text>
                                            </View>
                                        ) : null}

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

                                        <Button label="Confirm booking" onPress={() => handleSubmit()} loading={isSubmitting} fullWidth />
                                    </View>
                                );
                            }}
                        </Formik>
                    </Card>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    servicesHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    servicesHeaderTitle: { fontSize: 16, fontWeight: "600", color: colors.foreground },
    servicesHeaderCount: { fontSize: 12, color: colors.white, fontWeight: "600", letterSpacing: 0.2 },
    summary: {
        backgroundColor: colors.muted,
        borderRadius: radius.x2,
        padding: spacing.md,
        gap: 4,
    },
    summaryText: { fontSize: 13, color: colors.mutedForeground },
    summaryBold: { fontWeight: "800", color: colors.foreground },
});
