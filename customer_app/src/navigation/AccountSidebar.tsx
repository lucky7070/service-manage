import { Alert, Animated, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { colors, radius, spacing } from "../theme/colors";
import { accountMenuItems } from "../config/constant";
import type { AccountMenuRoute } from "../api/types";

type AccountSidebarProps = {
    visible: boolean;
    activeRoute: AccountMenuRoute;
    onClose: () => void;
    onNavigate: (route: AccountMenuRoute) => void;
};

export default function AccountSidebar({ visible, activeRoute, onClose, onNavigate }: AccountSidebarProps) {
    const { user, signOut } = useAuth();
    const insets = useSafeAreaInsets();

    const onLogout = () => {
        Alert.alert("Log out", "Are you sure you want to log out?", [
            { text: "Cancel", style: "cancel" },
            { text: "Log out", style: "destructive", onPress: () => void signOut() },
        ]);
    };

    const initials = (user?.name || "C").trim().charAt(0).toUpperCase();

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={{ ...styles.overlay }}>
                <Animated.View style={[styles.panel, { paddingTop: Math.min(insets.top, 10), paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
                    {/* <View style={styles.brandRow}>
                        <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
                            <Feather name="x" size={20} color={colors.mutedForeground} />
                        </Pressable>
                    </View> */}

                    <View style={styles.userCard}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{initials}</Text>
                        </View>
                        <View style={styles.userMeta}>
                            <Text style={styles.userName} numberOfLines={1}>{user?.name || "Customer"}</Text>
                            {user?.mobile ? <Text style={styles.userMobile}>+91 {user.mobile}</Text> : null}
                            <Text style={styles.walletMini}>₹{Number(user?.balance || 0).toLocaleString("en-IN")} wallet</Text>
                        </View>
                    </View>

                    <ScrollView contentContainerStyle={styles.menuScroll} showsVerticalScrollIndicator={false}>
                        <Text style={styles.menuHeading}>MY ACCOUNT</Text>
                        {accountMenuItems.map((item) => {
                            const active = activeRoute === item.route;
                            return (
                                <Pressable
                                    key={item.route}
                                    onPress={() => onNavigate(item.route)}
                                    style={[
                                        styles.menuItem,
                                        item.highlight && !active && styles.menuItemHighlight,
                                        active && styles.menuItemActive,
                                    ]}
                                >
                                    <Feather
                                        name={item.icon}
                                        size={18}
                                        color={active ? colors.white : item.highlight ? colors.amber : colors.mutedForeground}
                                    />
                                    <Text
                                        style={[
                                            styles.menuLabel,
                                            item.highlight && !active && styles.menuLabelHighlight,
                                            active && styles.menuLabelActive,
                                        ]}
                                    >
                                        {item.label}
                                    </Text>
                                    {active ? <Feather name="chevron-right" size={16} color="rgba(255,255,255,0.85)" /> : null}
                                </Pressable>
                            );
                        })}
                    </ScrollView>

                    <View style={styles.footer}>
                        <Pressable onPress={onLogout} style={styles.logoutBtn}>
                            <Feather name="log-out" size={18} color={colors.destructive} />
                            <Text style={styles.logoutLabel}>Log out</Text>
                        </Pressable>
                    </View>
                </Animated.View>
                <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close menu" />
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        flexDirection: "row",
    },
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.35)",
    },
    panel: {
        width: 288,
        height: "100%",
        backgroundColor: colors.card,
        borderRightWidth: 1,
        borderRightColor: colors.border,
    },
    brandRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing.sm,
    },
    brandMark: {
        width: 40,
        height: 40,
        borderRadius: radius.lg,
        backgroundColor: colors.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    brandMarkText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: "800",
    },
    brandText: {
        flex: 1,
    },
    brandName: {
        fontSize: 16,
        fontWeight: "800",
        color: colors.foreground,
    },
    brandSub: {
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 1,
        color: colors.mutedForeground,
        marginTop: 2,
        textTransform: "uppercase",
    },
    closeBtn: {
        padding: 4,
    },
    userCard: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        marginHorizontal: spacing.lg,
        marginBottom: spacing.md,
        padding: spacing.md,
        borderRadius: radius.xl,
        backgroundColor: colors.muted,
        borderWidth: 1,
        borderColor: colors.border,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(240,116,26,0.12)",
        alignItems: "center",
        justifyContent: "center",
    },
    avatarText: {
        fontSize: 18,
        fontWeight: "800",
        color: colors.primary,
    },
    userMeta: {
        flex: 1,
    },
    userName: {
        fontSize: 15,
        fontWeight: "700",
        color: colors.foreground,
    },
    userMobile: {
        fontSize: 12,
        color: colors.mutedForeground,
        marginTop: 2,
    },
    walletMini: {
        fontSize: 12,
        fontWeight: "700",
        color: colors.primary,
        marginTop: 4,
    },
    menuScroll: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.md,
        flexGrow: 1,
    },
    bookServiceBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        borderRadius: radius.xl,
        paddingHorizontal: spacing.md,
        paddingVertical: 14,
        marginBottom: spacing.md,
        backgroundColor: colors.primary,
    },
    bookServiceLabel: {
        flex: 1,
        fontSize: 15,
        fontWeight: "800",
        color: colors.white,
    },
    menuHeading: {
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 1,
        color: colors.mutedForeground,
        marginBottom: spacing.sm,
        paddingHorizontal: spacing.sm,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        borderRadius: radius.xl,
        paddingHorizontal: spacing.md,
        paddingVertical: 12,
        marginBottom: 4,
    },
    menuItemHighlight: {
        backgroundColor: colors.amberBg,
        borderWidth: 1,
        borderColor: colors.amberRing,
    },
    menuItemActive: {
        backgroundColor: colors.primary,
    },
    menuLabel: {
        flex: 1,
        fontSize: 14,
        fontWeight: "600",
        color: colors.mutedForeground,
    },
    menuLabelHighlight: {
        color: colors.amber,
    },
    menuLabelActive: {
        color: colors.white,
    },
    footer: {
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
    },
    logoutBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        borderRadius: radius.xl,
        paddingHorizontal: spacing.md,
        paddingVertical: 12,
    },
    logoutLabel: {
        fontSize: 14,
        fontWeight: "700",
        color: colors.destructive,
    },
});
