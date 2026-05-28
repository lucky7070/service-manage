import { useState, useCallback } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Formik, FormikErrors } from "formik";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { sendOtp } from "../../api";
import { useAuth } from "../../context/AuthContext";
import FormField from "../../components/form/FormField";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import OtpInput from "../../components/ui/OtpInput";
import { LOGIN_FORM, LOGIN_STATS } from "../../config/constant";
import { useAndroidExitConfirmation } from "../../hooks/useAndroidExitConfirmation";
import { authDetailsSchema, authOtpSchema } from "../../validation/schemas";
import { colors, radius, shadows, spacing } from "../../theme/colors";

type AuthDetailsValues = {
    mobile: string;
    name: string;
    referralCode: string;
};

type AuthOtpValues = {
    otp: string;
};

export default function AuthScreen() {
    const { signInWithOtp } = useAuth();
    const [otp, setOtp] = useState('')
    const [isLogin, setIsLogin] = useState(true);
    const [step, setStep] = useState<"details" | "otp">("details");
    const [detailsSnapshot, setDetailsSnapshot] = useState<AuthDetailsValues>({ mobile: "", name: "", referralCode: "" });

    const normalizedMobile = detailsSnapshot.mobile.replace(/\D/g, "").slice(-10);

    const onHardwareBack = useCallback(() => {
        if (step === "otp") {
            setStep("details");
            return true;
        } else {
            return false;
        }
    }, [step]);

    useAndroidExitConfirmation(onHardwareBack);

    return (
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <LinearGradient colors={["#FF8C3A", colors.primary, colors.primaryDark]} style={styles.hero}>
                    <View style={styles.heroDecorA} />
                    <View style={styles.heroDecorB} />
                    <View style={styles.heroDecorC} />
                    {/* <View style={styles.brandRow}>
                        <View style={styles.brandMark}><Text style={styles.brandMarkText}>{BRAND.mark}</Text></View>
                        <Text style={styles.brandName}>{BRAND.name}</Text>
                    </View> */}
                    <View style={styles.statsRow}>
                        {LOGIN_STATS.map((stat) => (
                            <View key={stat.label} style={styles.statItem}>
                                <Text style={styles.statValue}>{stat.value}</Text>
                                <Text style={styles.statLabel}>{stat.label}</Text>
                            </View>
                        ))}
                    </View>
                </LinearGradient>

                <Card large elevated style={styles.formCard}>
                    <Text style={styles.title}>{isLogin ? LOGIN_FORM.welcomeBack : LOGIN_FORM.createAccount}</Text>
                    <Text style={styles.subtitle}>{isLogin ? LOGIN_FORM.enterCredentials : LOGIN_FORM.fillDetails}</Text>

                    <View style={styles.tabs}>
                        <Pressable onPress={() => { setIsLogin(true); setStep("details"); }} style={[styles.tab, isLogin && styles.tabActive]}>
                            <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>{LOGIN_FORM.loginTab}</Text>
                        </Pressable>
                        <Pressable onPress={() => { setIsLogin(false); setStep("details"); }} style={[styles.tab, !isLogin && styles.tabActive]}>
                            <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>{LOGIN_FORM.signUpTab}</Text>
                        </Pressable>
                    </View>

                    {step === "details" ? (
                        <Formik<AuthDetailsValues>
                            key={isLogin ? "login-details" : "register-details"}
                            initialValues={{ mobile: detailsSnapshot.mobile, name: detailsSnapshot.name, referralCode: detailsSnapshot.referralCode }}
                            validationSchema={authDetailsSchema(isLogin)}
                            onSubmit={async (values, { setSubmitting, setErrors }) => {
                                const mobile = values.mobile.replace(/\D/g, "").slice(-10);
                                try {
                                    const response = await sendOtp(mobile, isLogin ? "login" : "register");
                                    if (!response.status) {
                                        Alert.alert("Could not send OTP", response.message || "Try again.");
                                        setErrors(response.data as FormikErrors<AuthDetailsValues>);
                                        return;
                                    }

                                    if (response.data) setOtp(String(response.data));
                                    setDetailsSnapshot({
                                        mobile: values.mobile,
                                        name: values.name,
                                        referralCode: values.referralCode,
                                    });
                                    setStep("otp");
                                } catch (error) {
                                    Alert.alert("Network error", error instanceof Error ? error.message : "Could not reach server.");
                                } finally {
                                    setSubmitting(false);
                                }
                            }}
                        >
                            {({ handleSubmit, isSubmitting }) => (
                                <View style={styles.form}>
                                    {!isLogin ? <FormField name="name" label="Full name" required icon="user" placeholder="Your name" /> : null}
                                    <FormField name="mobile" label="Mobile number" required icon="phone" keyboardType="phone-pad" placeholder="10-digit mobile" maxLength={10} />
                                    {!isLogin ? <FormField name="referralCode" label="Referral code (optional)" placeholder="Referral code" autoCapitalize="characters" /> : null}
                                    <Button label={isSubmitting ? "Sending OTP…" : "Continue"} onPress={() => handleSubmit()} loading={isSubmitting} fullWidth />
                                </View>
                            )}
                        </Formik>
                    ) : (
                        <Formik<AuthOtpValues>
                            initialValues={{ otp }}
                            enableReinitialize
                            validationSchema={authOtpSchema}
                            onSubmit={async (values, { setSubmitting, setFieldError }) => {
                                try {
                                    const error = await signInWithOtp({
                                        mobile: normalizedMobile,
                                        otp: values.otp.trim(),
                                        name: isLogin ? "Customer" : detailsSnapshot.name.trim(),
                                        referralCode: detailsSnapshot.referralCode.trim() || undefined,
                                    });
                                    if (error) setFieldError("otp", error);
                                } catch (err) {
                                    Alert.alert("Network error", err instanceof Error ? err.message : "Could not reach server.");
                                } finally {
                                    setSubmitting(false);
                                }
                            }}
                        >
                            {({ values, errors, touched, setFieldValue, handleSubmit, isSubmitting }) => (
                                <View style={styles.form}>
                                    <View style={styles.otpBanner}>
                                        <Feather name="smartphone" size={18} color={colors.primary} />
                                        <Text style={styles.otpHint}>Code sent to +91 {normalizedMobile}</Text>
                                    </View>
                                    <OtpInput value={values.otp} onChange={(value) => void setFieldValue("otp", value)} />
                                    {touched.otp && errors.otp ? <Text style={styles.error}>{errors.otp}</Text> : null}
                                    <Button label={isSubmitting ? "Verifying…" : "Verify & continue"} onPress={() => handleSubmit()} loading={isSubmitting} fullWidth />
                                    <Pressable onPress={() => setStep("details")}><Text style={styles.link}>Change mobile number</Text></Pressable>
                                </View>
                            )}
                        </Formik>
                    )}
                </Card>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.muted },
    scroll: { flexGrow: 1, paddingBottom: spacing.x2 },
    hero: {
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.x2,
        paddingBottom: spacing.x2 + 24,
        borderBottomLeftRadius: radius.x3,
        borderBottomRightRadius: radius.x3,
        overflow: "hidden",
        minHeight: 300,
        justifyContent: "flex-end",
        alignItems: "flex-end",
    },
    heroDecorA: {
        position: "absolute",
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: "rgba(255,255,255,0.08)",
        top: -50,
        right: -30,
    },
    heroDecorB: {
        position: "absolute",
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: "rgba(255,255,255,0.06)",
        bottom: 20,
        left: 24,
    },
    heroDecorC: {
        position: "absolute",
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "rgba(255,255,255,0.05)",
        top: 32,
        left: 56,
    },
    brandRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: spacing.lg },
    brandMark: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.18)",
        alignItems: "center",
        justifyContent: "center",
    },
    brandMarkText: { color: colors.white, fontWeight: "800", fontSize: 16 },
    brandName: { color: colors.white, fontSize: 22, fontWeight: "800" },
    heroTitle: { color: colors.white, fontSize: 28, fontWeight: "800", lineHeight: 34 },
    heroSub: { color: "rgba(255,255,255,0.88)", fontSize: 15, marginTop: 8, lineHeight: 22 },
    statsRow: { flexDirection: "row", gap: 16, marginTop: spacing.xl },
    statItem: { flex: 1, backgroundColor: "rgba(255,255,255,0.12)", borderRadius: radius.xl, padding: spacing.md },
    statValue: { color: colors.white, fontSize: 20, fontWeight: "800" },
    statLabel: { color: "rgba(255,255,255,0.78)", fontSize: 11, marginTop: 2, fontWeight: "600" },
    formCard: {
        marginTop: -24,
        marginHorizontal: spacing.lg,
        ...shadows.card,
    },
    title: { fontSize: 26, fontWeight: "800", color: colors.foreground },
    subtitle: { fontSize: 15, color: colors.mutedForeground, marginTop: 6, marginBottom: spacing.lg, lineHeight: 22 },
    tabs: {
        flexDirection: "row",
        backgroundColor: colors.secondary,
        borderRadius: radius.xl,
        padding: 4,
        marginBottom: spacing.lg,
    },
    tab: { flex: 1, borderRadius: radius.lg, paddingVertical: 11, alignItems: "center" },
    tabActive: { backgroundColor: colors.card, ...shadows.card },
    tabText: { fontSize: 14, fontWeight: "700", color: colors.mutedForeground },
    tabTextActive: { color: colors.foreground },
    form: { gap: spacing.lg },
    otpBanner: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: colors.orange50,
        borderRadius: radius.xl,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.orange100,
    },
    otpHint: { fontSize: 14, color: colors.foreground, fontWeight: "600" },
    error: { fontSize: 12, color: colors.rose },
    link: { textAlign: "center", color: colors.primary, fontWeight: "700", fontSize: 14 },
});
