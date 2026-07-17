import { useRef, useState } from "react";
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, } from "react-native";
import { useRoute, type RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BookingChatThread from "../components/booking/BookingChatThread";
import ChatImagePickerSheet from "../components/booking/ChatImagePickerSheet";
import ChatTypingIndicator from "../components/booking/ChatTypingIndicator";
import ChatPatternBackground from "../components/chat/ChatPatternBackground";
import DetailHeader from "../components/ui/DetailHeader";
import { useBookingChat } from "../hooks/useBookingChat";
import type { MainStackParamList } from "../api/types";
import { useRootNavigation } from "../helpers/common";
import { colors, radius, shadows, spacing } from "../theme/colors";

export default function BookingChatScreen() {

    const navigation = useRootNavigation();
    const route = useRoute<RouteProp<MainStackParamList, "BookingChat">>();
    const insets = useSafeAreaInsets();
    const { bookingId, bookingNumber, providerName, chatDisabled } = route.params;

    const scrollRef = useRef<ScrollView>(null);
    const [text, setText] = useState("");
    const [pendingImage, setPendingImage] = useState<string | null>(null);
    const [pickerVisible, setPickerVisible] = useState(false);

    const { messages, loading, sending, connected, providerOnline, providerTyping, onTextChange, stopTyping, send, } = useBookingChat({ bookingId, enabled: !chatDisabled });
    const providerInitial = (providerName || "P").trim().charAt(0).toUpperCase();

    const onAttachImage = () => setPickerVisible(true);

    const onSend = async () => {
        const result = await send({ message: text, imageUri: pendingImage || undefined });
        if (result.ok) {
            setText("");
            setPendingImage(null);
            requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
        } else {
            Alert.alert("Could not send", result.message || "Try again.");
        }
    };

    const statusLine = chatDisabled
        ? "Chat is closed for this booking."
        : providerTyping
            ? "Provider is typing…"
            : providerOnline
                ? "Online now"
                : connected
                    ? "Offline"
                    : "Connecting…";

    const canSend = (text.trim().length > 0 || Boolean(pendingImage)) && !sending;

    return (
        <View style={styles.root}>
            <DetailHeader
                title={bookingNumber || "Booking chat"}
                subtitle={providerName ? `Chat with ${providerName}` : "Provider chat"}
                onBack={() => navigation.goBack()}
            />

            <View style={styles.statusBar}>
                <View style={styles.providerChip}>
                    <View style={styles.providerAvatar}>
                        <Text style={styles.providerInitial}>{providerInitial}</Text>
                    </View>
                    <View style={styles.statusCopy}>
                        <Text style={styles.providerName} numberOfLines={1}>{providerName || "Provider"}</Text>
                        <View style={styles.statusRow}>
                            <View
                                style={[
                                    styles.statusDot,
                                    providerOnline ? styles.statusDotOnline : styles.statusDotOffline,
                                    !connected && styles.statusDotPending,
                                ]}
                            />
                            <Text style={styles.statusText}>{statusLine}</Text>
                        </View>
                    </View>
                </View>
                {!connected && !chatDisabled ? <ActivityIndicator size="small" color={colors.primary} /> : null}
            </View>

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
            >
                <View style={styles.threadShell}>
                    <ChatPatternBackground />
                    {loading ? (
                        <View style={styles.loader}><ActivityIndicator size="large" color={colors.primary} /></View>
                    ) : (
                        <ScrollView
                            ref={scrollRef}
                            style={styles.thread}
                            contentContainerStyle={styles.threadContent}
                            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
                            showsVerticalScrollIndicator={false}
                        >
                            <BookingChatThread messages={messages} emptyLabel="No messages yet. Say hello to your provider." />
                            {providerTyping ? <ChatTypingIndicator label="Provider is typing" /> : null}
                        </ScrollView>
                    )}
                </View>

                {!chatDisabled ? (
                    <View style={[styles.composerWrap, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
                        {pendingImage ? (
                            <View style={styles.previewRow}>
                                <Image source={{ uri: pendingImage }} style={styles.preview} />
                                <View style={styles.previewMeta}>
                                    <Text style={styles.previewTitle}>Image ready to send</Text>
                                    <Text style={styles.previewSub}>Add an optional caption below.</Text>
                                </View>
                                <Pressable onPress={() => setPendingImage(null)} hitSlop={8}>
                                    <Feather name="x-circle" size={22} color={colors.mutedForeground} />
                                </Pressable>
                            </View>
                        ) : null}

                        <View style={styles.composer}>
                            <Pressable
                                onPress={onAttachImage}
                                style={({ pressed }) => [styles.attachBtn, pressed && styles.attachBtnPressed]}
                                disabled={sending}
                                accessibilityLabel="Add photo"
                            >
                                <LinearGradient colors={["#FF8C3A", colors.primary]} style={styles.attachGradient}>
                                    <Feather name="plus" size={22} color={colors.white} />
                                </LinearGradient>
                            </Pressable>
                            <TextInput
                                value={text}
                                onChangeText={(value) => {
                                    setText(value);
                                    onTextChange(value);
                                }}
                                onBlur={stopTyping}
                                placeholder="Type your message…"
                                placeholderTextColor={colors.mutedForeground}
                                style={styles.input}
                                multiline
                                editable={!sending}
                            />
                            <Pressable
                                onPress={() => void onSend()}
                                disabled={!canSend || sending}
                                style={({ pressed }) => [
                                    styles.sendBtn,
                                    !canSend && styles.sendBtnDisabled,
                                    pressed && canSend && !sending && styles.sendBtnPressed,
                                ]}
                            >
                                <LinearGradient colors={["#FF8C3A", colors.primary, colors.primaryDark]} style={styles.sendGradient}>
                                    {sending ? (
                                        <ActivityIndicator size="small" color={colors.white} />
                                    ) : (
                                        <Feather name="send" size={18} color={colors.white} />
                                    )}
                                </LinearGradient>
                            </Pressable>
                        </View>
                    </View>
                ) : (
                    <View style={[styles.closedBar, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
                        <Feather name="lock" size={14} color={colors.mutedForeground} />
                        <Text style={styles.closedText}>This booking was cancelled. Chat is read-only.</Text>
                    </View>
                )}
            </KeyboardAvoidingView>

            <ChatImagePickerSheet
                visible={pickerVisible}
                onClose={() => setPickerVisible(false)}
                onPicked={setPendingImage}
            />
        </View>
    );
}



const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#F0EFEB" },
    flex: { flex: 1 },
    statusBar: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        backgroundColor: colors.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        ...shadows.card,
    },
    providerChip: { flex: 1, flexDirection: "row", alignItems: "center", gap: spacing.md },
    providerAvatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: "rgba(240,116,26,0.12)",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "rgba(240,116,26,0.18)",
    },
    providerInitial: { fontSize: 16, fontWeight: "800", color: colors.primary },
    statusCopy: { flex: 1, gap: 2 },
    providerName: { fontSize: 15, fontWeight: "800", color: colors.foreground },
    statusRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    statusDotOnline: { backgroundColor: colors.emerald },
    statusDotOffline: { backgroundColor: colors.mutedForeground },
    statusDotPending: { backgroundColor: colors.amber },
    statusText: { fontSize: 12, color: colors.mutedForeground, fontWeight: "600" },
    threadShell: { flex: 1, position: "relative", overflow: "hidden" },
    loader: { flex: 1, alignItems: "center", justifyContent: "center" },
    thread: { flex: 1, backgroundColor: "transparent" },
    threadContent: { padding: spacing.lg, paddingBottom: spacing.x2, flexGrow: 1 },
    composerWrap: {
        borderTopLeftRadius: radius.x3,
        borderTopRightRadius: radius.x3,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.card,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        gap: spacing.sm,
        ...shadows.card,
        shadowOffset: { width: 0, height: -2 },
    },
    previewRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        backgroundColor: colors.muted,
        borderRadius: radius.x2,
        padding: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    preview: { width: 56, height: 56, borderRadius: radius.lg },
    previewMeta: { flex: 1, gap: 2 },
    previewTitle: { fontSize: 14, fontWeight: "700", color: colors.foreground },
    previewSub: { fontSize: 12, color: colors.mutedForeground },
    composer: {
        flexDirection: "row",
        alignItems: "flex-end",
        gap: spacing.sm,
        backgroundColor: colors.muted,
        borderRadius: radius.x3,
        padding: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    attachBtn: {
        width: 42,
        height: 42,
        borderRadius: 21,
        overflow: "hidden",
        ...shadows.primaryButton,
    },
    attachBtnPressed: { opacity: 0.9, transform: [{ scale: 0.96 }] },
    attachGradient: {
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    input: {
        flex: 1,
        minHeight: 42,
        maxHeight: 120,
        backgroundColor: "transparent",
        paddingHorizontal: spacing.sm,
        paddingVertical: 8,
        fontSize: 15,
        color: colors.foreground,
    },
    sendBtn: {
        width: 42,
        height: 42,
        borderRadius: 21,
        overflow: "hidden",
        ...shadows.primaryButton,
    },
    sendBtnDisabled: { opacity: 0.45, shadowOpacity: 0 },
    sendBtnPressed: { opacity: 0.92 },
    sendGradient: {
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    closedBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.card,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
    },
    closedText: { fontSize: 13, color: colors.mutedForeground, textAlign: "center" },
});


