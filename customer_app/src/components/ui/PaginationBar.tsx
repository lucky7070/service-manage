import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../../theme/colors";

type PaginationBarProps = {
    pageNo: number;
    totalPages: number;
    onPrevious: () => void;
    onNext: () => void;
};

export default function PaginationBar({ pageNo, totalPages, onPrevious, onNext }: PaginationBarProps) {
    if (totalPages <= 1) return null;

    return (
        <View style={styles.wrap}>
            <Pressable
                disabled={pageNo <= 1}
                onPress={onPrevious}
                style={[styles.btn, pageNo <= 1 && styles.btnDisabled]}
            >
                <Text style={styles.btnText}>Previous</Text>
            </Pressable>
            <Text style={styles.info}>Page {pageNo} of {totalPages}</Text>
            <Pressable
                disabled={pageNo >= totalPages}
                onPress={onNext}
                style={[styles.btn, pageNo >= totalPages && styles.btnDisabled]}
            >
                <Text style={styles.btnText}>Next</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: spacing.lg,
        gap: 8,
    },
    btn: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.lg,
        paddingHorizontal: 14,
        paddingVertical: 9,
        backgroundColor: colors.card,
    },
    btnDisabled: {
        opacity: 0.45,
    },
    btnText: {
        fontSize: 13,
        fontWeight: "700",
        color: colors.foreground,
    },
    info: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.mutedForeground,
    },
});
