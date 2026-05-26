import { Image, StyleSheet, View } from "react-native";

const BG = "#F0EFEB";

export default function ChatPatternBackground() {
    return (
        <View style={styles.fill} pointerEvents="none">
            <View style={styles.base} />
            <Image source={require("../../../assets/chat-doodle-bg.png")} style={styles.doodle} resizeMode="repeat" />
            <View style={styles.wash} />
        </View>
    );
}

const styles = StyleSheet.create({
    fill: {
        ...StyleSheet.absoluteFillObject,
    },
    base: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: BG,
    },
    doodle: {
        ...StyleSheet.absoluteFillObject,
        width: "100%",
        height: "100%",
        opacity: 0.55,
    },
    wash: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(240,239,235,0.35)",
    },
});
