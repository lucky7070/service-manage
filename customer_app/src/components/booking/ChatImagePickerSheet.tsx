import { Alert, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius, shadows, spacing } from "../../theme/colors";

const IMAGE_OPTIONS: ImagePicker.ImagePickerOptions = {
    mediaTypes: ["images"],
    quality: 0.8,
};

export async function pickChatImageFromCamera(): Promise<string | null> {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
        Alert.alert("Permission needed", "Allow camera access to take photos for chat.");
        return null;
    }

    const result = await ImagePicker.launchCameraAsync(IMAGE_OPTIONS);
    if (result.canceled || !result.assets[0]?.uri) return null;
    return result.assets[0].uri;
}

export async function pickChatImageFromLibrary(): Promise<string | null> {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
        Alert.alert("Permission needed", "Allow photo access to share images in chat.");
        return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync(IMAGE_OPTIONS);
    if (result.canceled || !result.assets[0]?.uri) return null;
    return result.assets[0].uri;
}

type ChatImagePickerSheetProps = {
    visible: boolean;
    onClose: () => void;
    onPicked: (uri: string) => void;
};

type OptionProps = {
    icon: keyof typeof Feather.glyphMap;
    title: string;
    subtitle: string;
    gradient?: boolean;
    onPress: () => void;
};

function PickerOption({ icon, title, subtitle, gradient = false, onPress }: OptionProps) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [styles.optionCard, pressed && styles.optionCardPressed]}
            accessibilityRole="button"
            accessibilityLabel={title}
        >
            {gradient ? (
                <LinearGradient colors={["#FF8C3A", colors.primary, colors.primaryDark]} style={styles.optionIconWrap}>
                    <Feather name={icon} size={26} color={colors.white} />
                </LinearGradient>
            ) : (
                <View style={[styles.optionIconWrap, styles.optionIconWrapSoft]}>
                    <Feather name={icon} size={26} color={colors.primary} />
                </View>
            )}
            <Text style={styles.optionTitle}>{title}</Text>
            <Text style={styles.optionSubtitle}>{subtitle}</Text>
        </Pressable>
    );
}

export default function ChatImagePickerSheet({ visible, onClose, onPicked }: ChatImagePickerSheetProps) {
    const insets = useSafeAreaInsets();

    const handlePick = async (pick: () => Promise<string | null>) => {
        onClose();
        const uri = await pick();
        if (uri) onPicked(uri);
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close photo options" />
                <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
                    <View style={styles.handle} />

                    <View style={styles.header}>
                        <View style={styles.headerBadge}>
                            <Feather name="image" size={18} color={colors.primary} />
                        </View>
                        <Text style={styles.title}>Share a photo</Text>
                        <Text style={styles.subtitle}>Take a new shot or pick one from your gallery.</Text>
                    </View>

                    <View style={styles.optionsRow}>
                        <PickerOption
                            icon="camera"
                            title="Camera"
                            subtitle="Capture now"
                            gradient
                            onPress={() => void handlePick(pickChatImageFromCamera)}
                        />
                        <PickerOption
                            icon="image"
                            title="Gallery"
                            subtitle="Choose saved"
                            onPress={() => void handlePick(pickChatImageFromLibrary)}
                        />
                    </View>

                    <Pressable onPress={onClose} style={({ pressed }) => [styles.cancelBtn, pressed && styles.cancelBtnPressed]}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "flex-end",
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(17, 24, 39, 0.52)",
    },
    sheet: {
        backgroundColor: colors.card,
        borderTopLeftRadius: radius.x3,
        borderTopRightRadius: radius.x3,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.sm,
        gap: spacing.lg,
        borderTopWidth: 1,
        borderColor: colors.border,
        ...shadows.card,
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
        elevation: 12,
    },
    handle: {
        alignSelf: "center",
        width: 44,
        height: 5,
        borderRadius: 999,
        backgroundColor: colors.border,
        marginBottom: spacing.xs,
    },
    header: {
        alignItems: "center",
        gap: spacing.sm,
        paddingHorizontal: spacing.sm,
    },
    headerBadge: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.orange50,
        borderWidth: 1,
        borderColor: colors.orange100,
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontSize: 20,
        fontWeight: "800",
        color: colors.foreground,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 14,
        lineHeight: 20,
        color: colors.mutedForeground,
        textAlign: "center",
        maxWidth: 280,
    },
    optionsRow: {
        flexDirection: "row",
        gap: spacing.md,
    },
    optionCard: {
        flex: 1,
        alignItems: "center",
        gap: spacing.sm,
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.sm,
        borderRadius: radius.x2,
        backgroundColor: colors.muted,
        borderWidth: 1,
        borderColor: colors.border,
    },
    optionCardPressed: {
        opacity: 0.88,
        transform: [{ scale: 0.98 }],
    },
    optionIconWrap: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: "center",
        justifyContent: "center",
        ...shadows.primaryButton,
    },
    optionIconWrapSoft: {
        backgroundColor: colors.orange50,
        borderWidth: 1,
        borderColor: "rgba(240,116,26,0.16)",
        shadowColor: "#0f172a",
        shadowOpacity: 0.06,
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: "800",
        color: colors.foreground,
    },
    optionSubtitle: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.mutedForeground,
    },
    cancelBtn: {
        alignItems: "center",
        justifyContent: "center",
        minHeight: 48,
        borderRadius: radius.x2,
        backgroundColor: colors.secondary,
        borderWidth: 1,
        borderColor: colors.border,
    },
    cancelBtnPressed: {
        opacity: 0.9,
    },
    cancelText: {
        fontSize: 15,
        fontWeight: "700",
        color: colors.secondaryForeground,
    },
});
