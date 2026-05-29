import { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Feather } from "@expo/vector-icons";
import { formatPickerDate, parseDate, toApiDate } from "../../helpers/date";
import { colors, radius, spacing } from "../../theme/colors";

type DateFieldProps = {
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    placeholder?: string;
    minimumDate?: Date;
    maximumDate?: Date;
    clearable?: boolean;
};

function toPickerDate(value: string) {
    return parseDate(value)?.toDate() ?? null;
}

export default function DateField({
    label,
    value,
    onChange,
    error,
    placeholder = "Select date",
    minimumDate,
    maximumDate,
    clearable = false,
}: DateFieldProps) {
    const [show, setShow] = useState(false);
    const selected = toPickerDate(value);

    const onPickerChange = (event: DateTimePickerEvent, picked?: Date) => {
        if (event.type === "dismissed") {
            setShow(false);
            return;
        }
        if (!picked) return;

        onChange(toApiDate(picked));
        if (Platform.OS === "android") setShow(false);
    };

    return (
        <View style={styles.wrap}>
            <Text style={styles.label}>{label}</Text>
            <View style={[styles.field, error ? styles.fieldError : null]}>
                <Pressable onPress={() => setShow(true)} style={styles.fieldMain}>
                    <Feather name="calendar" size={16} color={colors.primary} />
                    <Text style={[styles.value, !selected && styles.placeholder]}>
                        {selected ? formatPickerDate(selected) : placeholder}
                    </Text>
                </Pressable>
                {clearable && value ? (
                    <Pressable onPress={() => onChange("")} hitSlop={8} accessibilityLabel="Clear date">
                        <Feather name="x" size={16} color={colors.mutedForeground} />
                    </Pressable>
                ) : (
                    <Feather name="chevron-down" size={16} color={colors.mutedForeground} />
                )}
            </View>
            {error ? <Text style={styles.error}>{error}</Text> : null}

            {show ? (
                <DateTimePicker
                    value={selected || maximumDate || new Date()}
                    mode="date"
                    minimumDate={minimumDate}
                    maximumDate={maximumDate}
                    onChange={onPickerChange}
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                />
            ) : null}

            {show && Platform.OS === "ios" ? (
                <View style={styles.iosActions}>
                    <Pressable onPress={() => setShow(false)} style={styles.iosBtn}>
                        <Text style={styles.iosBtnText}>Done</Text>
                    </Pressable>
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { gap: 6 },
    label: { fontSize: 14, fontWeight: "600", color: colors.mutedForeground },
    field: {
        minHeight: 44,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: spacing.md,
        gap: spacing.sm,
    },
    fieldMain: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        minHeight: 42,
    },
    fieldError: { borderColor: colors.destructive },
    value: { flex: 1, fontSize: 15, color: colors.foreground },
    placeholder: { color: colors.mutedForeground },
    error: { fontSize: 12, color: colors.rose },
    iosActions: { flexDirection: "row", justifyContent: "flex-end" },
    iosBtn: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
    iosBtnText: { fontSize: 15, fontWeight: "700", color: colors.primary },
});
