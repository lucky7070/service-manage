import { createNavigationContainerRef } from "@react-navigation/native";
import type { MainStackParamList } from "../api/types";

export const navigationRef = createNavigationContainerRef<MainStackParamList>();

let pendingBookingId: string | null = null;

export function onNavigationReady() {
    if (!pendingBookingId || !navigationRef.isReady()) return;
    const id = pendingBookingId;
    pendingBookingId = null;
    navigationRef.navigate("BookingDetail", { bookingId: id });
}

export function navigateToBookingDetail(bookingId: string) {
    const id = String(bookingId || "").trim();
    if (!id) return;

    if (navigationRef.isReady()) {
        pendingBookingId = null;
        navigationRef.navigate("BookingDetail", { bookingId: id });
        return;
    }

    pendingBookingId = id;
}
