import { StyleSheet } from "react-native";
import { colors, radius, shadows, spacing } from "./colors";

export const screenStyles = StyleSheet.create({
    loadingBox: {
        paddingVertical: 48,
        alignItems: "center",
        justifyContent: "center",
    },
    list: {
        gap: spacing.sm,
    },
    stripeRow: {
        flexDirection: "row",
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.background,
        borderRadius: radius.lg,
        overflow: "hidden",
        marginBottom: spacing.sm,
    },
    stripe: {
        width: 4,
    },
    stripeBody: {
        flex: 1,
        padding: spacing.md,
        gap: spacing.sm,
    },
    rowTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: spacing.sm,
    },
    rowMain: {
        flex: 1,
        gap: 4,
    },
    primaryNumber: {
        fontSize: 15,
        fontWeight: "800",
        color: colors.primary,
    },
    metaLine: {
        fontSize: 13,
        color: colors.mutedForeground,
        lineHeight: 18,
    },
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        flexWrap: "wrap",
    },
    metaText: {
        fontSize: 12,
        color: colors.mutedForeground,
    },
    rowFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    footerActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    price: {
        fontSize: 15,
        fontWeight: "800",
        color: colors.foreground,
    },
    contentCard: {
        marginBottom: spacing.lg,
    },
    iconTile: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "rgba(240,116,26,0.1)",
        alignItems: "center",
        justifyContent: "center",
    },
    listRow: {
        flexDirection: "row",
        gap: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.x2,
        backgroundColor: colors.background,
        padding: spacing.md,
        marginBottom: spacing.sm,
        ...shadows.card,
        shadowOpacity: 0.04,
    },
    stackRoot: {
        flex: 1,
        backgroundColor: colors.muted,
    },
    formContent: {
        padding: spacing.lg,
        paddingBottom: spacing.x2,
    },
    formCard: {
        gap: spacing.lg,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: "800",
        color: colors.foreground,
    },
    intro: {
        fontSize: 14,
        color: colors.mutedForeground,
        lineHeight: 22,
    },
});
