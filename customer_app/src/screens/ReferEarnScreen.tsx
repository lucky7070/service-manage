import { useMemo } from "react";
import { Alert, Share, StyleSheet, Text, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import IconBox from "../components/ui/IconBox";
import PageHero from "../components/ui/PageHero";
import Screen from "../components/ui/Screen";
import env from "../config/env";
import { colors, radius, spacing } from "../theme/colors";

const steps = [
    { title: "Share your code", description: "Send your referral link to friends and family.", icon: "share-2" as const },
    { title: "Friend registers", description: "They sign up using your referral code.", icon: "users" as const },
    { title: "Earn reward", description: "Your wallet gets credited after successful registration.", icon: "credit-card" as const },
];

export default function ReferEarnScreen() {
    const { user } = useAuth();

    const shareLink = useMemo(() => {
        if (!user.referralCode) return "";
        const base = env.webUrl.replace(/\/$/, "");
        return `${base}/login?ref=${encodeURIComponent(user.referralCode)}`;
    }, [user.referralCode]);

    const copyText = async (value: string, message: string) => {
        if (!value) {
            Alert.alert("Unavailable", "Referral code is not available.");
            return;
        }
        await Clipboard.setStringAsync(value);
        Alert.alert("Copied", message);
    };

    const shareReferral = async () => {
        if (!user.referralCode) {
            Alert.alert("Unavailable", "Referral code is not available.");
            return;
        }

        try {
            await Share.share({
                title: "Join Serva Services",
                message: `Use my referral code ${user.referralCode} when you sign up.\n${shareLink || ""}`.trim(),
                url: shareLink || undefined,
            });
        } catch {
            if (shareLink) await copyText(shareLink, "Referral link copied.");
        }
    };

    return (
        <Screen safe={false}>
            <PageHero
                eyebrow="Refer & Earn"
                title="Invite friends and earn rewards"
                subtitle="Share your referral code. When a new customer registers with it, your reward will be credited to your wallet."
            />

            <Card large elevated style={styles.codeCard}>
                <LinearGradient colors={["#FF8C3A", colors.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.codeStripe} />
                <IconBox name="gift" tone="primary" large />
                <Text style={styles.codeLabel}>Your Referral Code</Text>
                <Text style={styles.codeValue}>{user?.referralCode || "—"}</Text>
                <View style={styles.codeActions}>
                    <Button
                        label="Copy Code"
                        onPress={() => void copyText(user?.referralCode || "", "Referral code copied.")}
                        style={styles.actionBtn}
                    />
                    <Button label="Share Now" variant="secondary" onPress={() => void shareReferral()} style={styles.actionBtn} />
                </View>
            </Card>

            <Card elevated style={styles.linkCard}>
                <Text style={styles.linkTitle}>Share Link</Text>
                <Text style={styles.linkSub}>Send this link directly. Your code will be filled on signup.</Text>
                <View style={styles.linkBox}>
                    <Text style={styles.linkText} selectable>{shareLink || "Referral link will appear here"}</Text>
                </View>
                <Button
                    label="Copy Link"
                    variant="secondary"
                    onPress={() => void copyText(shareLink, "Referral link copied.")}
                    fullWidth
                />
            </Card>

            <View style={styles.steps}>
                {steps.map((step, index) => (
                    <Card key={step.title} elevated style={styles.stepCard}>
                        <View style={styles.stepTop}>
                            <IconBox name={step.icon} tone="primary" />
                            <Text style={styles.stepBadge}>Step {index + 1}</Text>
                        </View>
                        <Text style={styles.stepTitle}>{step.title}</Text>
                        <Text style={styles.stepDesc}>{step.description}</Text>
                    </Card>
                ))}
            </View>

            <Card style={styles.noteCard}>
                <Feather name="check-circle" size={18} color={colors.emerald} />
                <View style={styles.noteBody}>
                    <Text style={styles.noteTitle}>Reward will reflect in your ledger</Text>
                    <Text style={styles.noteText}>
                        Once the referred customer registers successfully, the credited amount will appear in your wallet ledger.
                    </Text>
                </View>
            </Card>
        </Screen>
    );
}

const styles = StyleSheet.create({
    codeCard: { alignItems: "center", marginBottom: spacing.lg, overflow: "hidden", paddingTop: spacing.xl },
    codeStripe: { position: "absolute", top: 0, left: 0, right: 0, height: 4 },
    codeLabel: { fontSize: 14, fontWeight: "600", color: colors.mutedForeground, marginTop: spacing.md },
    codeValue: {
        marginTop: spacing.sm,
        fontSize: 28,
        fontWeight: "800",
        letterSpacing: 4,
        color: colors.primary,
        fontFamily: "monospace",
    },
    codeActions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.lg, width: "100%" },
    actionBtn: { flex: 1 },
    linkCard: { marginBottom: spacing.lg, gap: spacing.sm },
    linkTitle: { fontSize: 18, fontWeight: "700", color: colors.foreground },
    linkSub: { fontSize: 13, color: colors.mutedForeground, lineHeight: 20 },
    linkBox: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.x2,
        backgroundColor: colors.muted,
        padding: spacing.md,
        marginVertical: spacing.sm,
    },
    linkText: { fontSize: 12, color: colors.foreground, fontFamily: "monospace" },
    steps: { gap: spacing.md, marginBottom: spacing.lg },
    stepCard: { gap: spacing.sm },
    stepTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    stepBadge: {
        fontSize: 11,
        fontWeight: "700",
        color: colors.mutedForeground,
        backgroundColor: colors.muted,
        borderRadius: radius.x2,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    stepTitle: { fontSize: 16, fontWeight: "700", color: colors.foreground },
    stepDesc: { fontSize: 13, color: colors.mutedForeground, lineHeight: 20 },
    noteCard: {
        flexDirection: "row",
        gap: spacing.md,
        backgroundColor: "#ECFDF5",
        borderColor: "#A7F3D0",
    },
    noteBody: { flex: 1, gap: 4 },
    noteTitle: { fontSize: 15, fontWeight: "700", color: "#065F46" },
    noteText: { fontSize: 13, color: "#047857", lineHeight: 20 },
});
