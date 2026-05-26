import { useEffect, useRef, useState } from "react";
import { FlatList, Image, Modal, Pressable, StyleSheet, Text, View, useWindowDimensions, type NativeScrollEvent, type NativeSyntheticEvent, } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../theme/colors";

type ImageGalleryModalProps = {
    visible: boolean;
    images: string[];
    initialIndex?: number;
    onClose: () => void;
};

export default function ImageGalleryModal({ visible, images, initialIndex = 0, onClose }: ImageGalleryModalProps) {
    const insets = useSafeAreaInsets();
    const { width, height } = useWindowDimensions();
    const listRef = useRef<FlatList<string>>(null);
    const [activeIndex, setActiveIndex] = useState(initialIndex);

    useEffect(() => {
        if (!visible) return;
        const index = Math.min(Math.max(initialIndex, 0), Math.max(images.length - 1, 0));
        setActiveIndex(index);
        requestAnimationFrame(() => {
            listRef.current?.scrollToIndex({ index, animated: false });
        });
    }, [visible, initialIndex, images.length]);

    const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
        setActiveIndex(nextIndex);
    };

    if (!images.length) return null;

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.backdrop}>
                <View style={[styles.header, { paddingTop: insets.top + 8, paddingHorizontal: 16 }]}>
                    <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8} accessibilityLabel="Close gallery">
                        <Feather name="x" size={22} color={colors.white} />
                    </Pressable>
                    <Text style={styles.counter}>{activeIndex + 1} / {images.length}</Text>
                    <View style={styles.headerSpacer} />
                </View>

                <FlatList
                    ref={listRef}
                    data={images}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item, index) => `${item}-${index}`}
                    getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
                    initialScrollIndex={Math.min(initialIndex, Math.max(images.length - 1, 0))}
                    onMomentumScrollEnd={onScrollEnd}
                    onScrollToIndexFailed={({ index }) => {
                        requestAnimationFrame(() => {
                            listRef.current?.scrollToIndex({ index, animated: false });
                        });
                    }}
                    renderItem={({ item }) => (
                        <View style={[styles.slide, { width, height: height - insets.top - insets.bottom - 120 }]}>
                            <Image source={{ uri: item }} style={styles.fullImage} resizeMode="contain" />
                        </View>
                    )}
                />

                {images.length > 1 ? (
                    <View style={[styles.dots, { paddingBottom: Math.max(insets.bottom, 16) }]}>
                        {images.map((_, index) => (
                            <View key={index} style={[styles.dot, index === activeIndex && styles.dotActive]} />
                        ))}
                    </View>
                ) : null}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.92)",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingBottom: 12,
    },
    closeBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.12)",
        alignItems: "center",
        justifyContent: "center",
    },
    counter: {
        color: colors.white,
        fontSize: 14,
        fontWeight: "700",
    },
    headerSpacer: { width: 40 },
    slide: {
        alignItems: "center",
        justifyContent: "center",
    },
    fullImage: {
        width: "100%",
        height: "100%",
    },
    dots: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 6,
        paddingTop: 12,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "rgba(255,255,255,0.35)",
    },
    dotActive: {
        width: 18,
        backgroundColor: colors.primary,
    },
});
