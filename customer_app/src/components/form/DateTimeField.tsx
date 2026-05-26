import { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Feather } from "@expo/vector-icons";
import { formatPickerDateTime } from "../../helpers/date";
import { colors, radius, spacing } from "../../theme/colors";

type DateTimeFieldProps = {
    label: string;
    value: Date | null;
    onChange: (date: Date) => void;
    error?: string;
    minimumDate?: Date;
};

export default function DateTimeField({ label, value, onChange, error, minimumDate }: DateTimeFieldProps) {
    const [show, setShow] = useState(false);
    const [mode, setMode] = useState<"date" | "time">("date");
    const [draft, setDraft] = useState<Date>(value || new Date());

    const openPicker = () => {
        setDraft(value || new Date());
        setMode("date");
        setShow(true);
    };

    const onPickerChange = (event: DateTimePickerEvent, selected?: Date) => {
        if (event.type === "dismissed") {
            setShow(false);
            return;
        }
        if (!selected) return;

        if (Platform.OS === "android") {
            if (mode === "date") {
                const next = new Date(selected);
                if (value) {
                    next.setHours(value.getHours(), value.getMinutes(), 0, 0);
                }
                setDraft(next);
                setMode("time");
                return;
            }
            const finalDate = new Date(draft);
            finalDate.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
            onChange(finalDate);
            setShow(false);
            setMode("date");
            return;
        }

        onChange(selected);
    };

    return (
        <View style={styles.wrap}>
            <Text style={styles.label}>{label}</Text>
            <Pressable onPress={openPicker} style={[styles.field, error ? styles.fieldError : null]}>
                <Feather name="calendar" size={16} color={colors.primary} />
                <Text style={[styles.value, !value && styles.placeholder]}>{formatPickerDateTime(value)}</Text>
                <Feather name="chevron-down" size={16} color={colors.mutedForeground} />
            </Pressable>
            {error ? <Text style={styles.error}>{error}</Text> : null}

            {show ? (
                <DateTimePicker
                    value={Platform.OS === "android" && mode === "time" ? draft : (value || draft)}
                    mode={Platform.OS === "ios" ? "datetime" : mode}
                    minimumDate={minimumDate}
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
    fieldError: { borderColor: colors.destructive },
    value: { flex: 1, fontSize: 15, color: colors.foreground },
    placeholder: { color: colors.mutedForeground },
    error: { fontSize: 12, color: colors.rose },
    iosActions: { flexDirection: "row", justifyContent: "flex-end" },
    iosBtn: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
    iosBtnText: { fontSize: 15, fontWeight: "700", color: colors.primary },
});
