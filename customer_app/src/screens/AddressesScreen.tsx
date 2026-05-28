import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { deleteAddress, fetchAddresses, type AddressRow } from "../api";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import PageHero from "../components/ui/PageHero";
import Screen from "../components/ui/Screen";
import { useRootNavigation } from "../helpers/common";
import { colors, radius, spacing } from "../theme/colors";
import { screenStyles } from "../theme/screenStyles";

export default function AddressesScreen() {
    const navigation = useRootNavigation();
    const [rows, setRows] = useState<AddressRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        try {
            const response = await fetchAddresses();
            if (response.status && Array.isArray(response.data)) setRows(response.data);
            else setRows([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(useCallback(() => { void load(); }, [load]));

    const onDelete = (row: AddressRow) => {
        Alert.alert("Delete address?", "This cannot be undone.", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: () => {
                    void (async () => {
                        const response = await deleteAddress(row._id);
                        if (response.status) {
                            setRows((prev) => prev.filter((item) => item._id !== row._id));
                        } else Alert.alert("Could not delete", response.message || "Try again.");
                    })();
                },
            },
        ]);
    };

    return (
        <Screen safe={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor={colors.primary} />}>
            <PageHero eyebrow="Saved locations" title="My Addresses" subtitle="Manage addresses used for service bookings." />

            <Button label="Add address" onPress={() => navigation.navigate("AddressForm", {})} fullWidth style={styles.addBtn} />

            {loading ? (
                <View style={screenStyles.loadingBox}><ActivityIndicator size="large" color={colors.primary} /></View>
            ) : rows.length === 0 ? (
                <Card elevated><EmptyState icon="home" title="No addresses saved" message="Add your first service address to book faster." /></Card>
            ) : (
                <View style={screenStyles.list}>
                    {rows.map((row) => (
                        <AddressCard
                            key={row._id}
                            row={row}
                            onEdit={() => navigation.navigate("AddressForm", { addressId: row._id })}
                            onDelete={() => onDelete(row)}
                        />
                    ))}
                </View>
            )}
        </Screen>
    );
}

function AddressCard({ row, onEdit, onDelete }: { row: AddressRow; onEdit: () => void; onDelete: () => void }) {
    const locationLabel = row.locationType ? row.locationType.charAt(0).toUpperCase() + row.locationType.slice(1) : "Address";
    const stripeColor = row.isDefault ? colors.primary : "#A3A3A3";

    return (
        <View style={screenStyles.stripeRow}>
            <View style={[screenStyles.stripe, { backgroundColor: stripeColor }]} />
            <View style={screenStyles.stripeBody}>
                <View style={styles.addressTop}>
                    <View style={screenStyles.iconTile}>
                        <Feather name="home" size={18} color={colors.primary} />
                    </View>
                    <View style={styles.addressBody}>
                        <View style={styles.titleRow}>
                            <Text style={styles.locationType}>{locationLabel}</Text>
                            {row.isDefault ? (
                                <View style={styles.defaultBadge}>
                                    <Feather name="star" size={10} color={colors.primary} />
                                    <Text style={styles.defaultText}>Default</Text>
                                </View>
                            ) : null}
                        </View>
                        <Text style={screenStyles.metaLine}>{row.addressLine1}{row.addressLine2 ? `, ${row.addressLine2}` : ""}</Text>
                        <Text style={screenStyles.metaLine}>{[row.landmark, row.cityName, row.stateName, row.pincode].filter(Boolean).join(", ")}</Text>
                    </View>
                </View>
                <View style={styles.actions}>
                    <Pressable onPress={onEdit} style={styles.actionBtn}><Feather name="edit-2" size={16} color={colors.primary} /><Text style={styles.actionText}>Edit</Text></Pressable>
                    <Pressable onPress={onDelete} style={styles.actionBtn}><Feather name="trash-2" size={16} color={colors.destructive} /><Text style={[styles.actionText, { color: colors.destructive }]}>Delete</Text></Pressable>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    addBtn: { marginBottom: spacing.lg },
    addressTop: { flexDirection: "row", gap: spacing.md },
    addressBody: { flex: 1, gap: 4 },
    titleRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
    locationType: { fontSize: 15, fontWeight: "700", color: colors.foreground },
    defaultBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: "rgba(240,116,26,0.1)",
        borderRadius: radius.x2,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    defaultText: { fontSize: 11, fontWeight: "700", color: colors.primary },
    actions: { flexDirection: "row", gap: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm },
    actionBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
    actionText: { fontSize: 13, fontWeight: "700", color: colors.primary },
});
