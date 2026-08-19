import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { fetchAddresses, type AddressRow } from "../../api";
import { colors, radius, spacing } from "../../theme/colors";

type AddressPickerProps = {
    value: string;
    onChange: (addressId: string, address?: AddressRow) => void;
    error?: string;
    onAddAddress?: () => void;
    onAddressesLoaded?: (rows: AddressRow[]) => void;
    reloadTrigger?: number;
};

export default function AddressPicker({ value, onChange, error, onAddAddress, onAddressesLoaded, reloadTrigger = 0 }: AddressPickerProps) {
    const [rows, setRows] = useState<AddressRow[]>([]);
    const [loading, setLoading] = useState(true);
    const previousIdsRef = useRef<string[]>([]);
    const autoSelectedRef = useRef(false);
    const valueRef = useRef(value);
    const onChangeRef = useRef(onChange);
    const onAddressesLoadedRef = useRef(onAddressesLoaded);
    const hasLoadedRef = useRef(false);

    valueRef.current = value;
    onChangeRef.current = onChange;
    onAddressesLoadedRef.current = onAddressesLoaded;

    const load = useCallback(async (isReload = false) => {
        if (!isReload || !hasLoadedRef.current) {
            setLoading(true);
        }

        try {
            const response = await fetchAddresses();
            if (!response.status || !Array.isArray(response.data)) {
                setRows([]);
                onAddressesLoadedRef.current?.([]);
                return;
            }

            const nextRows = response.data;
            setRows(nextRows);
            onAddressesLoadedRef.current?.(nextRows);
            hasLoadedRef.current = true;

            const prevIds = previousIdsRef.current;
            const added = nextRows.filter((row) => !prevIds.includes(row._id));
            previousIdsRef.current = nextRows.map((row) => row._id);

            const currentValue = valueRef.current;

            if (isReload && added.length === 1) {
                onChangeRef.current(added[0]._id, added[0]);
                return;
            }

            if (currentValue && nextRows.some((row) => row._id === currentValue)) return;

            if (!autoSelectedRef.current || isReload) {
                const pick = nextRows.find((row) => row.isDefault) || nextRows[0];
                if (pick?._id) {
                    autoSelectedRef.current = true;
                    onChangeRef.current(pick._id, pick);
                }
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load(false);
    }, [load]);

    useEffect(() => {
        if (reloadTrigger === 0) return;
        void load(true);
    }, [reloadTrigger, load]);

    if (loading && !rows.length) {
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
                    <Feather name="plus" size={14} color={colors.white} />
                    <Text style={styles.addBtnText}>Add address</Text>
                </Pressable>
            ) : null}
        </View>
    }

    return <View style={styles.wrap}>
        {rows.map((row) => {
            const selected = value === row._id;
            return (
                <Pressable key={row._id} onPress={() => onChange(row._id, row)} style={[styles.row, selected && styles.rowSelected]}>
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

        {onAddAddress ? (
            <Pressable onPress={onAddAddress} style={styles.addNewBtn}>
                <Feather name="plus" size={16} color={colors.primary} />
                <Text style={styles.addNewBtnText}>Add new address</Text>
            </Pressable>
        ) : null}

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
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: colors.primary,
        borderRadius: radius.lg,
        paddingHorizontal: spacing.md,
        paddingVertical: 8,
    },
    addBtnText: { color: colors.white, fontSize: 13, fontWeight: "700" },
    addNewBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        borderRadius: radius.x2,
        borderWidth: 1.5,
        borderColor: colors.primary,
        backgroundColor: "rgba(240,116,26,0.06)",
        paddingVertical: 12,
        paddingHorizontal: spacing.md,
    },
    addNewBtnText: { color: colors.primary, fontSize: 14, fontWeight: "700" },
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
