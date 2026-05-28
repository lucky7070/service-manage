import { type ReactNode } from "react";
import { StyleSheet, Text, View, type ViewProps } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radius, spacing } from "../../theme/colors";
import { typography } from "../../theme/colors";

type PageHeroProps = ViewProps & {
    eyebrow?: string;
    title: string;
    subtitle?: string;
    footer?: ReactNode;
};

export default function PageHero({ eyebrow, title, subtitle, footer, style, ...props }: PageHeroProps) {
    return (
        <LinearGradient colors={["#FF8C3A", colors.primary, colors.primaryDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.hero, style]} {...props}>
            <View style={styles.decorA} />
            <View style={styles.decorB} />
            <View style={styles.decorC} />
            <View style={styles.content}>
                {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
                <Text style={styles.title}>{title}</Text>
                {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
                {footer}
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    hero: {
        borderRadius: radius.x3,
        padding: spacing.xl,
        marginBottom: spacing.lg,
        overflow: "hidden",
    },
    decorA: {
        position: "absolute",
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: "rgba(255,255,255,0.08)",
        top: -40,
        right: -20,
    },
    decorB: {
        position: "absolute",
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "rgba(255,255,255,0.06)",
        bottom: 12,
        right: 48,
    },
    decorC: {
        position: "absolute",
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: "rgba(255,255,255,0.05)",
        top: 28,
        left: 16,
    },
    content: { gap: 6, zIndex: 1 },
    eyebrow: { color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: "600" },
    title: { ...typography.hero, color: colors.white },
    subtitle: { color: "rgba(255,255,255,0.88)", fontSize: 14, lineHeight: 21, maxWidth: "92%" },
});
