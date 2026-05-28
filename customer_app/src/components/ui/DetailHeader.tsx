import { Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, shadows, spacing } from "../../theme/colors";

type DetailHeaderProps = {
    title: string;
    subtitle?: string;
    onBack: () => void;
};

export default function DetailHeader({ title, subtitle, onBack }: DetailHeaderProps) {
    const insets = useSafeAreaInsets();

    return (
        <>
            <View style={[styles.wrap, { paddingTop: insets.top + spacing.sm }]}>
                <Pressable onPress={onBack} style={styles.backBtn} hitSlop={8}>
                    <Feather name="arrow-left" size={20} color={colors.foreground} />
                </Pressable>
                <View style={styles.text}>
                    <Text style={styles.title} numberOfLines={1}>{title}</Text>
                    {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
                </View>
                <View style={styles.spacer} />
            </View>
            <View style={styles.accent} />
        </>
    );
}

const styles = StyleSheet.create({
    wrap: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.md,
        backgroundColor: colors.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        ...shadows.card,
        shadowOpacity: 0.06,
        elevation: 2,
        zIndex: 1,
    },
    accent: {
        height: 3,
        backgroundColor: colors.primary,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: colors.muted,
        alignItems: "center",
        justifyContent: "center",
    },
    text: { flex: 1, gap: 2 },
    title: { fontSize: 18, fontWeight: "800", color: colors.foreground },
    subtitle: { fontSize: 13, color: colors.mutedForeground },
    spacer: { width: 40 },
});
