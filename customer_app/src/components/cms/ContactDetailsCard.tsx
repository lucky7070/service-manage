import { StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import type { GeneralSettings } from "../../api/types";
import Card from "../ui/Card";
import { colors, radius, spacing } from "../../theme/colors";

type ContactDetailsCardProps = {
    settings: GeneralSettings | null;
    title?: string;
    description?: string;
};

export default function ContactDetailsCard({
    settings,
    title = "Contact us",
    description = "Reach our support team using the details below.",
}: ContactDetailsCardProps) {
    if (!settings?.email && !settings?.phone && !settings?.address) return null;

    const rows = [
        settings.phone ? { icon: "phone" as const, label: "Phone", value: settings.phone } : null,
        settings.email ? { icon: "mail" as const, label: "Email", value: settings.email } : null,
        settings.address ? { icon: "map-pin" as const, label: "Address", value: settings.address } : null,
    ].filter(Boolean) as Array<{ icon: keyof typeof Feather.glyphMap; label: string; value: string }>;

    return (
        <Card elevated style={styles.card}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
            <View style={styles.list}>
                {rows.map((row) => <View key={row.label} style={styles.row}>
                    <View style={styles.iconWrap}>
                        <Feather name={row.icon} size={16} color={colors.primary} />
                    </View>
                    <View style={styles.copy}>
                        <Text style={styles.label}>{row.label}</Text>
                        <Text style={styles.value}>{row.value}</Text>
                    </View>
                </View>)}
            </View>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: { gap: spacing.sm },
    title: { fontSize: 17, fontWeight: "800", color: colors.foreground },
    description: { fontSize: 13, color: colors.mutedForeground, lineHeight: 20 },
    list: { gap: spacing.sm, marginTop: spacing.sm },
    row: {
        flexDirection: "row",
        gap: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.x2,
        backgroundColor: colors.background,
        padding: spacing.md,
    },
    iconWrap: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: "rgba(240,116,26,0.1)",
        alignItems: "center",
        justifyContent: "center",
    },
    copy: { flex: 1, gap: 2 },
    label: { fontSize: 11, fontWeight: "700", color: colors.mutedForeground, textTransform: "uppercase" },
    value: { fontSize: 14, fontWeight: "600", color: colors.foreground, lineHeight: 20 },
});
