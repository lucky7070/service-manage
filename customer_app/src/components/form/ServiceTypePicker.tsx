import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../../theme/colors";
import { useMaxListHeight } from "../../helpers/useMaxListHeight";

export type ServiceTypeOption = {
    id: string;
    name: string;
    description?: string | null;
    price?: number | null;
    estimatedTimeMinutes?: number | null;
};

type ServiceTypePickerProps = {
    items: ServiceTypeOption[];
    selectedIds: string[];
    onToggle: (id: string) => void;
    error?: string;
    emptyLabel?: string;
};

export default function ServiceTypePicker({ items, selectedIds, onToggle, error, emptyLabel = "No services available." }: ServiceTypePickerProps) {
    const listMaxHeight = useMaxListHeight();
    if (!items.length) {
        return <Text style={styles.empty}>{emptyLabel}</Text>;
    }

    return (
        <View style={styles.wrap}>
            <ScrollView
                style={{ maxHeight: listMaxHeight }}
                contentContainerStyle={styles.grid}
                nestedScrollEnabled
                showsVerticalScrollIndicator
                keyboardShouldPersistTaps="handled"
            >
                {items.map((item) => {
                    const checked = selectedIds.includes(item.id);
                    return (
                        <Pressable
                            key={item.id}
                            onPress={() => onToggle(item.id)}
                            style={[styles.card, checked && styles.cardChecked]}
                        >
                            <View style={styles.cardTop}>
                                <Text style={styles.name}>{item.name}</Text>
                                {item.price != null ? (
                                    <Text style={styles.price}>₹{Number(item.price).toLocaleString("en-IN")}</Text>
                                ) : null}
                            </View>
                            {item.description ? <Text style={styles.desc} numberOfLines={2}>{item.description}</Text> : null}
                            {item.estimatedTimeMinutes ? (
                                <Text style={styles.meta}>~{item.estimatedTimeMinutes} min</Text>
                            ) : null}
                        </Pressable>
                    );
                })}
            </ScrollView>
            {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { gap: spacing.sm },
    grid: { gap: spacing.sm },
    card: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.x2,
        backgroundColor: colors.background,
        padding: spacing.md,
        gap: 4,
    },
    cardChecked: {
        borderColor: colors.primary,
        backgroundColor: "rgba(240,116,26,0.08)",
    },
    cardTop: { flexDirection: "row", justifyContent: "space-between", gap: spacing.sm, alignItems: "flex-start" },
    name: { flex: 1, fontSize: 15, fontWeight: "700", color: colors.foreground },
    price: { fontSize: 14, fontWeight: "800", color: colors.primary },
    desc: { fontSize: 12, color: colors.mutedForeground, lineHeight: 18 },
    meta: { fontSize: 11, fontWeight: "600", color: colors.mutedForeground },
    empty: { fontSize: 14, color: colors.mutedForeground, paddingVertical: spacing.md },
    error: { fontSize: 12, color: colors.rose },
});
