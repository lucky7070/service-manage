import { useState } from "react";
import { Alert, Linking, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { Formik } from "formik";
import { Feather } from "@expo/vector-icons";
import { submitContactEnquiry } from "../api";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import ContactDetailsCard from "../components/cms/ContactDetailsCard";
import FormField from "../components/form/FormField";
import FormTextareaField from "../components/form/FormTextareaField";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import PageHero from "../components/ui/PageHero";
import Screen from "../components/ui/Screen";
import { mapApiFieldErrors } from "../helpers/common";
import { contactEnquirySchema } from "../validation/schemas";
import { colors, radius, spacing } from "../theme/colors";
import { screenStyles } from "../theme/screenStyles";

type ContactFormValues = {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
};

type ContactMethod = {
    icon: keyof typeof Feather.glyphMap;
    title: string;
    description: string;
    value?: string;
    action?: () => void;
};

export default function ContactUsScreen() {
    const { user } = useAuth();
    const { settings } = useSettings();

    const contactMethods: ContactMethod[] = [
        {
            icon: "phone",
            title: "Phone support",
            description: "Talk to our support team",
            value: settings.phone || "Not available",
            action: settings.phone ? () => void Linking.openURL(`tel:${settings.phone}`) : undefined,
        },
        {
            icon: "mail",
            title: "Email us",
            description: "We respond within 24 hours",
            value: settings.email || "Not available",
            action: settings.email ? () => void Linking.openURL(`mailto:${settings.email}`) : undefined,
        },
        {
            icon: "map-pin",
            title: "Office",
            description: "Visit us for assistance",
            value: settings.address || "Not available",
        },
    ];

    return (
        <Screen safe={false}>
            <PageHero
                eyebrow="Support"
                title="Contact us"
                subtitle="Have questions or feedback? Our team is here to help you."
            />
            <View style={styles.methods}>
                {contactMethods.map((method) => (
                    <Pressable
                        key={method.title}
                        onPress={method.action}
                        disabled={!method.action}
                        style={({ pressed }) => [styles.methodCard, method.action && pressed && styles.methodCardPressed]}
                    >
                        <View style={styles.methodIcon}>
                            <Feather name={method.icon} size={20} color={colors.primary} />
                        </View>
                        <Text style={styles.methodTitle}>{method.title}</Text>
                        <Text style={styles.methodDesc}>{method.description}</Text>
                        <Text style={styles.methodValue}>{method.value}</Text>
                    </Pressable>
                ))}
            </View>
            <Card large elevated style={styles.formCard}>
                <Text style={styles.formTitle}>Send us a message</Text>
                <Text style={styles.formSub}>Fill in the form and we will get back to you as soon as possible.</Text>
                <Formik<ContactFormValues>
                    enableReinitialize
                    initialValues={{
                        name: user.name || "",
                        email: user.email || "",
                        phone: user.mobile || "",
                        subject: "",
                        message: "",
                    }}
                    validationSchema={contactEnquirySchema}
                    onSubmit={async (values, { setSubmitting, setErrors, resetForm }) => {
                        const response = await submitContactEnquiry({
                            name: values.name.trim(),
                            email: values.email.trim(),
                            phone: values.phone.trim() || undefined,
                            subject: values.subject.trim(),
                            message: values.message.trim(),
                        });
                        if (response.status) {
                            Alert.alert("Message sent", response.message || "Thanks — we received your message.");
                            resetForm({
                                values: {
                                    name: user.name || "",
                                    email: user.email || "",
                                    phone: user.mobile || "",
                                    subject: "",
                                    message: "",
                                },
                            });
                        } else {
                            Alert.alert("Could not send", response.message || "Try again.");
                            if (Array.isArray(response.data)) {
                                setErrors(mapApiFieldErrors(response.data));
                            }
                        }
                        setSubmitting(false);
                    }}
                >
                    {({ handleSubmit, isSubmitting }) => (
                        <View style={screenStyles.formCard}>
                            <FormField name="name" label="Full name" required placeholder="Your name" />
                            <FormField name="email" label="Email" required keyboardType="email-address" autoCapitalize="none" placeholder="your@email.com" />
                            <FormField name="phone" label="Phone" keyboardType="phone-pad" placeholder="10-digit mobile" maxLength={10} />
                            <FormField name="subject" label="Subject" required placeholder="How can we help?" />
                            <FormTextareaField name="message" label="Message" placeholder="Tell us more about your inquiry…" />
                            <Button
                                label={isSubmitting ? "Sending…" : "Send message"}
                                onPress={() => handleSubmit()}
                                loading={isSubmitting}
                                fullWidth
                            />
                        </View>
                    )}
                </Formik>
            </Card>
            <ContactDetailsCard />
        </Screen>
    );
}

const styles = StyleSheet.create({
    methods: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    methodCard: {
        width: "48%",
        flexGrow: 1,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.x2,
        backgroundColor: colors.card,
        padding: spacing.md,
        alignItems: "center",
        gap: 4,
    },
    methodCardPressed: {
        opacity: 0.85,
    },
    methodIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(240,116,26,0.1)",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: spacing.sm,
    },
    methodTitle: { fontSize: 14, fontWeight: "800", color: colors.foreground, textAlign: "center" },
    methodDesc: { fontSize: 11, color: colors.mutedForeground, textAlign: "center" },
    methodValue: { fontSize: 13, fontWeight: "700", color: colors.primary, textAlign: "center", marginTop: 4 },
    formCard: { marginBottom: spacing.lg, gap: spacing.sm },
    formTitle: { fontSize: 18, fontWeight: "800", color: colors.foreground },
    formSub: { fontSize: 13, color: colors.mutedForeground, lineHeight: 20, marginBottom: spacing.sm },
});


