import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, radius } from "../../theme/colors";

type InputProps = TextInputProps & {
    label?: string;
    error?: string;
    icon?: keyof typeof Feather.glyphMap;
    required?: boolean;
};

export default function Input({ label, error, icon, required, style, ...props }: InputProps) {
    return (
        <View style={styles.wrap}>
            {label ? (
                <Text style={styles.label}>
                    {label}
                    {required ? <Text style={styles.required}> *</Text> : null}
                </Text>
            ) : null}
            <View style={[styles.field, error ? styles.fieldError : null]}>
                {icon ? <Feather name={icon} size={16} color={colors.mutedForeground} style={styles.icon} /> : null}
                <TextInput
                    {...props}
                    placeholderTextColor={colors.mutedForeground}
                    style={[styles.input, icon ? styles.inputWithIcon : null, style]}
                />
            </View>
            {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { gap: 6 },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.mutedForeground,
    },
    required: { color: colors.rose },
    field: {
        minHeight: 44,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
    },
    fieldError: {
        borderColor: colors.destructive,
    },
    icon: { marginRight: 8 },
    input: {
        flex: 1,
        fontSize: 16,
        color: colors.foreground,
        paddingVertical: 10,
    },
    inputWithIcon: { paddingLeft: 0 },
    error: {
        fontSize: 12,
        color: colors.rose,
    },
});
