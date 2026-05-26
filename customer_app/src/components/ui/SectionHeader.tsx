import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../../theme/colors";
import { typography } from "../../theme/colors";

type SectionHeaderProps = {
    title: string;
    subtitle?: string;
    actionLabel?: string;
    onAction?: () => void;
};

export default function SectionHeader({ title, subtitle, actionLabel, onAction }: SectionHeaderProps) {
    return (
        <View style={styles.wrap}>
            <View style={styles.text}>
                <Text style={styles.title}>{title}</Text>
                {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
            {actionLabel && onAction ? (
                <Pressable onPress={onAction} hitSlop={8}>
                    <Text style={styles.action}>{actionLabel}</Text>
                </Pressable>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    text: { flex: 1, gap: 4 },
    title: { ...typography.title, color: colors.foreground },
    subtitle: { ...typography.body, color: colors.mutedForeground },
    action: { color: colors.primary, fontSize: 14, fontWeight: "700", marginTop: 4 },
});
