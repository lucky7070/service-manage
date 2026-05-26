import { StyleSheet, View, type ViewProps } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, radius } from "../../theme/colors";

type IconBoxProps = ViewProps & {
    name: keyof typeof Feather.glyphMap;
    size?: number;
    tone?: "primary" | "muted" | "emerald" | "amber" | "rose";
    large?: boolean;
};

const toneMap = {
    primary: { bg: "rgba(240,116,26,0.12)", fg: colors.primary },
    muted: { bg: colors.muted, fg: colors.mutedForeground },
    emerald: { bg: "#ECFDF5", fg: colors.emerald },
    amber: { bg: colors.amberBg, fg: colors.amber },
    rose: { bg: "#FFF1F2", fg: colors.rose },
};

export default function IconBox({ name, size = 18, tone = "primary", large, style, ...props }: IconBoxProps) {
    const palette = toneMap[tone];
    return (
        <View style={[styles.box, large && styles.boxLarge, { backgroundColor: palette.bg }, style]} {...props}>
            <Feather name={name} size={size} color={palette.fg} />
        </View>
    );
}

const styles = StyleSheet.create({
    box: {
        width: 40,
        height: 40,
        borderRadius: radius.lg,
        alignItems: "center",
        justifyContent: "center",
    },
    boxLarge: {
        width: 48,
        height: 48,
        borderRadius: radius.xl,
    },
});
