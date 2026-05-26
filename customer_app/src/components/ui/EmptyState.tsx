import { StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, radius, spacing } from "../../theme/colors";

type EmptyStateProps = {
    icon?: keyof typeof Feather.glyphMap;
    title: string;
    message?: string;
};

export default function EmptyState({ icon = "inbox", title, message }: EmptyStateProps) {
    return (
        <View style={styles.wrap}>
            <View style={styles.iconWrap}>
                <Feather name={icon} size={28} color={colors.primary} />
            </View>
            <Text style={styles.title}>{title}</Text>
            {message ? <Text style={styles.message}>{message}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        alignItems: "center",
        paddingVertical: spacing.x2,
        paddingHorizontal: spacing.lg,
        gap: spacing.sm,
    },
    iconWrap: {
        width: 64,
        height: 64,
        borderRadius: radius.x2,
        backgroundColor: "rgba(240,116,26,0.1)",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: spacing.sm,
    },
    title: {
        fontSize: 16,
        fontWeight: "700",
        color: colors.foreground,
        textAlign: "center",
    },
    message: {
        fontSize: 14,
        color: colors.mutedForeground,
        textAlign: "center",
        lineHeight: 20,
    },
});
