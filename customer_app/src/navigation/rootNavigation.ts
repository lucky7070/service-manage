import { createNavigationContainerRef } from "@react-navigation/native";
import type { MainStackParamList } from "../api/types";

export const navigationRef = createNavigationContainerRef<MainStackParamList>();

type PendingNavigation =
    | { screen: "BookingDetail"; bookingId: string }
    | { screen: "BookingChat"; bookingId: string }
    | null;

let pendingNavigation: PendingNavigation = null;

export function onNavigationReady() {
    if (!pendingNavigation || !navigationRef.isReady()) return;

    const pending = pendingNavigation;
    pendingNavigation = null;

    if (pending.screen === "BookingChat") {
        navigationRef.navigate("BookingChat", { bookingId: pending.bookingId });
        return;
    }

    navigationRef.navigate("BookingDetail", { bookingId: pending.bookingId });
}

function navigateWhenReady(pending: PendingNavigation) {
    if (!pending) return;

    if (navigationRef.isReady()) {
        pendingNavigation = null;
        if (pending.screen === "BookingChat") {
            navigationRef.navigate("BookingChat", { bookingId: pending.bookingId });
            return;
        }
        navigationRef.navigate("BookingDetail", { bookingId: pending.bookingId });
        return;
    }

    pendingNavigation = pending;
}

export function navigateToBookingDetail(bookingId: string) {
    const id = String(bookingId || "").trim();
    if (!id) return;
    navigateWhenReady({ screen: "BookingDetail", bookingId: id });
}

export function navigateToBookingChat(bookingId: string) {
    const id = String(bookingId || "").trim();
    if (!id) return;
    navigateWhenReady({ screen: "BookingChat", bookingId: id });
}
