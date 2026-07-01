import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius, shadows, spacing } from "../../theme/colors";

type VerificationDetails = {
    isPanCardVerified: boolean;
    isAadharVerified: boolean;
    isPoliceVerificationVerified: boolean;
};

type VerificationItem = {
    key: keyof VerificationDetails;
    label: string;
    description: string;
};

const VERIFICATION_ITEMS: VerificationItem[] = [
    {
        key: "isPanCardVerified",
        label: "PAN card",
        description: "Identity verified with a valid PAN card.",
    },
    {
        key: "isAadharVerified",
        label: "Aadhar",
        description: "Identity verified with a valid Aadhar number.",
    },
    {
        key: "isPoliceVerificationVerified",
        label: "Police verification",
        description: "Background check document submitted and reviewed.",
    },
];

type VerifiedProfessionalBadgeProps = {
    verification: VerificationDetails;
};

export default function VerifiedProfessionalBadge({ verification }: VerifiedProfessionalBadgeProps) {
    const insets = useSafeAreaInsets();
    const [open, setOpen] = useState(false);
    const verifiedCount = VERIFICATION_ITEMS.filter((item) => verification[item.key]).length;

    return (
        <>
            <Pressable
                onPress={() => setOpen(true)}
                style={({ pressed }) => [styles.badge, pressed && styles.badgePressed]}
                accessibilityRole="button"
                accessibilityLabel="View verification details"
            >
                <Feather name="check-circle" size={14} color={colors.emerald} />
                <Text style={styles.badgeText}>Verified professional</Text>
            </Pressable>

            <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
                <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
                    <Pressable
                        style={[styles.dialog, { marginBottom: insets.bottom + spacing.lg }]}
                        onPress={(event) => event.stopPropagation()}
                    >
                        <View style={styles.dialogHeader}>
                            <View style={styles.dialogTitleRow}>
                                <Feather name="shield" size={20} color={colors.emerald} />
                                <Text style={styles.dialogTitle}>Verification details</Text>
                            </View>
                            <Pressable
                                onPress={() => setOpen(false)}
                                hitSlop={8}
                                accessibilityRole="button"
                                accessibilityLabel="Close"
                            >
                                <Feather name="x" size={22} color={colors.mutedForeground} />
                            </Pressable>
                        </View>
                        <Text style={styles.dialogDescription}>
                            {verifiedCount} of {VERIFICATION_ITEMS.length} checks completed for this professional.
                        </Text>
                        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
                            {VERIFICATION_ITEMS.map((item) => {
                                const isVerified = verification[item.key];
                                return (
                                    <View
                                        key={item.key}
                                        style={[styles.item, isVerified ? styles.itemVerified : styles.itemPending]}
                                    >
                                        <Feather
                                            name={isVerified ? "check-circle" : "x-circle"}
                                            size={20}
                                            color={isVerified ? colors.emerald : colors.mutedForeground}
                                        />
                                        <View style={styles.itemBody}>
                                            <Text style={[styles.itemLabel, isVerified ? styles.itemLabelVerified : null]}>
                                                {item.label} {isVerified ? "verified" : "not verified"}
                                            </Text>
                                            <Text style={styles.itemDescription}>{item.description}</Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </ScrollView>
                    </Pressable>
                </Pressable>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    badge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginTop: 4,
        alignSelf: "flex-start",
        borderRadius: radius.x2,
        paddingHorizontal: 2,
        paddingVertical: 2,
    },
    badgePressed: { opacity: 0.7 },
    badgeText: { fontSize: 12, fontWeight: "700", color: colors.emerald },
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.45)",
        justifyContent: "center",
        paddingHorizontal: spacing.lg,
    },
    dialog: {
        backgroundColor: colors.card,
        borderRadius: radius.x2,
        padding: spacing.lg,
        maxHeight: "80%",
        ...shadows.card,
    },
    dialogHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: spacing.sm,
    },
    dialogTitleRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, flex: 1 },
    dialogTitle: { fontSize: 18, fontWeight: "800", color: colors.foreground },
    dialogDescription: {
        fontSize: 13,
        color: colors.mutedForeground,
        lineHeight: 20,
        marginBottom: spacing.md,
    },
    list: { gap: spacing.sm },
    item: {
        flexDirection: "row",
        gap: spacing.sm,
        borderRadius: radius.lg,
        borderWidth: 1,
        padding: spacing.md,
        marginBottom: spacing.sm,
    },
    itemVerified: {
        borderColor: "#BBF7D0",
        backgroundColor: "#F0FDF4",
    },
    itemPending: {
        borderColor: colors.border,
        backgroundColor: colors.muted,
    },
    itemBody: { flex: 1, gap: 2 },
    itemLabel: { fontSize: 14, fontWeight: "700", color: colors.foreground },
    itemLabelVerified: { color: "#065F46" },
    itemDescription: { fontSize: 12, lineHeight: 18, color: colors.mutedForeground },
});
