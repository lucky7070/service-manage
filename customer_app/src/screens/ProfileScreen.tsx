import { useMemo, useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Formik } from "formik";
import * as ImagePicker from "expo-image-picker";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { resolveUploadUrl, updateProfile, uploadProfileImage, deleteAccount } from "../api";
import { useAuth } from "../context/AuthContext";
import FormField from "../components/form/FormField";
import DateField from "../components/form/DateField";
import LanguagePicker from "../components/form/LanguagePicker";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Screen from "../components/ui/Screen";
import { useMainNavigation } from "../navigation/MainNavContext";
import { formatDate } from "../helpers/date";
import { profileSchema } from "../validation/schemas";
import { colors, radius, shadows, spacing } from "../theme/colors";
import type { AccountMenuRoute } from "../api/types";

type ProfileFormValues = {
    name: string;
    email: string;
    dateOfBirth: string;
    preferredLanguage: "en" | "hi";
};

type QuickLink = {
    route: AccountMenuRoute;
    label: string;
    icon: keyof typeof Feather.glyphMap;
    gradient: [string, string];
};

const quickLinks: QuickLink[] = [
    { route: "Ledger", label: "Wallet", icon: "credit-card", gradient: ["#0EA5E9", "#0284C7"] },
    { route: "Addresses", label: "Addresses", icon: "map-pin", gradient: ["#10B981", "#059669"] },
    { route: "Bookings", label: "Bookings", icon: "calendar", gradient: ["#FF8C3A", colors.primary] },
    { route: "ReferEarn", label: "Refer & earn", icon: "gift", gradient: ["#F59E0B", "#D97706"] },
];

function languageLabel(lang?: "en" | "hi") {
    return lang === "hi" ? "Hindi" : "English";
}

export default function ProfileScreen() {
    const { user, refreshProfile, signOut } = useAuth();
    const { navigate } = useMainNavigation();
    const [editing, setEditing] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [localPhoto, setLocalPhoto] = useState<string | null>(null);

    const firstName = (user.name || "Customer").trim().split(/\s+/)[0];
    const initials = (user.name || "C").trim().charAt(0).toUpperCase();
    const photoUri = localPhoto || (user.image ? resolveUploadUrl(user.image) : "");
    const language = useMemo(() => languageLabel(user.preferredLanguage), [user.preferredLanguage]);

    const onPickPhoto = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert("Permission needed", "Allow photo access to update your profile picture.");
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.8 });
        if (!result.canceled && result.assets[0]?.uri) setLocalPhoto(result.assets[0].uri);
    };

    const onUploadPhoto = async () => {
        if (!localPhoto) return;
        setUploading(true);
        try {
            const response = await uploadProfileImage(localPhoto);
            if (response.status) {
                Alert.alert("Updated", response.message || "Photo updated.");
                setLocalPhoto(null);
                await refreshProfile();
            } else Alert.alert("Upload failed", response.message || "Try again.");
        } finally {
            setUploading(false);
        }
    };

    const onLogout = () => {
        Alert.alert("Log out?", "You will need to sign in again to access your account.", [
            { text: "Cancel", style: "cancel" },
            { text: "Log out", style: "destructive", onPress: () => void signOut() },
        ]);
    };

    const onDeleteAccountPress = () => {
        Alert.alert(
            "Delete account?",
            "Your profile will be deactivated and you will be signed out. You will not be able to log in again with this account. Some booking records may be kept as required for service and legal purposes.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Continue",
                    style: "destructive",
                    onPress: () => {
                        Alert.alert(
                            "Delete account permanently?",
                            "This cannot be undone from the app.",
                            [
                                { text: "Cancel", style: "cancel" },
                                {
                                    text: "Delete my account",
                                    style: "destructive",
                                    onPress: async () => {
                                        try {
                                            const response = await deleteAccount();
                                            if (response.status) {
                                                await signOut();
                                                return;
                                            }
                                            Alert.alert("Could not delete account", response.message || "Please try again.");
                                        } finally { }
                                    },
                                },
                            ]
                        );
                    },
                },
            ]
        );
    };

    return (
        <Screen safe={false}>
            <LinearGradient
                colors={["#FF8C3A", colors.primary, colors.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.hero}
            >
                <View style={styles.heroDecorA} />
                <View style={styles.heroDecorB} />
                <View style={styles.heroDecorC} />

                <View style={styles.heroTop}>
                    <View>
                        <Text style={styles.heroEyebrow}>My account</Text>
                        <Text style={styles.heroTitle}>Profile</Text>
                    </View>
                    {user.balance != null ? <View style={{ flexDirection: "column", alignItems: "flex-end", gap: spacing.sm }}>
                        <Text style={styles.walletLabel}>Wallet Balance</Text>
                        <Text style={styles.walletValue}>₹{Number(user.balance || 0).toLocaleString("en-IN")}</Text>
                    </View> : null}
                </View>

                <Pressable onPress={() => void onPickPhoto()} style={styles.avatarWrap}>
                    {photoUri ? (
                        <Image source={{ uri: photoUri }} style={styles.avatarImage} />
                    ) : (
                        <View style={styles.avatarFallback}>
                            <Text style={styles.avatarText}>{initials}</Text>
                        </View>
                    )}
                    <View style={styles.cameraBadge}>
                        <Feather name="camera" size={13} color={colors.white} />
                    </View>
                </Pressable>
            </LinearGradient>

            <Card large elevated style={styles.profileCard}>
                {!editing ? (
                    <>
                        <View style={styles.identity}>
                            <Text style={styles.name}>{user.name || "Customer"}</Text>
                            <Text style={styles.greeting}>Hi {firstName}, manage your account details below.</Text>
                        </View>

                        {localPhoto ? (
                            <View style={styles.photoBanner}>
                                <Feather name="image" size={16} color={colors.primary} />
                                <Text style={styles.photoBannerText}>New photo selected</Text>
                                <Button
                                    label={uploading ? "Uploading…" : "Save photo"}
                                    onPress={() => void onUploadPhoto()}
                                    loading={uploading}
                                    style={styles.photoBtn}
                                />
                            </View>
                        ) : null}

                        <View style={styles.infoList}>
                            <InfoRow icon="phone" label="Mobile" value={user.mobile ? `+91 ${user.mobile}` : "—"} />
                            <InfoRow icon="mail" label="Email" value={user.email || "No email added"} />
                            <InfoRow
                                icon="calendar"
                                label="Date of birth"
                                value={user.dateOfBirth ? formatDate(user.dateOfBirth) : "Not set"}
                            />
                            <InfoRow icon="globe" label="Language" value={language} last />
                        </View>

                        <Button label="Edit profile" onPress={() => setEditing(true)} fullWidth />
                    </>
                ) : (
                    <Formik<ProfileFormValues>
                        enableReinitialize
                        initialValues={{
                            name: user.name || "",
                            email: user.email || "",
                            dateOfBirth: user.dateOfBirth || "",
                            preferredLanguage: user.preferredLanguage || "en",
                        }}
                        validationSchema={profileSchema}
                        onSubmit={async (values, { setSubmitting, setErrors }) => {
                            try {
                                const response = await updateProfile({
                                    name: values.name.trim(),
                                    email: values.email.trim() || null,
                                    dateOfBirth: values.dateOfBirth.trim() || null,
                                    preferredLanguage: values.preferredLanguage,
                                });
                                if (response.status) {
                                    Alert.alert("Saved", response.message || "Profile updated.");
                                    await refreshProfile();
                                    setEditing(false);
                                } else {
                                    Alert.alert("Could not save", response.message || "Try again.");
                                    setErrors(response.data);
                                }
                            } finally {
                                setSubmitting(false);
                            }
                        }}
                    >
                        {({ values, errors, touched, isSubmitting, setFieldValue, setFieldTouched, handleSubmit, resetForm }) => (
                            <View style={styles.form}>
                                <Text style={styles.formTitle}>Edit profile</Text>
                                <Text style={styles.formSub}>Update your personal details. Mobile number cannot be changed here.</Text>

                                <FormField name="name" label="Full name" required autoCapitalize="words" maxLength={100} />
                                <Input label="Mobile" value={user.mobile ? `+91 ${user.mobile}` : ""} editable={false} />
                                <FormField name="email" label="Email" keyboardType="email-address" autoCapitalize="none" />
                                <DateField
                                    label="Date of birth"
                                    value={values.dateOfBirth}
                                    onChange={(date) => {
                                        void setFieldValue("dateOfBirth", date);
                                        void setFieldTouched("dateOfBirth", true, false);
                                    }}
                                    error={touched.dateOfBirth && errors.dateOfBirth ? String(errors.dateOfBirth) : undefined}
                                    maximumDate={new Date()}
                                    clearable
                                />

                                <LanguagePicker
                                    value={values.preferredLanguage}
                                    onChange={(lang) => void setFieldValue("preferredLanguage", lang)}
                                    error={touched.preferredLanguage && errors.preferredLanguage ? String(errors.preferredLanguage) : undefined}
                                />

                                <View style={styles.actions}>
                                    <Button
                                        label="Cancel"
                                        variant="outline"
                                        onPress={() => {
                                            resetForm();
                                            setEditing(false);
                                        }}
                                        style={styles.actionBtn}
                                    />
                                    <Button
                                        label={isSubmitting ? "Saving…" : "Save"}
                                        onPress={() => handleSubmit()}
                                        loading={isSubmitting}
                                        style={styles.actionBtn}
                                    />
                                </View>

                                <View style={styles.dangerZone}>
                                    <Text style={styles.dangerHint}>
                                        Need to remove your account? You will not be able to log in again with this account. Some booking records may be kept as required for service and legal purposes.
                                        This cannot be undone.
                                    </Text>
                                    <Pressable
                                        onPress={onDeleteAccountPress}
                                        disabled={isSubmitting}
                                        style={({ pressed }) => [styles.deleteAccountLink, pressed && styles.deleteAccountPressed]}
                                    >
                                        <Text style={styles.deleteAccountText}>
                                            Delete Account
                                        </Text>
                                    </Pressable>
                                </View>
                            </View>
                        )}
                    </Formik>
                )}
            </Card>

            {!editing ? (
                <>
                    <Text style={styles.sectionLabel}>Quick access</Text>
                    <View style={styles.quickGrid}>
                        {quickLinks.map((link) => (
                            <Pressable key={link.route} onPress={() => navigate(link.route)} style={styles.quickTile}>
                                <LinearGradient colors={link.gradient} style={styles.quickIcon}>
                                    <Feather name={link.icon} size={18} color={colors.white} />
                                </LinearGradient>
                                <Text style={styles.quickLabel}>{link.label}</Text>
                                <Feather name="chevron-right" size={14} color={colors.mutedForeground} style={styles.quickChevron} />
                            </Pressable>
                        ))}
                    </View>

                    {user.referralCode ? (
                        <Pressable onPress={() => navigate("ReferEarn")}>
                            <LinearGradient colors={["#FFFBEB", "#FEF3C7"]} style={styles.referBanner}>
                                <View style={styles.referIcon}>
                                    <Feather name="gift" size={18} color={colors.amber} />
                                </View>
                                <View style={styles.referCopy}>
                                    <Text style={styles.referTitle}>Invite friends, earn rewards</Text>
                                    <Text style={styles.referCode}>Your code: {user.referralCode}</Text>
                                </View>
                                <Feather name="chevron-right" size={18} color={colors.amber} />
                            </LinearGradient>
                        </Pressable>
                    ) : null}

                    <Pressable onPress={onLogout} style={styles.logoutBtn}>
                        <Feather name="log-out" size={16} color={colors.destructive} />
                        <Text style={styles.logoutText}>Log out</Text>
                    </Pressable>
                </>
            ) : null}
        </Screen>
    );
}

function InfoRow({
    icon,
    label,
    value,
    last,
}: {
    icon: keyof typeof Feather.glyphMap;
    label: string;
    value: string;
    last?: boolean;
}) {
    return (
        <View style={[styles.infoRow, !last && styles.infoRowBorder]}>
            <View style={styles.infoIcon}>
                <Feather name={icon} size={16} color={colors.primary} />
            </View>
            <View style={styles.infoBody}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    hero: {
        borderRadius: radius.x3,
        padding: spacing.xl,
        paddingBottom: 52,
        marginBottom: -36,
        overflow: "hidden",
        alignItems: "center",
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
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: "rgba(255,255,255,0.06)",
        bottom: 24,
        left: 20,
    },
    heroDecorC: {
        position: "absolute",
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "rgba(255,255,255,0.05)",
        top: 28,
        left: 56,
    },
    heroTop: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: spacing.lg,
    },
    heroEyebrow: {
        color: "rgba(255,255,255,0.85)",
        fontSize: 13,
        fontWeight: "600",
    },
    heroTitle: {
        color: colors.white,
        fontSize: 26,
        fontWeight: "800",
        marginTop: 2,
    },
    walletPill: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        backgroundColor: "rgba(255,255,255,0.16)",
        borderRadius: radius.x2,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.18)",
    },
    walletLabel: {
        color: "rgba(255,255,255,0.78)",
        fontSize: 11,
        fontWeight: "700",
        textTransform: "uppercase"
    },
    walletValue: {
        color: colors.white,
        fontSize: 20,
        fontWeight: "800",
        marginTop: 2
    },
    avatarWrap: {
        padding: 4,
        borderRadius: 52,
        backgroundColor: colors.card,
        ...shadows.card,
        shadowOpacity: 0.12,
    },
    avatarFallback: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: "rgba(240,116,26,0.12)",
        alignItems: "center",
        justifyContent: "center",
    },
    avatarImage: { width: 96, height: 96, borderRadius: 48 },
    avatarText: { fontSize: 36, fontWeight: "800", color: colors.primary },
    cameraBadge: {
        position: "absolute",
        bottom: 4,
        right: 4,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: colors.primary,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: colors.card,
    },
    profileCard: {
        marginBottom: spacing.lg,
        paddingTop: spacing.x2 + 8,
        gap: spacing.lg,
    },
    identity: { alignItems: "center", gap: 4 },
    name: { fontSize: 22, fontWeight: "800", color: colors.foreground, textAlign: "center" },
    greeting: { fontSize: 13, color: colors.mutedForeground, textAlign: "center", lineHeight: 19 },
    photoBanner: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        backgroundColor: "rgba(240,116,26,0.08)",
        borderRadius: radius.x2,
        borderWidth: 1,
        borderColor: "rgba(240,116,26,0.2)",
        padding: spacing.md,
    },
    photoBannerText: { flex: 1, fontSize: 13, fontWeight: "600", color: colors.foreground },
    photoBtn: { minWidth: 100 },
    infoList: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.x2,
        overflow: "hidden",
        backgroundColor: colors.background,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        padding: spacing.md,
    },
    infoRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    infoIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: "rgba(240,116,26,0.1)",
        alignItems: "center",
        justifyContent: "center",
    },
    infoBody: { flex: 1, gap: 2 },
    infoLabel: { fontSize: 11, fontWeight: "700", color: colors.mutedForeground, textTransform: "uppercase" },
    infoValue: { fontSize: 14, fontWeight: "600", color: colors.foreground },
    form: { gap: spacing.md },
    formTitle: { fontSize: 18, fontWeight: "800", color: colors.foreground },
    formSub: { fontSize: 13, color: colors.mutedForeground, lineHeight: 20, marginBottom: spacing.sm },
    actions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm },
    actionBtn: { flex: 1 },
    dangerZone: {
        marginTop: spacing.x2,
        paddingTop: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        gap: spacing.sm,
        alignItems: "center",
    },
    dangerHint: {
        fontSize: 12,
        color: colors.mutedForeground,
        textAlign: "center",
        lineHeight: 18,
    },
    deleteAccountLink: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
    },
    deleteAccountPressed: { opacity: 0.6 },
    deleteAccountText: {
        fontSize: 13,
        fontWeight: "600",
        color: colors.destructive,
        textDecorationLine: "underline",
    },
    sectionLabel: {
        fontSize: 15,
        fontWeight: "800",
        color: colors.foreground,
        marginBottom: spacing.md,
    },
    quickGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    quickTile: {
        width: "48%",
        flexGrow: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.x2,
        backgroundColor: colors.card,
        padding: spacing.md,
        ...shadows.card,
        shadowOpacity: 0.04,
    },
    quickIcon: {
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    quickLabel: { flex: 1, fontSize: 14, fontWeight: "700", color: colors.foreground },
    quickChevron: { marginLeft: "auto" },
    referBanner: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        borderRadius: radius.x2,
        padding: spacing.lg,
        marginBottom: spacing.lg,
        borderWidth: 1,
        borderColor: "#FDE68A",
    },
    referIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "rgba(245,158,11,0.15)",
        alignItems: "center",
        justifyContent: "center",
    },
    referCopy: { flex: 1, gap: 2 },
    referTitle: { fontSize: 14, fontWeight: "800", color: "#92400E" },
    referCode: { fontSize: 12, fontWeight: "600", color: "#B45309" },
    logoutBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        borderWidth: 1,
        borderColor: "rgba(225,29,72,0.25)",
        borderRadius: radius.x2,
        backgroundColor: "rgba(225,29,72,0.06)",
        paddingVertical: 14,
        marginBottom: spacing.md,
    },
    logoutText: { fontSize: 14, fontWeight: "700", color: colors.destructive },
});
