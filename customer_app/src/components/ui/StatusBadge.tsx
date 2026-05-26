import { StyleSheet, Text, View } from "react-native";
import { colors, radius } from "../../theme/colors";
import { bookingStatusBadgeStyle } from "../../helpers/common";

export default function StatusBadge({ status }: { status: string }) {
    const badge = bookingStatusBadgeStyle(status);
    return (
        <View style={[styles.badge, { backgroundColor: badge.background, borderColor: badge.border }]}>
            <Text style={[styles.text, { color: badge.color }]}>{status.replaceAll("_", " ")}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        alignSelf: "flex-start",
        borderRadius: radius.x2,
        borderWidth: 1,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    text: {
        fontSize: 11,
        fontWeight: "800",
        textTransform: "capitalize",
        letterSpacing: 0.2,
    },
});
