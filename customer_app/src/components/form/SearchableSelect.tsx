import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, radius, spacing } from "../../theme/colors";

export type SearchOption = {
    value: string;
    label: string;
    slug?: string;
};

type SearchableSelectProps = {
    label: string;
    placeholder?: string;
    value: SearchOption | null;
    onChange: (option: SearchOption | null) => void;
    loadOptions: (query: string) => Promise<SearchOption[]>;
    error?: string;
    required?: boolean;
    icon?: keyof typeof Feather.glyphMap;
};

export default function SearchableSelect({
    label,
    placeholder = "Search…",
    value,
    onChange,
    loadOptions,
    error,
    required,
    icon = "search",
}: SearchableSelectProps) {
    const [query, setQuery] = useState(value?.label || "");
    const [options, setOptions] = useState<SearchOption[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        setQuery(value?.label || "");
    }, [value?.value, value?.label]);

    useEffect(() => {
        if (!open) return;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            void (async () => {
                setLoading(true);
                try {
                    const rows = await loadOptions(query.trim());
                    setOptions(rows);
                } finally {
                    setLoading(false);
                }
            })();
        }, 250);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [open, query, loadOptions]);

    const onSelect = (option: SearchOption) => {
        onChange(option);
        setQuery(option.label);
        setOpen(false);
    };

    return (
        <View style={styles.wrap}>
            <Text style={styles.label}>
                {label}
                {required ? <Text style={styles.required}> *</Text> : null}
            </Text>
            <View style={[styles.field, error ? styles.fieldError : null]}>
                <Feather name={icon} size={16} color={colors.mutedForeground} />
                <TextInput
                    value={query}
                    onChangeText={(text) => {
                        setQuery(text);
                        if (value && text !== value.label) onChange(null);
                        setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    placeholder={placeholder}
                    placeholderTextColor={colors.mutedForeground}
                    style={styles.input}
                />
                {value ? (
                    <Pressable onPress={() => { onChange(null); setQuery(""); setOpen(true); }} hitSlop={8}>
                        <Feather name="x-circle" size={18} color={colors.mutedForeground} />
                    </Pressable>
                ) : null}
            </View>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {open ? (
                <View style={styles.dropdown}>
                    {loading ? (
                        <View style={styles.loader}><ActivityIndicator color={colors.primary} /></View>
                    ) : options.length ? (
                        <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled style={styles.list}>
                            {options.map((option) => (
                                <Pressable key={option.value} onPress={() => onSelect(option)} style={styles.option}>
                                    <Text style={styles.optionText}>{option.label}</Text>
                                </Pressable>
                            ))}
                        </ScrollView>
                    ) : (
                        <Text style={styles.empty}>No matches found.</Text>
                    )}
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { gap: 6, zIndex: 1 },
    label: { fontSize: 14, fontWeight: "600", color: colors.mutedForeground },
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
        gap: 8,
    },
    fieldError: { borderColor: colors.destructive },
    input: { flex: 1, fontSize: 16, color: colors.foreground, paddingVertical: 10 },
    error: { fontSize: 12, color: colors.rose },
    dropdown: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.lg,
        backgroundColor: colors.card,
        maxHeight: 180,
        overflow: "hidden",
    },
    list: { maxHeight: 180 },
    option: { paddingHorizontal: spacing.md, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
    optionText: { fontSize: 14, color: colors.foreground },
    empty: { padding: spacing.md, fontSize: 13, color: colors.mutedForeground },
    loader: { padding: spacing.md, alignItems: "center" },
});
