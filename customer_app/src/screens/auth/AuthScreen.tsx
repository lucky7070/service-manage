import { useState, useCallback, useEffect, useRef } from "react";
import {
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
    type KeyboardEvent,
} from "react-native";
import { Formik, FormikErrors } from "formik";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { sendOtp } from "../../api";
import { useAuth } from "../../context/AuthContext";
import FormField from "../../components/form/FormField";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import OtpInput from "../../components/ui/OtpInput";
import { BRAND, LOGIN_FORM } from "../../config/constant";
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
    const insets = useSafeAreaInsets();
    const scrollRef = useRef<ScrollView>(null);
    const [otp, setOtp] = useState("");
    const [isLogin, setIsLogin] = useState(true);
    const [step, setStep] = useState<"details" | "otp">("details");
    const [detailsSnapshot, setDetailsSnapshot] = useState<AuthDetailsValues>({ mobile: "", name: "", referralCode: "" });
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [resendIn, setResendIn] = useState(0);
    const [resending, setResending] = useState(false);

    const normalizedMobile = detailsSnapshot.mobile.replace(/\D/g, "").slice(-10);
    const isRegister = !isLogin;
    const keyboardOpen = keyboardHeight > 0;

    useEffect(() => {
        const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
        const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

        const onShow = (event: KeyboardEvent) => setKeyboardHeight(event.endCoordinates.height);
        const onHide = () => setKeyboardHeight(0);

        const showSub = Keyboard.addListener(showEvent, onShow);
        const hideSub = Keyboard.addListener(hideEvent, onHide);
        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    useEffect(() => {
        if (resendIn <= 0) return;
        const timer = setInterval(() => {
            setResendIn((prev) => (prev <= 1 ? 0 : prev - 1));
        }, 1000);
        return () => clearInterval(timer);
    }, [resendIn]);

    const startResendCooldown = useCallback(() => {
        setResendIn(60);
    }, []);

    const onHardwareBack = useCallback(() => {
        if (step === "otp") {
            setStep("details");
            return true;
        }
        return false;
    }, [step]);

    useAndroidExitConfirmation(onHardwareBack);

    const handleResendOtp = useCallback(async () => {
        if (resendIn > 0 || resending || !normalizedMobile) return;

        setResending(true);
        try {
            const response = await sendOtp(normalizedMobile, isLogin ? "login" : "register");
            if (!response.status) {
                Alert.alert("Could not resend OTP", response.message || "Try again.");
                return;
            }
            if (response.data) setOtp(String(response.data));
            startResendCooldown();
            Alert.alert("OTP sent", "A new verification code has been sent.");
        } catch (error) {
            Alert.alert("Network error", error instanceof Error ? error.message : "Could not reach server.");
        } finally {
            setResending(false);
        }
    }, [resendIn, resending, normalizedMobile, isLogin, startResendCooldown]);

    /** Scroll lower fields (referral / mobile / button) into the visible area above the keyboard. */
    const scrollFocusedFieldIntoView = useCallback((mode: "end" | "mid" = "end") => {
        requestAnimationFrame(() => {
            setTimeout(() => {
                if (mode === "end") {
                    scrollRef.current?.scrollToEnd({ animated: true });
                    return;
                }
                scrollRef.current?.scrollTo({ y: 120, animated: true });
            }, Platform.OS === "android" ? 150 : 80);
        });
    }, []);

    const bottomPad =
        spacing.x2 +
        Math.max(insets.bottom, spacing.md) +
        // Extra room so scrollToEnd can lift referral + Continue above the keyboard.
        // Keep modest: Android already resizes the window (softwareKeyboardLayoutMode: resize).
        (keyboardOpen ? (isRegister ? 160 : 88) : 0);

    const scrollBody = (
        <ScrollView
            ref={scrollRef}
            style={styles.flex}
            contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad }]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
            bounces={false}
            automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
        >
            <LinearGradient
                colors={["#FF8C3A", colors.primary, colors.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.brandHeader, keyboardOpen && styles.brandHeaderCompact]}
            >
                <View style={styles.decorA} />
                <View style={styles.decorB} />
                <View style={styles.brandRow}>
                    <View style={styles.brandMark}>
                        <Text style={styles.brandMarkText}>{BRAND.mark}</Text>
                    </View>
                    <Text style={styles.brandName}>{BRAND.name}</Text>
                </View>
            </LinearGradient>

            <Card large elevated style={[styles.formCard, isRegister && styles.formCardRegister]}>
                <Text style={[styles.title, isRegister && styles.titleCompact]}>
                    {isLogin ? LOGIN_FORM.welcomeBack : LOGIN_FORM.createAccount}
                </Text>
                {!(keyboardOpen && isRegister) ? (
                    <Text style={[styles.subtitle, isRegister && styles.subtitleCompact]}>
                        {isLogin ? LOGIN_FORM.enterCredentials : LOGIN_FORM.fillDetails}
                    </Text>
                ) : null}

                <View style={[styles.tabs, isRegister && styles.tabsCompact]}>
                    <Pressable
                        onPress={() => {
                            setIsLogin(true);
                            setStep("details");
                            setResendIn(0);
                        }}
                        style={[styles.tab, isLogin && styles.tabActive]}
                    >
                        <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>{LOGIN_FORM.loginTab}</Text>
                    </Pressable>
                    <Pressable
                        onPress={() => {
                            setIsLogin(false);
                            setStep("details");
                            setResendIn(0);
                        }}
                        style={[styles.tab, !isLogin && styles.tabActive]}
                    >
                        <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>{LOGIN_FORM.signUpTab}</Text>
                    </Pressable>
                </View>

                {step === "details" ? (
                    <Formik<AuthDetailsValues>
                        key={isLogin ? "login-details" : "register-details"}
                        initialValues={{
                            mobile: detailsSnapshot.mobile,
                            name: detailsSnapshot.name,
                            referralCode: detailsSnapshot.referralCode,
                        }}
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
                                startResendCooldown();
                                setStep("otp");
                            } catch (error) {
                                Alert.alert("Network error", error instanceof Error ? error.message : "Could not reach server.");
                            } finally {
                                setSubmitting(false);
                            }
                        }}
                    >
                        {({ handleSubmit, isSubmitting }) => (
                            <View style={[styles.form, isRegister && styles.formCompact]}>
                                {!isLogin ? (
                                    <FormField
                                        name="name"
                                        label="Full name"
                                        required
                                        icon="user"
                                        placeholder="Your name"
                                        autoCapitalize="words"
                                        maxLength={100}
                                        onFocus={() => scrollFocusedFieldIntoView("mid")}
                                    />
                                ) : null}
                                <FormField
                                    name="mobile"
                                    label="Mobile number"
                                    required
                                    icon="phone"
                                    keyboardType="phone-pad"
                                    placeholder="10-digit mobile"
                                    maxLength={10}
                                    onFocus={() => scrollFocusedFieldIntoView(isRegister ? "end" : "mid")}
                                />
                                {!isLogin ? (
                                    <FormField
                                        name="referralCode"
                                        label="Referral code (optional)"
                                        placeholder="Referral code"
                                        autoCapitalize="characters"
                                        onFocus={() => scrollFocusedFieldIntoView("end")}
                                    />
                                ) : null}
                                <Button
                                    label={isSubmitting ? "Sending OTP…" : "Continue"}
                                    onPress={() => handleSubmit()}
                                    loading={isSubmitting}
                                    fullWidth
                                />
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
                                <Button
                                    label={isSubmitting ? "Verifying…" : "Verify & continue"}
                                    onPress={() => handleSubmit()}
                                    loading={isSubmitting}
                                    fullWidth
                                />
                                <Pressable
                                    onPress={() => void handleResendOtp()}
                                    disabled={resendIn > 0 || resending || isSubmitting}
                                    style={styles.resendWrap}
                                >
                                    <Text style={[styles.resendText, (resendIn > 0 || resending) && styles.resendTextDisabled]}>
                                        {resending
                                            ? "Sending…"
                                            : resendIn > 0
                                                ? `Resend OTP in ${resendIn}s`
                                                : "Resend OTP"}
                                    </Text>
                                </Pressable>
                                <Pressable
                                    onPress={() => {
                                        setResendIn(0);
                                        setStep("details");
                                    }}
                                >
                                    <Text style={styles.link}>Change mobile number</Text>
                                </Pressable>
                            </View>
                        )}
                    </Formik>
                )}
            </Card>
        </ScrollView>
    );

    return (
        <SafeAreaView style={styles.flex} edges={["top", "left", "right"]}>
            {Platform.OS === "ios" ? (
                <KeyboardAvoidingView style={styles.flex} behavior="padding" keyboardVerticalOffset={insets.top}>
                    {scrollBody}
                </KeyboardAvoidingView>
            ) : (
                scrollBody
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.muted },
    scroll: {
        flexGrow: 1,
    },
    brandHeader: {
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.md,
        paddingBottom: spacing.xl,
        minHeight: 96,
        justifyContent: "center",
        overflow: "hidden",
        borderBottomLeftRadius: radius.x3,
        borderBottomRightRadius: radius.x3,
    },
    brandHeaderCompact: {
        minHeight: 72,
        paddingTop: spacing.sm,
        paddingBottom: spacing.md,
    },
    decorA: {
        position: "absolute",
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "rgba(255,255,255,0.08)",
        top: -36,
        right: -20,
    },
    decorB: {
        position: "absolute",
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "rgba(255,255,255,0.06)",
        bottom: -8,
        left: 24,
    },
    brandRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        zIndex: 1,
    },
    brandMark: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(255,255,255,0.2)",
        alignItems: "center",
        justifyContent: "center",
    },
    brandMarkText: {
        color: colors.white,
        fontWeight: "800",
        fontSize: 18,
    },
    brandName: {
        color: colors.white,
        fontSize: 20,
        fontWeight: "800",
        flexShrink: 1,
    },
    formCard: {
        marginTop: spacing.lg,
        marginHorizontal: spacing.lg,
        marginBottom: spacing.md,
        ...shadows.card,
    },
    formCardRegister: {
        marginTop: spacing.md,
    },
    title: { fontSize: 26, fontWeight: "800", color: colors.foreground },
    titleCompact: { fontSize: 22 },
    subtitle: {
        fontSize: 15,
        color: colors.mutedForeground,
        marginTop: 6,
        marginBottom: spacing.lg,
        lineHeight: 22,
    },
    subtitleCompact: {
        fontSize: 14,
        marginBottom: spacing.md,
        lineHeight: 20,
    },
    tabs: {
        flexDirection: "row",
        backgroundColor: colors.secondary,
        borderRadius: radius.xl,
        padding: 4,
        marginBottom: spacing.lg,
    },
    tabsCompact: {
        marginBottom: spacing.md,
    },
    tab: { flex: 1, borderRadius: radius.lg, paddingVertical: 11, alignItems: "center" },
    tabActive: { backgroundColor: colors.card, ...shadows.card },
    tabText: { fontSize: 14, fontWeight: "700", color: colors.mutedForeground },
    tabTextActive: { color: colors.foreground },
    form: { gap: spacing.lg },
    formCompact: { gap: spacing.md },
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
    resendWrap: {
        alignItems: "center",
        paddingVertical: spacing.xs,
    },
    resendText: {
        textAlign: "center",
        color: colors.primary,
        fontWeight: "700",
        fontSize: 14,
    },
    resendTextDisabled: {
        color: colors.mutedForeground,
        fontWeight: "600",
    },
});
