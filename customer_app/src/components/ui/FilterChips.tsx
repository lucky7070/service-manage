import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { colors, radius, spacing } from "../../theme/colors";

export type FilterChip = { value: string; label: string };

type FilterChipsProps = {
    items: FilterChip[];
    value: string;
    onChange: (value: string) => void;
};

export default function FilterChips({ items, value, onChange }: FilterChipsProps) {
    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
            {items.map((item) => {
                const active = value === item.value;
                return (
                    <Pressable
                        key={item.value || "all"}
                        onPress={() => onChange(item.value)}
                        style={[styles.chip, active && styles.chipActive]}
                    >
                        <Text style={[styles.chipText, active && styles.chipTextActive]}>{item.label}</Text>
                    </Pressable>
                );
            })}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    row: { gap: 8, paddingBottom: spacing.lg },
    chip: {
        borderRadius: radius.x2,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
        paddingHorizontal: 14,
        paddingVertical: 9,
    },
    chipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 3,
    },
    chipText: {
        fontSize: 13,
        fontWeight: "700",
        color: colors.mutedForeground,
        textTransform: "capitalize",
    },
    chipTextActive: { color: colors.white },
});
