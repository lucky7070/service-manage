import { useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Formik } from "formik";
import * as ImagePicker from "expo-image-picker";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { resolveUploadUrl, updateProfile, uploadProfileImage } from "../api";
import { useAuth } from "../context/AuthContext";
import FormField from "../components/form/FormField";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Screen from "../components/ui/Screen";
import { profileSchema } from "../validation/schemas";
import { colors, radius, spacing } from "../theme/colors";

type ProfileFormValues = {
    name: string;
    email: string;
    dateOfBirth: string;
    preferredLanguage: "en" | "hi";
};

export default function ProfileScreen() {
    const { user, refreshProfile } = useAuth();
    const [editing, setEditing] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [localPhoto, setLocalPhoto] = useState<string | null>(null);

    const initials = (user?.name || "C").trim().charAt(0).toUpperCase();
    const photoUri = localPhoto || (user?.image ? resolveUploadUrl(user.image) : "");

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

    return (
        <Screen safe={false}>
            <LinearGradient colors={["#FF8C3A", colors.primary, colors.primaryDark]} style={styles.cover}>
                <View style={styles.coverDecor} />
                <Pressable onPress={() => void onPickPhoto()} style={styles.avatarRing}>
                    {photoUri ? (
                        <Image source={{ uri: photoUri }} style={styles.avatarImage} />
                    ) : (
                        <View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>
                    )}
                    <View style={styles.editBadge}><Feather name="camera" size={14} color={colors.white} /></View>
                </Pressable>
            </LinearGradient>

            <Card large elevated style={styles.profileCard}>
                {!editing ? (
                    <>
                        <Text style={styles.name}>{user?.name || "Customer"}</Text>
                        <Text style={styles.meta}>+91 {user?.mobile || "—"}</Text>
                        <Text style={styles.meta}>{user?.email || "No email added"}</Text>
                        <View style={styles.walletRow}>
                            <Feather name="credit-card" size={18} color={colors.primary} />
                            <View>
                                <Text style={styles.walletLabel}>Wallet balance</Text>
                                <Text style={styles.walletValue}>₹{Number(user?.balance || 0).toLocaleString("en-IN")}</Text>
                            </View>
                        </View>
                        {localPhoto ? (
                            <Button label={uploading ? "Uploading…" : "Upload selected photo"} onPress={() => void onUploadPhoto()} loading={uploading} fullWidth />
                        ) : null}
                        <Button label="Edit profile" onPress={() => setEditing(true)} fullWidth />
                    </>
                ) : (
                    <Formik<ProfileFormValues>
                        enableReinitialize
                        initialValues={{
                            name: user?.name || "",
                            email: user?.email || "",
                            dateOfBirth: user?.dateOfBirth || "",
                            preferredLanguage: user?.preferredLanguage || "en",
                        }}
                        validationSchema={profileSchema}
                        onSubmit={async (values, { setSubmitting }) => {
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
                                }
                            } finally {
                                setSubmitting(false);
                            }
                        }}
                    >
                        {({ values, isSubmitting, setFieldValue, handleSubmit, resetForm }) => (
                            <View style={styles.form}>
                                <FormField name="name" label="Full name" required />
                                <Input label="Mobile" value={user?.mobile ? `+91 ${user.mobile}` : ""} editable={false} />
                                <FormField name="email" label="Email" keyboardType="email-address" autoCapitalize="none" />
                                <FormField name="dateOfBirth" label="Date of birth" placeholder="YYYY-MM-DD" />
                                <Text style={styles.langLabel}>Preferred language</Text>
                                <View style={styles.langRow}>
                                    {(["en", "hi"] as const).map((lang) => (
                                        <Pressable
                                            key={lang}
                                            onPress={() => void setFieldValue("preferredLanguage", lang)}
                                            style={[styles.langChip, values.preferredLanguage === lang && styles.langChipActive]}
                                        >
                                            <Text style={[styles.langText, values.preferredLanguage === lang && styles.langTextActive]}>
                                                {lang === "en" ? "English" : "Hindi"}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </View>
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
                                    <Button label={isSubmitting ? "Saving…" : "Save"} onPress={() => handleSubmit()} loading={isSubmitting} style={styles.actionBtn} />
                                </View>
                            </View>
                        )}
                    </Formik>
                )}
            </Card>

            {!editing && user?.referralCode ? <Card elevated style={styles.referralBox}>
                <Feather name="gift" size={16} color={colors.amber} />
                <Text style={styles.referralText}>Referral code: {user.referralCode}</Text>
            </Card> : null}
        </Screen>
    );
}

const styles = StyleSheet.create({
    cover: {
        height: 120,
        borderRadius: radius.x3,
        marginBottom: 56,
        overflow: "hidden",
        justifyContent: "flex-end",
        alignItems: "center",
    },
    coverDecor: {
        position: "absolute",
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "rgba(255,255,255,0.1)",
        top: -30,
        right: -20,
    },
    avatarRing: {
        position: "absolute",
        bottom: -44,
        padding: 4,
        borderRadius: 56,
        backgroundColor: colors.card,
    },
    avatar: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: "rgba(240,116,26,0.12)",
        alignItems: "center",
        justifyContent: "center",
    },
    avatarImage: { width: 88, height: 88, borderRadius: 44 },
    avatarText: { fontSize: 32, fontWeight: "800", color: colors.primary },
    editBadge: {
        position: "absolute",
        bottom: 6,
        right: 6,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.primary,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: colors.card,
    },
    profileCard: { alignItems: "stretch", marginBottom: spacing.lg, paddingTop: spacing.x2, gap: spacing.md },
    name: { fontSize: 24, fontWeight: "800", color: colors.foreground, textAlign: "center" },
    meta: { fontSize: 14, color: colors.mutedForeground, textAlign: "center" },
    walletRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        backgroundColor: colors.muted,
        borderRadius: radius.x2,
        padding: spacing.lg,
    },
    walletLabel: { fontSize: 12, fontWeight: "700", color: colors.mutedForeground, textTransform: "uppercase" },
    walletValue: { fontSize: 22, fontWeight: "800", color: colors.foreground, marginTop: 2 },
    form: { gap: spacing.md },
    langLabel: { fontSize: 14, fontWeight: "600", color: colors.mutedForeground },
    langRow: { flexDirection: "row", gap: 8 },
    langChip: { flex: 1, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, paddingVertical: 10, alignItems: "center" },
    langChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    langText: { fontWeight: "700", color: colors.mutedForeground },
    langTextActive: { color: colors.white },
    actions: { flexDirection: "row", gap: spacing.sm },
    actionBtn: { flex: 1 },
    referralBox: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.amberBg, borderColor: colors.amberRing },
    referralText: { fontSize: 13, fontWeight: "700", color: colors.amber },
});
