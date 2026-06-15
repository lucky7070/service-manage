import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { fetchNotifications, markAllNotificationsRead, markNotificationRead, type NotificationRow } from "../api";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import PageHero from "../components/ui/PageHero";
import PaginationBar from "../components/ui/PaginationBar";
import Screen from "../components/ui/Screen";
import { formatDateTimeShort } from "../helpers/date";
import { openInAppNotification } from "../notifications/notificationNavigation";
import { colors, radius, spacing } from "../theme/colors";
import { screenStyles } from "../theme/screenStyles";

const typeIcons: Record<NotificationRow["type"], keyof typeof Feather.glyphMap> = {
    booking: "calendar",
    chat: "message-circle",
    system: "info",
    promotion: "gift",
};

export default function NotificationsScreen() {
    const [pageNo, setPageNo] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [rows, setRows] = useState<NotificationRow[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [markingAll, setMarkingAll] = useState(false);

    const load = useCallback(async (isRefresh = false, page = pageNo) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        try {
            const response = await fetchNotifications({ pageNo: page, limit: 10 });
            if (response.status && response.data) {
                setRows(response.data.record || []);
                setTotalPages(response.data.totalPages || 0);
                setPageNo(response.data.current_page || page);
                setUnreadCount(response.data.unreadCount ?? 0);
            } else {
                setRows([]);
                setUnreadCount(0);
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [pageNo]);

    useFocusEffect(useCallback(() => { void load(false, 1); }, []));

    const onOpen = async (row: NotificationRow) => {
        if (!row.isRead) {
            const response = await markNotificationRead(row._id);
            if (response.status) {
                setRows((prev) =>
                    prev.map((item) => (item._id === row._id ? { ...item, isRead: true } : item))
                );
                setUnreadCount((count) => Math.max(0, count - 1));
            }
        }
        openInAppNotification(row);
    };

    const onMarkAllRead = async () => {
        if (unreadCount === 0) return;
        setMarkingAll(true);
        try {
            const response = await markAllNotificationsRead();
            if (response.status) {
                setRows((prev) => prev.map((item) => ({ ...item, isRead: true })));
                setUnreadCount(response.data?.unreadCount ?? 0);
            } else {
                Alert.alert("Could not update", response.message || "Try again.");
            }
        } finally {
            setMarkingAll(false);
        }
    };

    return (
        <Screen
            safe={false}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor={colors.primary} />
            }
        >
            <PageHero
                eyebrow="Updates"
                title="Notifications"
                subtitle="Booking updates, quotes, and messages from your service professionals."
            />

            {unreadCount > 0 ? (
                <View style={styles.markAllRow}>
                    <Text style={styles.unreadHint}>{unreadCount} unread</Text>
                    <Button
                        label={markingAll ? "Updating…" : "Mark all read"}
                        variant="outline"
                        onPress={() => void onMarkAllRead()}
                        loading={markingAll}
                    />
                </View>
            ) : null}

            <Card large elevated>
                {loading ? (
                    <View style={screenStyles.loadingBox}>
                        <ActivityIndicator color={colors.primary} />
                    </View>
                ) : rows.length === 0 ? (
                    <EmptyState
                        icon="bell"
                        title="No notifications yet"
                        message="When your bookings change or providers send quotes, updates will appear here."
                    />
                ) : (
                    <View style={screenStyles.list}>
                        {rows.map((row) => (
                            <Pressable
                                key={row._id}
                                onPress={() => void onOpen(row)}
                                style={({ pressed }) => [
                                    styles.row,
                                    !row.isRead && styles.rowUnread,
                                    pressed && styles.rowPressed,
                                ]}
                            >
                                <View style={[styles.iconWrap, !row.isRead && styles.iconWrapUnread]}>
                                    <Feather name={typeIcons[row.type] || "bell"} size={18} color={colors.primary} />
                                </View>
                                <View style={styles.body}>
                                    <View style={styles.titleRow}>
                                        <Text style={[styles.title, !row.isRead && styles.titleUnread]} numberOfLines={1}>
                                            {row.title}
                                        </Text>
                                        {!row.isRead ? <View style={styles.dot} /> : null}
                                    </View>
                                    <Text style={styles.message} numberOfLines={3}>
                                        {row.message}
                                    </Text>
                                    <Text style={styles.time}>{formatDateTimeShort(row.createdAt)}</Text>
                                </View>
                                <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
                            </Pressable>
                        ))}
                    </View>
                )}

                <PaginationBar
                    pageNo={pageNo}
                    totalPages={totalPages}
                    onPrevious={() => void load(false, Math.max(1, pageNo - 1))}
                    onNext={() => void load(false, pageNo + 1)}
                />
            </Card>
        </Screen>
    );
}

const styles = StyleSheet.create({
    markAllRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: spacing.md,
        gap: spacing.sm,
    },
    unreadHint: {
        fontSize: 13,
        fontWeight: "700",
        color: colors.primary,
    },
    row: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: spacing.md,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    rowUnread: {
        backgroundColor: "rgba(240,116,26,0.04)",
        marginHorizontal: -spacing.md,
        paddingHorizontal: spacing.md,
        borderRadius: radius.lg,
        borderBottomColor: "transparent",
    },
    rowPressed: {
        opacity: 0.85,
    },
    iconWrap: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: colors.muted,
        alignItems: "center",
        justifyContent: "center",
    },
    iconWrapUnread: {
        backgroundColor: "rgba(240,116,26,0.12)",
    },
    body: {
        flex: 1,
        gap: 4,
    },
    titleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
    },
    title: {
        flex: 1,
        fontSize: 15,
        fontWeight: "600",
        color: colors.foreground,
    },
    titleUnread: {
        fontWeight: "800",
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.primary,
    },
    message: {
        fontSize: 13,
        lineHeight: 19,
        color: colors.mutedForeground,
    },
    time: {
        fontSize: 11,
        color: colors.mutedForeground,
        marginTop: 2,
    },
});
