import { StyleSheet, View, type ViewProps } from "react-native";
import { colors, radius, shadows } from "../../theme/colors";

type CardProps = ViewProps & {
    large?: boolean;
    elevated?: boolean;
    flat?: boolean;
};

export default function Card({ large, elevated, flat, style, ...props }: CardProps) {
    return (
        <View
            {...props}
            style={[
                styles.card,
                large && styles.large,
                elevated && styles.elevated,
                flat && styles.flat,
                style,
            ]}
        />
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.card,
        borderRadius: radius.x2,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 20,
    },
    large: {
        borderRadius: radius.x3,
        padding: 24,
    },
    elevated: {
        ...shadows.card,
        borderColor: "rgba(232,231,230,0.8)",
    },
    flat: {
        backgroundColor: colors.muted,
        borderColor: "transparent",
    },
});
