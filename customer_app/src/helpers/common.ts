import { colors } from "../theme/colors";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { MainStackParamList } from "../api/types";

export function useRootNavigation() {
    return useNavigation<NativeStackNavigationProp<MainStackParamList>>();
}

export type FieldErrorRow = { field?: string; message?: string };

export function mapApiFieldErrors(rows: unknown, fieldMap: Record<string, string> = {}) {
    if (!Array.isArray(rows)) return {};
    const errors: Record<string, string> = {};
    for (const row of rows as FieldErrorRow[]) {
        if (!row?.field || !row.message) continue;
        const key = fieldMap[row.field] || row.field;
        errors[key] = row.message;
    }

    return errors;
}

export function bookingStatusBadgeStyle(status: string) {
    switch (status) {
        case "completed":
            return { background: "rgba(244,244,243,0.9)", border: colors.border, color: colors.emerald };
        case "cancelled":
            return { background: "rgba(244,244,243,0.9)", border: colors.border, color: colors.mutedForeground };
        case "in_progress":
        case "confirmed":
            return { background: "rgba(240,116,26,0.1)", border: "rgba(240,116,26,0.2)", color: colors.primary };
        case "price_pending":
            return { background: "rgba(245,158,11,0.06)", border: "rgba(245,158,11,0.12)", color: colors.amber };
        default:
            return { background: "rgba(244,244,243,0.7)", border: colors.border, color: colors.mutedForeground };
    }
}

export function bookingAccentStripeColor(status: string) {
    if (status === "cancelled") return colors.mutedForeground;
    if (status === "completed") return colors.emerald;
    if (status === "price_pending") return colors.amber;
    return colors.primary;
}

const BOOKING_CHAT_OPEN_STATUSES = ["price_pending", "confirmed", "in_progress"] as const;
export function isBookingChatOpen(status: string) {
    return (BOOKING_CHAT_OPEN_STATUSES as readonly string[]).includes(status);
}
