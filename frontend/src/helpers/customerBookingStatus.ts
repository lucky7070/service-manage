export function bookingStatusBadgeClass(status: string) {
    switch (status) {
        case "completed":
            return "border border-border bg-muted/90 text-emerald-700 dark:text-emerald-400";
        case "cancelled":
            return "border border-border bg-muted/90 text-muted-foreground";
        case "in_progress":
        case "confirmed":
            return "border border-primary/20 bg-primary/10 text-primary";
        case "price_pending":
            return "border border-amber-500/12 bg-amber-500/[0.06] text-amber-950 dark:text-amber-500/85";
        default:
            return "border border-border bg-muted/70 text-muted-foreground";
    }
}

export function bookingAccentStripeClass(status: string) {
    if (status === "cancelled") return "from-muted-foreground/35 to-muted-foreground/15";
    if (status === "completed") return "from-emerald-600/30 to-emerald-600/10";
    if (status === "price_pending") return "from-amber-600/25 to-amber-600/8";
    return "from-primary to-primary/70";
}

const BOOKING_CHAT_OPEN_STATUSES = ["price_pending", "confirmed", "in_progress"] as const;
export function isBookingChatOpen(status: string) {
    return (BOOKING_CHAT_OPEN_STATUSES as readonly string[]).includes(status);
}

export function bookingChatClosedMessage(status: string) {
    if (status === "completed") return "Chat is closed for completed bookings.";
    if (status === "cancelled") return "Chat is closed for cancelled bookings.";
    return "Chat is not available for this booking.";
}
