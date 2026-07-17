import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Linking, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRoute, type RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { acceptBookingQuote, cancelBooking, completeBooking, fetchBooking, type BookingDetail, } from "../api";
import BookingFeedbackSection from "../components/booking/BookingFeedbackSection";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import DetailHeader from "../components/ui/DetailHeader";
import StatusBadge from "../components/ui/StatusBadge";
import type { MainStackParamList } from "../api/types";
import { chatButtonStyles } from "../config/constant";
import { formatDateTime } from "../helpers/date";
import { isBookingChatOpen, useRootNavigation } from "../helpers/common";
import { colors, radius, spacing } from "../theme/colors";
import { screenStyles } from "../theme/screenStyles";

function formatMoney(value?: number | null) {
    if (value == null) return "—";
    return `₹${Number(value).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

export default function BookingDetailScreen() {
    const navigation = useRootNavigation();
    const route = useRoute<RouteProp<MainStackParamList, "BookingDetail">>();
    const { bookingId } = route.params;

    const [booking, setBooking] = useState<BookingDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const load = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        try {
            const response = await fetchBooking(bookingId);
            if (response.status) setBooking(response.data);
            else {
                Alert.alert("Not found", response.message || "Booking not found.", [{ text: "OK", onPress: () => navigation.goBack() }]);
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [bookingId, navigation]);

    useFocusEffect(useCallback(() => { void load(); }, [load]));

    const onAcceptQuote = () => {
        Alert.alert("Accept quote?", "You agree to proceed at the quoted price.", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Accept",
                onPress: () => {
                    void (async () => {
                        setSubmitting(true);
                        try {
                            const response = await acceptBookingQuote(bookingId);
                            if (response.status) {
                                Alert.alert("Success", response.message || "Quote accepted.");
                                await load(true);
                            } else Alert.alert("Failed", response.message || "Could not accept quote.");
                        } finally {
                            setSubmitting(false);
                        }
                    })();
                },
            },
        ]);
    };

    const onCancel = () => {
        Alert.alert("Cancel booking?", "Are you sure you want to cancel this booking?", [
            { text: "Keep booking", style: "cancel" },
            {
                text: "Cancel booking",
                style: "destructive",
                onPress: () => {
                    void (async () => {
                        setSubmitting(true);
                        try {
                            const response = await cancelBooking(bookingId);
                            if (response.status) {
                                Alert.alert("Cancelled", response.message || "Booking cancelled.");
                                await load(true);
                            } else {
                                Alert.alert("Failed", response.message || "Could not cancel.");
                            }
                        } finally {
                            setSubmitting(false);
                        }
                    })();
                },
            },
        ]);
    };

    const onComplete = () => {
        Alert.alert("Mark complete?", "Confirm the job is finished.", [
            { text: "Not yet", style: "cancel" },
            {
                text: "Mark complete",
                onPress: () => {
                    void (async () => {
                        setSubmitting(true);
                        try {
                            const response = await completeBooking(bookingId);
                            if (response.status) {
                                Alert.alert("Done", response.message || "Job marked complete.");
                                await load(true);
                            } else Alert.alert("Failed", response.message || "Could not complete.");
                        } finally {
                            setSubmitting(false);
                        }
                    })();
                },
            },
        ]);
    };

    const addressLine = [
        booking?.location?.addressLine1,
        booking?.location?.addressLine2,
        booking?.location?.city,
        booking?.location?.pincode,
    ].filter(Boolean).join(", ");

    const providerPhoneDigits = String(booking?.providerMobile || "").replace(/\D/g, "").slice(-10);
    const providerPhoneDisplay = providerPhoneDigits.length === 10 ? `+91 ${providerPhoneDigits}` : null;

    const onCallProvider = () => {
        if (providerPhoneDigits.length !== 10) {
            Alert.alert("No phone number", "Provider phone number is not available.");
            return;
        }
        void Linking.openURL(`tel:+91${providerPhoneDigits}`).catch(() => {
            Alert.alert("Could not call", "Unable to open the phone dialer.");
        });
    };

    return (
        <View style={screenStyles.stackRoot}>
            <DetailHeader
                title={booking?.bookingNumber || "Booking"}
                subtitle={booking ? `${booking.serviceCategoryName || "Service"} · ${booking.providerName || "Provider"}` : undefined}
                onBack={() => navigation.goBack()}
            />

            {loading ? (
                <View style={screenStyles.loadingBox}><ActivityIndicator size="large" color={colors.primary} /></View>
            ) : booking ? (
                <ScrollView
                    contentContainerStyle={[screenStyles.formContent, styles.scrollGap]}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor={colors.primary} />}
                    showsVerticalScrollIndicator={false}
                >
                    <Card large elevated style={styles.heroCard}>
                        <View style={styles.heroTop}>
                            <View style={{ flex: 1, gap: 4 }}>
                                <Text style={styles.heroNumber}>{booking.bookingNumber}</Text>
                                <Text style={styles.heroMeta}>{booking.serviceCategoryName} with {booking.providerName || "provider"}</Text>
                            </View>
                            <StatusBadge status={booking.status} />
                        </View>
                    </Card>

                    <View style={styles.infoGrid}>
                        <Card style={styles.infoTile} elevated>
                            <Feather name="clock" size={16} color={colors.primary} />
                            <Text style={styles.infoLabel}>Schedule</Text>
                            <Text style={styles.infoValue}>
                                {formatDateTime(booking.scheduledTime, "Not scheduled")}
                            </Text>
                            {booking.status === "in_progress" && booking.startTime ? (
                                <Text style={styles.infoSub}>Started {formatDateTime(booking.startTime)}</Text>
                            ) : null}
                        </Card>
                        <Card style={styles.infoTile} elevated>
                            <Feather name="map-pin" size={16} color={colors.primary} />
                            <Text style={styles.infoLabel}>Address</Text>
                            <Text style={styles.infoValue}>{addressLine || "N/A"}</Text>
                        </Card>
                    </View>

                    {booking.serviceTypes?.length ? (
                        <Card elevated style={styles.section}>
                            <Text style={styles.sectionTitle}>Selected services</Text>
                            <View style={styles.chips}>
                                {booking.serviceTypes.map((s) => (
                                    <View key={s._id} style={styles.chip}><Text style={styles.chipText}>{s.name}</Text></View>
                                ))}
                            </View>
                        </Card>
                    ) : null}

                    {booking.issueDescription ? (
                        <Card elevated style={styles.section}>
                            <Text style={styles.sectionTitle}>Issue description</Text>
                            <Text style={styles.issue}>{booking.issueDescription}</Text>
                        </Card>
                    ) : null}

                    <Card large elevated style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Quote & price</Text>
                            {!["in_progress", "completed", "cancelled"].includes(booking.status) ? (
                                <Button label="Cancel" variant="destructive" onPress={onCancel} loading={submitting} style={styles.cancelBtn} />
                            ) : null}
                        </View>
                        <View style={styles.priceGrid}>
                            <View style={styles.priceBox}><Text style={styles.priceLabel}>Quoted</Text><Text style={styles.priceValue}>{formatMoney(booking.quotedPrice)}</Text></View>
                            <View style={styles.priceBox}><Text style={styles.priceLabel}>Agreed</Text><Text style={styles.priceValue}>{formatMoney(booking.agreedPrice)}</Text></View>
                            <View style={styles.priceBox}><Text style={styles.priceLabel}>Final</Text><Text style={styles.priceValue}>{formatMoney(booking.finalPrice)}</Text></View>
                        </View>
                        {booking.status === "price_pending" && booking.quotedPrice ? (
                            <Button label="Accept quote" onPress={onAcceptQuote} loading={submitting} fullWidth />
                        ) : null}
                    </Card>

                    {booking.status === "in_progress" && booking.startTime ? (
                        <Card elevated style={[styles.section, styles.completeCard]}>
                            <Text style={styles.completeTitle}>Job in progress</Text>
                            <Text style={styles.completeSub}>Mark complete when the work is finished.</Text>
                            <Button label="Mark job as complete" onPress={onComplete} loading={submitting} fullWidth />
                        </Card>
                    ) : booking.status === "in_progress" ? (
                        <Card flat style={styles.section}>
                            <Text style={styles.waitText}>Your provider has not started the job on the app yet.</Text>
                        </Card>
                    ) : null}

                    {booking.customerFeedback && <Card large elevated style={styles.section}>
                        <BookingFeedbackSection
                            bookingId={bookingId}
                            providerName={booking.providerName}
                            status={booking.status}
                            feedback={booking.customerFeedback}
                            onSaved={() => void load(true)}
                        />
                    </Card>}

                    <Card large elevated style={styles.section}>
                        <View style={styles.chatCard}>
                            <View style={styles.chatCardCopy}>
                                <Text style={styles.sectionTitle}>Contact provider</Text>
                                <Text style={styles.chatSub}>
                                    Call or message {booking.providerName || "your provider"} about this booking.
                                </Text>
                                {providerPhoneDisplay ? (
                                    <Text style={styles.phoneText}>{providerPhoneDisplay}</Text>
                                ) : null}
                            </View>
                            <View style={styles.contactActions}>
                                {providerPhoneDisplay ? (
                                    <Pressable onPress={onCallProvider} style={chatButtonStyles.btn}>
                                        <Feather name="phone" size={16} color={colors.primary} />
                                        <Text style={chatButtonStyles.text}>Call</Text>
                                    </Pressable>
                                ) : null}
                                <Pressable
                                    onPress={() => navigation.navigate("BookingChat", {
                                        bookingId: bookingId,
                                        bookingNumber: booking.bookingNumber,
                                        providerName: booking.providerName,
                                        chatDisabled: !isBookingChatOpen(booking.status),
                                    })}
                                    style={chatButtonStyles.btn}
                                >
                                    <Feather name="message-circle" size={16} color={colors.primary} />
                                    <Text style={chatButtonStyles.text}>Chat</Text>
                                </Pressable>
                            </View>
                        </View>
                    </Card>
                </ScrollView>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    scrollGap: { gap: spacing.md },
    heroCard: { gap: spacing.sm },
    heroTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: spacing.md },
    heroNumber: { fontSize: 22, fontWeight: "800", color: colors.primary },
    heroMeta: { fontSize: 14, color: colors.mutedForeground },
    infoGrid: { flexDirection: "row", gap: spacing.sm },
    infoTile: { flex: 1, gap: 6, padding: spacing.md },
    infoLabel: { fontSize: 11, fontWeight: "700", color: colors.mutedForeground, textTransform: "uppercase" },
    infoValue: { fontSize: 13, color: colors.foreground, lineHeight: 18 },
    infoSub: { fontSize: 11, color: colors.mutedForeground },
    section: { gap: spacing.md },
    sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.sm },
    sectionTitle: { fontSize: 17, fontWeight: "800", color: colors.foreground },
    chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    chip: { backgroundColor: colors.muted, borderRadius: radius.x2, paddingHorizontal: 12, paddingVertical: 6 },
    chipText: { fontSize: 13, fontWeight: "600", color: colors.foreground },
    issue: { fontSize: 14, color: colors.mutedForeground, lineHeight: 21 },
    priceGrid: { flexDirection: "row", gap: spacing.sm },
    priceBox: { flex: 1, backgroundColor: colors.muted, borderRadius: radius.x2, padding: spacing.md, gap: 4 },
    priceLabel: { fontSize: 11, color: colors.mutedForeground, fontWeight: "600" },
    priceValue: { fontSize: 16, fontWeight: "800", color: colors.foreground },
    cancelBtn: { minWidth: 88 },
    completeCard: { backgroundColor: "#ECFDF5", borderColor: "#A7F3D0" },
    completeTitle: { fontSize: 16, fontWeight: "800", color: "#065F46" },
    completeSub: { fontSize: 13, color: "#047857", lineHeight: 20 },
    waitText: { fontSize: 13, color: colors.mutedForeground, lineHeight: 20 },
    chatCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md },
    chatCardCopy: { flex: 1, gap: 4 },
    chatSub: { fontSize: 13, color: colors.mutedForeground, lineHeight: 20 },
    phoneText: { fontSize: 13, fontWeight: "700", color: colors.foreground },
    contactActions: { flexDirection: "row", alignItems: "center", gap: 8 },
});
