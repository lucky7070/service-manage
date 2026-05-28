import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { Formik, FormikErrors } from "formik";
import * as Yup from "yup";
import { useRoute, type RouteProp } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { createServiceLead, fetchServiceTypesByCategory } from "../api";
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
    const { cityId, cityName, categoryId, categoryName, categorySlug } = route.params;

    const [loadingMeta, setLoadingMeta] = useState(true);
    const [services, setServices] = useState<Array<{ id: string; name: string; description?: string | null; price?: number | null; estimatedTimeMinutes?: number | null }>>([]);

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

    return (
        <View style={screenStyles.stackRoot}>
            <DetailHeader
                title={`Request — ${categoryName}`}
                subtitle={`${cityName} · we will assign a professional`}
                onBack={() => navigation.goBack()}
            />
            <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                <ScrollView contentContainerStyle={screenStyles.formContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                    <Card large elevated>
                        <Formik<ServiceLeadFormValues>
                            initialValues={{
                                serviceTypeIds: [],
                                scheduledTime: null,
                                addressId: "",
                                issueDescription: "",
                            }}
                            validationSchema={schema}
                            onSubmit={async (values, { setSubmitting, setErrors, resetForm }) => {
                                if (!values.scheduledTime) return;
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
                                        Submit your job details. Our team will assign a verified {categoryName.toLowerCase()} professional in {cityName}.
                                    </Text>

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
});
