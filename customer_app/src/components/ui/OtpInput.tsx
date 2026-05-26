import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, radius } from "../../theme/colors";

type OtpInputProps = {
    value: string;
    onChange: (value: string) => void;
    length?: number;
};

export default function OtpInput({ value, onChange, length = 6 }: OtpInputProps) {
    const digits = value.padEnd(length, " ").slice(0, length).split("");

    return (
        <View style={styles.row}>
            {digits.map((digit, index) => (
                <Pressable key={index} style={[styles.cell, digit.trim() ? styles.cellFilled : null]}>
                    <Text style={styles.cellText}>{digit.trim()}</Text>
                </Pressable>
            ))}
            <TextInput
                value={value}
                onChangeText={(text) => onChange(text.replace(/\D/g, "").slice(0, length))}
                keyboardType="number-pad"
                maxLength={length}
                style={styles.hiddenInput}
                autoFocus
            />
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 8,
        position: "relative",
    },
    cell: {
        flex: 1,
        maxWidth: 48,
        height: 48,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
        alignItems: "center",
        justifyContent: "center",
    },
    cellFilled: {
        borderColor: colors.primary,
    },
    cellText: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.foreground,
    },
    hiddenInput: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0,
    },
});
