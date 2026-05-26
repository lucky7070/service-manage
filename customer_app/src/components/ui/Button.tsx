import { ActivityIndicator, Pressable, StyleSheet, Text, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import { colors, radius, shadows } from "../../theme/colors";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive";

type ButtonProps = PressableProps & {
    label: string;
    variant?: ButtonVariant;
    loading?: boolean;
    fullWidth?: boolean;
    style?: StyleProp<ViewStyle>;
};

export default function Button({ label, variant = "primary", loading, fullWidth, style, disabled, ...props }: ButtonProps) {
    return (
        <Pressable
            {...props}
            disabled={disabled || loading}
            style={({ pressed }) => [
                styles.base,
                styles[variant],
                fullWidth && styles.fullWidth,
                (disabled || loading) && styles.disabled,
                pressed && styles.pressed,
                style,
            ]}
        >
            {loading ? <ActivityIndicator color={variant === "primary" ? colors.primaryForeground : colors.primary} /> : <Text style={[styles.label, styles[`${variant}Label` as keyof typeof styles]]}>{label}</Text>}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    base: {
        minHeight: 48,
        borderRadius: radius.xl,
        paddingHorizontal: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    fullWidth: { width: "100%" },
    primary: {
        backgroundColor: colors.primary,
        ...shadows.primaryButton,
    },
    secondary: {
        backgroundColor: colors.secondary,
    },
    outline: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
    },
    ghost: {
        backgroundColor: "transparent",
    },
    destructive: {
        backgroundColor: colors.destructive,
    },
    label: {
        fontSize: 15,
        fontWeight: "700",
        letterSpacing: 0.2,
    },
    primaryLabel: { color: colors.primaryForeground },
    secondaryLabel: { color: colors.secondaryForeground },
    outlineLabel: { color: colors.foreground },
    ghostLabel: { color: colors.primary },
    destructiveLabel: { color: colors.white },
    disabled: { opacity: 0.6 },
    pressed: { opacity: 0.92 },
});
