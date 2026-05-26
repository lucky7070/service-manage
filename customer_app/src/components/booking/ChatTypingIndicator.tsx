import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../../theme/colors";

export default function ChatTypingIndicator({ label }: { label: string }) {
    return (
        <View style={styles.wrap} accessibilityLiveRegion="polite">
            <Text style={styles.label}>{label}</Text>
            <View style={styles.dots}>
                <View style={[styles.dot, styles.dot1]} />
                <View style={[styles.dot, styles.dot2]} />
                <View style={[styles.dot, styles.dot3]} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingVertical: 4 },
    label: { fontSize: 12, color: colors.mutedForeground },
    dots: { flexDirection: "row", alignItems: "center", gap: 4 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.mutedForeground, opacity: 0.5 },
    dot1: { opacity: 1 },
    dot2: { opacity: 0.75 },
    dot3: { opacity: 0.5 },
});
