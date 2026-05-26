import { ScrollView, StyleSheet, View, type ScrollViewProps } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "../../theme/colors";

type ScreenProps = ScrollViewProps & {
    padded?: boolean;
    safe?: boolean;
};

export default function Screen({ padded = true, safe = true, style, contentContainerStyle, children, ...props }: ScreenProps) {
    const body = (
        <View style={styles.shell}>
            <LinearGradient
                colors={["rgba(240,116,26,0.06)", "rgba(244,244,243,0)"]}
                style={styles.topGlow}
                pointerEvents="none"
            />
            <ScrollView
                {...props}
                style={[styles.screen, style]}
                contentContainerStyle={[padded && styles.padded, contentContainerStyle]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {children}
            </ScrollView>
        </View>
    );

    if (!safe) return body;

    return (
        <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
            {body}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: colors.muted,
    },
    shell: {
        flex: 1,
        backgroundColor: colors.muted,
    },
    topGlow: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 180,
        zIndex: 0,
    },
    screen: {
        flex: 1,
        backgroundColor: "transparent",
    },
    padded: {
        padding: spacing.lg,
        paddingBottom: spacing.x2,
    },
});
