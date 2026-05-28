import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, radius, spacing } from "../../theme/colors";

type SearchFieldProps = TextInputProps & {
    onGo?: () => void;
    goLabel?: string;
};

export default function SearchField({ onGo, goLabel = "Go", style, ...props }: SearchFieldProps) {
    return (
        <View style={[styles.row, style]}>
            <Feather name="search" size={16} color={colors.mutedForeground} />
            <TextInput
                {...props}
                placeholderTextColor={colors.mutedForeground}
                style={styles.input}
            />
            {onGo ? (
                <Pressable onPress={onGo} style={styles.goBtn}>
                    <Text style={styles.goText}>{goLabel}</Text>
                </Pressable>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.x2,
        backgroundColor: colors.background,
        paddingHorizontal: spacing.md,
        marginBottom: spacing.md,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: colors.foreground,
        paddingVertical: 12,
    },
    goBtn: {
        backgroundColor: colors.primary,
        borderRadius: radius.lg,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    goText: {
        color: colors.white,
        fontWeight: "700",
        fontSize: 13,
    },
});
