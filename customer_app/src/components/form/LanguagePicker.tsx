import { Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, radius, shadows, spacing } from "../../theme/colors";

export type LanguageValue = "en" | "hi";

type LanguageOption = {
    value: LanguageValue;
    label: string;
    native: string;
    short: string;
    description: string;
};

const options: LanguageOption[] = [
    { value: "en", label: "English", native: "English", short: "EN", description: "App content in English" },
    { value: "hi", label: "Hindi", native: "हिंदी", short: "HI", description: "ऐप की सामग्री हिंदी में" },
];

type LanguagePickerProps = {
    label?: string;
    value: LanguageValue;
    onChange: (value: LanguageValue) => void;
    error?: string;
};

export default function LanguagePicker({ label = "Preferred language", value, onChange, error }: LanguagePickerProps) {
    return (
        <View style={styles.wrap}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.list}>
                {options.map((option, index) => {
                    const active = value === option.value;
                    return (
                        <Pressable
                            key={option.value}
                            onPress={() => onChange(option.value)}
                            style={[
                                styles.option,
                                index === 0 && styles.optionFirst,
                                index === options.length - 1 && styles.optionLast,
                                active && styles.optionActive,
                                error && !active ? styles.optionError : null,
                            ]}
                        >
                            <View style={[styles.badge, active && styles.badgeActive]}>
                                <Text style={[styles.badgeText, active && styles.badgeTextActive]}>{option.short}</Text>
                            </View>
                            <View style={styles.copy}>
                                <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>{option.label}</Text>
                                <Text style={styles.optionNative}>{option.native}</Text>
                                <Text style={styles.optionDesc}>{option.description}</Text>
                            </View>
                            <View style={[styles.radio, active && styles.radioActive]}>
                                {active ? <Feather name="check" size={14} color={colors.white} /> : null}
                            </View>
                        </Pressable>
                    );
                })}
            </View>
            {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { gap: 8 },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.mutedForeground,
    },
    list: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.x2,
        overflow: "hidden",
        backgroundColor: colors.background,
    },
    option: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.background,
    },
    optionFirst: {},
    optionLast: {
        borderBottomWidth: 0,
    },
    optionActive: {
        backgroundColor: "rgba(240,116,26,0.06)",
        borderBottomColor: "rgba(240,116,26,0.15)",
    },
    optionError: {
        borderColor: colors.destructive,
    },
    badge: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: colors.muted,
        alignItems: "center",
        justifyContent: "center",
    },
    badgeActive: {
        backgroundColor: colors.primary,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: "800",
        color: colors.mutedForeground,
    },
    badgeTextActive: {
        color: colors.white,
    },
    copy: {
        flex: 1,
        gap: 1,
    },
    optionLabel: {
        fontSize: 15,
        fontWeight: "700",
        color: colors.foreground,
    },
    optionLabelActive: {
        color: colors.primary,
    },
    optionNative: {
        fontSize: 13,
        fontWeight: "600",
        color: colors.mutedForeground,
    },
    optionDesc: {
        fontSize: 11,
        color: colors.mutedForeground,
        marginTop: 2,
    },
    radio: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: colors.border,
        alignItems: "center",
        justifyContent: "center",
    },
    radioActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
        ...shadows.card,
        shadowColor: colors.primary,
        shadowOpacity: 0.25,
    },
    error: {
        fontSize: 12,
        color: colors.destructive,
    },
});
