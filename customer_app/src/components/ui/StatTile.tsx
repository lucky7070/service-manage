import { StyleSheet, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import Card from "./Card";
import IconBox from "./IconBox";
import { colors, spacing } from "../../theme/colors";
import { typography } from "../../theme/colors";

type StatTileProps = {
    label: string;
    value: number | string;
    icon: keyof typeof Feather.glyphMap;
    tone?: "primary" | "emerald" | "amber" | "rose" | "muted";
};

export default function StatTile({ label, value, icon, tone = "primary" }: StatTileProps) {
    return (
        <Card style={styles.tile} elevated>
            <IconBox name={icon} tone={tone} />
            <Text style={styles.value}>{value}</Text>
            <Text style={styles.label}>{label}</Text>
        </Card>
    );
}

const styles = StyleSheet.create({
    tile: {
        width: "47%",
        flexGrow: 1,
        padding: spacing.lg,
        gap: spacing.sm,
    },
    value: { ...typography.stat, color: colors.foreground, marginTop: 2 },
    label: { fontSize: 12, fontWeight: "600", color: colors.mutedForeground, lineHeight: 16 },
});
