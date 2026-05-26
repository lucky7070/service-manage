import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import { colors, radius } from "../../theme/colors";

type TextareaProps = TextInputProps & {
    label?: string;
    error?: string;
};

export default function Textarea({ label, error, style, ...props }: TextareaProps) {
    return (
        <View style={styles.wrap}>
            {label ? <Text style={styles.label}>{label}</Text> : null}
            <TextInput
                {...props}
                multiline
                textAlignVertical="top"
                placeholderTextColor={colors.mutedForeground}
                style={[styles.input, error ? styles.inputError : null, style]}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { gap: 6 },
    label: { fontSize: 14, fontWeight: "600", color: colors.mutedForeground },
    input: {
        minHeight: 96,
        borderRadius: radius.xl,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 15,
        color: colors.foreground,
        lineHeight: 22,
    },
    inputError: { borderColor: colors.destructive },
    error: { fontSize: 12, color: colors.rose },
});
