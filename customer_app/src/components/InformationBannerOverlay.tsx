import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
    ActivityIndicator,
    Image,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSettings } from "../context/SettingsContext";
import { getInformationBannerImageUri, isInformationBannerEnabled } from "../helpers/informationBanner";
import { dismissInformationBanner, shouldShowInformationBanner } from "../storage/informationBanner";
import { colors, radius, spacing } from "../theme/colors";

type InformationBannerOverlayProps = {
    children: ReactNode;
};

export default function InformationBannerOverlay({ children }: InformationBannerOverlayProps) {
    const { settings } = useSettings();
    const insets = useSafeAreaInsets();
    const { width, height } = useWindowDimensions();
    const [visible, setVisible] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    const bannerPath = settings.information_banner?.trim() ?? "";
    const imageUri = getInformationBannerImageUri(settings);
    const enabled = isInformationBannerEnabled(settings);

    const evaluateVisibility = useCallback(async () => {
        if (!enabled || !bannerPath) {
            setVisible(false);
            return;
        }
        const show = await shouldShowInformationBanner(bannerPath);
        setVisible(show);
        if (show) setImageLoading(true);
    }, [enabled, bannerPath]);

    useEffect(() => {
        void evaluateVisibility();
    }, [evaluateVisibility]);

    const onClose = () => {
        void dismissInformationBanner(bannerPath).then(() => setVisible(false));
    };

    return (
        <>
            {children}
            <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
                <View style={styles.backdrop}>
                    <View style={[styles.sheet, { marginTop: insets.top + spacing.md, marginBottom: insets.bottom + spacing.md }]}>
                        <Pressable
                            onPress={onClose}
                            style={[styles.closeBtn, { top: spacing.sm, right: spacing.sm }]}
                            hitSlop={12}
                            accessibilityLabel="Close banner"
                        >
                            <Feather name="x" size={22} color={colors.foreground} />
                        </Pressable>

                        <View style={[styles.imageWrap, { maxHeight: height * 0.72, width: width - spacing.xl * 2 }]}>
                            {imageLoading ? (
                                <View style={styles.loader}>
                                    <ActivityIndicator size="large" color={colors.primary} />
                                </View>
                            ) : null}
                            <Image
                                source={{ uri: imageUri }}
                                style={styles.image}
                                resizeMode="contain"
                                onLoadEnd={() => setImageLoading(false)}
                                onError={() => setImageLoading(false)}
                            />
                        </View>

                        <Pressable onPress={onClose} style={styles.continueBtn}>
                            <Text style={styles.continueText}>Continue to app</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(15,23,42,0.72)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: spacing.lg,
    },
    sheet: {
        width: "100%",
        maxWidth: 480,
        backgroundColor: colors.card,
        borderRadius: radius.x2,
        overflow: "hidden",
        paddingBottom: spacing.lg,
        alignItems: "center",
    },
    closeBtn: {
        position: "absolute",
        zIndex: 2,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.background,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: colors.border,
    },
    imageWrap: {
        width: "100%",
        minHeight: 200,
        marginTop: spacing.xl,
        paddingHorizontal: spacing.md,
        alignItems: "center",
        justifyContent: "center",
    },
    loader: {
        ...StyleSheet.absoluteFillObject,
        alignItems: "center",
        justifyContent: "center",
    },
    image: {
        width: "100%",
        height: "100%",
        minHeight: 200,
    },
    continueBtn: {
        marginTop: spacing.md,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.sm,
        borderRadius: radius.xl,
        backgroundColor: colors.primary,
    },
    continueText: {
        fontSize: 15,
        fontWeight: "800",
        color: colors.primaryForeground,
    },
});
