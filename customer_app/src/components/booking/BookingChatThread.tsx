import { useMemo, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import ImageGalleryModal from "../ui/ImageGalleryModal";
import { resolveUploadUrl, type ChatMessage } from "../../api";
import { compareByDate, formatDateKey, formatDateLong, formatTime } from "../../helpers/date";
import { colors, radius, shadows, spacing } from "../../theme/colors";

type BookingChatThreadProps = {
    messages: ChatMessage[];
    emptyLabel?: string;
};

function groupMessages(messages: ChatMessage[]) {
    const sorted = [...messages].sort((a, b) => {
        const byDate = compareByDate(a.createdAt, b.createdAt);
        if (byDate !== 0) return byDate;
        return String(a._id).localeCompare(String(b._id));
    });

    const groups: Array<{ key: string; label: string; items: ChatMessage[] }> = [];
    for (const message of sorted) {
        const dateKey = formatDateKey(message.createdAt);
        const label = formatDateLong(message.createdAt);
        const existing = groups.find((g) => g.key === dateKey);
        if (existing) existing.items.push(message);
        else groups.push({ key: dateKey, label, items: [message] });
    }

    return groups;
}

export default function BookingChatThread({ messages, emptyLabel = "No messages yet." }: BookingChatThreadProps) {
    const [galleryOpen, setGalleryOpen] = useState(false);
    const [galleryIndex, setGalleryIndex] = useState(0);

    const imageUrls = useMemo(
        () =>
            messages
                .filter((msg) => msg.attachmentUrl)
                .map((msg) => resolveUploadUrl(msg.attachmentUrl)),
        [messages]
    );

    const openGallery = (attachmentUrl: string) => {
        const fullUrl = resolveUploadUrl(attachmentUrl);
        const index = imageUrls.indexOf(fullUrl);
        setGalleryIndex(index >= 0 ? index : 0);
        setGalleryOpen(true);
    };

    if (!messages.length) {
        return <Text style={styles.empty}>{emptyLabel}</Text>;
    }

    const groups = groupMessages(messages);
    return (
        <>
            <View style={styles.wrap}>
                {groups.map((group) => (
                    <View key={group.key} style={styles.group}>
                        <View style={styles.dateRow}>
                            <Text style={styles.dateLabel}>{group.label}</Text>
                        </View>
                        {group.items.map((msg) => {
                            const mine = msg.senderType === "customer";
                            const time = formatTime(msg.createdAt);
                            const imageUri = msg.attachmentUrl ? resolveUploadUrl(msg.attachmentUrl) : null;

                            return (
                                <View key={msg._id} style={[styles.bubbleWrap, mine ? styles.bubbleWrapMine : styles.bubbleWrapTheirs]}>
                                    <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                                        {imageUri ? (
                                            <Pressable
                                                onPress={() => openGallery(msg.attachmentUrl!)}
                                                style={({ pressed }) => [styles.imageWrap, pressed && styles.imageWrapPressed]}
                                                accessibilityRole="button"
                                                accessibilityLabel="View image full screen"
                                            >
                                                <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
                                                <View style={styles.imageOverlay}>
                                                    <Feather name="maximize-2" size={14} color={colors.white} />
                                                </View>
                                            </Pressable>
                                        ) : null}
                                        {msg.message ? <Text style={[styles.msgText, mine && styles.msgTextMine]}>{msg.message}</Text> : null}
                                        {time ? (
                                            <Text style={[styles.time, mine && styles.timeMine]}>{time}</Text>
                                        ) : null}
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                ))}
            </View>

            <ImageGalleryModal
                visible={galleryOpen}
                images={imageUrls}
                initialIndex={galleryIndex}
                onClose={() => setGalleryOpen(false)}
            />
        </>
    );
}

const styles = StyleSheet.create({
    wrap: { gap: spacing.lg },
    empty: {
        textAlign: "center",
        color: colors.mutedForeground,
        paddingVertical: spacing.x2,
        fontSize: 14,
        backgroundColor: "rgba(255,255,255,0.72)",
        borderRadius: radius.x2,
        paddingHorizontal: spacing.lg,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(232,231,230,0.9)",
    },
    group: { gap: spacing.sm },
    dateRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: spacing.sm },
    dateLabel: {
        fontSize: 11,
        fontWeight: "700",
        color: colors.mutedForeground,
        backgroundColor: "rgba(255,255,255,0.82)",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: radius.xl,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(232,231,230,0.9)",
    },
    bubbleWrap: { maxWidth: "82%" },
    bubbleWrapMine: { alignSelf: "flex-end" },
    bubbleWrapTheirs: { alignSelf: "flex-start" },
    bubble: {
        borderRadius: radius.x2,
        padding: spacing.md,
        gap: 6,
        ...shadows.card,
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    bubbleMine: { backgroundColor: colors.primary, borderBottomRightRadius: radius.sm },
    bubbleTheirs: { backgroundColor: colors.card, borderWidth: 1, borderColor: "rgba(232,231,230,0.95)", borderBottomLeftRadius: radius.sm },
    msgText: { fontSize: 15, color: colors.foreground, lineHeight: 21 },
    msgTextMine: { color: colors.white },
    time: { fontSize: 10, color: colors.mutedForeground, alignSelf: "flex-end" },
    timeMine: { color: "rgba(255,255,255,0.78)" },
    imageWrap: {
        borderRadius: radius.lg,
        overflow: "hidden",
    },
    imageWrapPressed: { opacity: 0.92 },
    image: { width: 220, height: 160 },
    imageOverlay: {
        position: "absolute",
        right: 8,
        bottom: 8,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "rgba(0,0,0,0.45)",
        alignItems: "center",
        justifyContent: "center",
    },
});


