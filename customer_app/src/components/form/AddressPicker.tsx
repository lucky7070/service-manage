import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { fetchAddresses, type AddressRow } from "../../api";
import { colors, radius, spacing } from "../../theme/colors";

type AddressPickerProps = {
    value: string;
    onChange: (addressId: string) => void;
    error?: string;
    onAddAddress?: () => void;
};

export default function AddressPicker({ value, onChange, error, onAddAddress }: AddressPickerProps) {
    const [rows, setRows] = useState<AddressRow[]>([]);
    const [loading, setLoading] = useState(true);

    const autoSelectedRef = useRef(false);

    useEffect(() => {
        void (async () => {
            setLoading(true);
            try {
                const response = await fetchAddresses();
                if (response.status && Array.isArray(response.data)) {
                    setRows(response.data);
                    if (!autoSelectedRef.current) {
                        const defaultRow = response.data.find((row) => row.isDefault) || response.data[0];
                        if (defaultRow?._id) {
                            autoSelectedRef.current = true;
                            onChange(defaultRow._id);
                        }
                    }
                }
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading) {
        return <View style={styles.loader}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.loaderText}>Loading addresses…</Text>
        </View>
    }

    if (!rows.length) {
        return <View style={styles.emptyBox}>
            <Feather name="home" size={18} color={colors.amber} />
            <Text style={styles.emptyText}>Add a service address before booking.</Text>
            {onAddAddress ? (
                <Pressable onPress={onAddAddress} style={styles.addBtn}>
                    <Text style={styles.addBtnText}>Add address</Text>
                </Pressable>
            ) : null}
        </View>
    }

    return <View style={styles.wrap}>
        {rows.map((row) => {
            const selected = value === row._id;
            return (
                <Pressable key={row._id} onPress={() => onChange(row._id)} style={[styles.row, selected && styles.rowSelected]}>
                    <View style={styles.rowMain}>
                        <Text style={styles.line1}>{row.addressLine1}</Text>
                        <Text style={styles.line2}>
                            {[row.cityName, row.pincode].filter(Boolean).join(" · ")}
                        </Text>
                    </View>
                    {selected ? <Feather name="check-circle" size={18} color={colors.primary} /> : null}
                </Pressable>
            );
        })}
        {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
}

const styles = StyleSheet.create({
    wrap: { gap: spacing.sm },
    loader: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingVertical: spacing.md },
    loaderText: { fontSize: 13, color: colors.mutedForeground },
    emptyBox: {
        borderWidth: 1,
        borderColor: colors.amberRing,
        backgroundColor: colors.amberBg,
        borderRadius: radius.x2,
        padding: spacing.md,
        gap: spacing.sm,
    },
    emptyText: { fontSize: 13, color: colors.amber, lineHeight: 20 },
    addBtn: {
        alignSelf: "flex-start",
        backgroundColor: colors.primary,
        borderRadius: radius.lg,
        paddingHorizontal: spacing.md,
        paddingVertical: 8,
    },
    addBtnText: { color: colors.white, fontSize: 13, fontWeight: "700" },
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.xl,
        backgroundColor: colors.background,
        padding: spacing.md,
    },
    rowSelected: { borderColor: colors.primary, backgroundColor: "rgba(240,116,26,0.06)" },
    rowMain: { flex: 1, gap: 2 },
    line1: { fontSize: 14, fontWeight: "700", color: colors.foreground },
    line2: { fontSize: 12, color: colors.mutedForeground },
    error: { fontSize: 12, color: colors.rose },
});
