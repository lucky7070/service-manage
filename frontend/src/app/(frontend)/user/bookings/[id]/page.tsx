"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import moment from "moment";
import type { KeyboardEvent } from "react";
import { ArrowLeft, CalendarClock, CheckCircle2, Loader2, MapPin, Send, XCircle } from "lucide-react";
import Swal from "sweetalert2/dist/sweetalert2.js";
import { toast } from "react-toastify";
import { BookingChatThread } from "@/components/chat/BookingChatThread";
import { ChatTypingIndicator } from "@/components/chat/ChatTypingIndicator";
import BookingProviderRatingSection, { type CustomerBookingFeedback } from "@/components/front/user/BookingProviderRatingSection";
import AccountNav from "@/components/front/user/AccountNav";
import { Button, Textarea } from "@/components/front/ui";
import AxiosHelper from "@/helpers/AxiosHelper";
import { cn, getSweetAlertConfigFront } from "@/helpers/utils";
import { socket } from "@/lib/socket";

type BookingDetail = {
    _id: string;
    bookingNumber: string;
    providerName: string;
    serviceCategoryName: string;
    serviceTypes: Array<{ _id: string; name: string; basePrice?: number; estimatedTimeMinutes?: number }>;
    status: string;
    issueDescription?: string;
    quotedPrice?: number | null;
    agreedPrice?: number | null;
    finalPrice?: number | null;
    scheduledTime?: string;
    startTime?: string | null;
    location?: { addressLine1?: string; addressLine2?: string; landmark?: string; city?: string; state?: string; pincode?: string };
    customerFeedback?: CustomerBookingFeedback | null;
};

type ChatMessage = {
    _id: string;
    senderType: "customer" | "provider";
    message: string;
    createdAt?: string;
};

export default function CustomerBookingDetailPage() {
    const router = useRouter();
    const { id } = useParams<{ id: string }>();
    const [booking, setBooking] = useState<BookingDetail>({
        _id: "",
        bookingNumber: "",
        providerName: "",
        serviceCategoryName: "",
        serviceTypes: [],
        status: "",
        issueDescription: "",
        quotedPrice: null,
        agreedPrice: null,
        finalPrice: null,
        scheduledTime: "",
        startTime: null,
        location: {
            addressLine1: "",
            addressLine2: "",
            landmark: "",
            city: "",
            state: "",
            pincode: "",
        },
        customerFeedback: null,
    });
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [providerOnline, setProviderOnline] = useState(false);
    const [providerTyping, setProviderTyping] = useState(false);
    const chatScrollRef = useRef<HTMLDivElement>(null);
    const stickToBottomRef = useRef(true);
    const typingIdleRef = useRef<number | null>(null);

    const scrollChatToBottom = useCallback(() => {
        const el = chatScrollRef.current;
        if (!el) return;
        el.scrollTop = el.scrollHeight;
    }, []);

    const onChatScroll = useCallback(() => {
        const el = chatScrollRef.current;
        if (!el) return;
        const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
        stickToBottomRef.current = nearBottom;
    }, []);

    useLayoutEffect(() => {
        if (!stickToBottomRef.current) return;
        scrollChatToBottom();
    }, [messages, providerTyping, scrollChatToBottom]);

    const emitTyping = useCallback((typing: boolean) => {
        if (id) socket.emit("booking:typing", { bookingId: id, typing });
    }, [id]);

    const clearTypingEmitTimers = useCallback(() => {
        if (typingIdleRef.current !== null) {
            clearTimeout(typingIdleRef.current);
            typingIdleRef.current = null;
        }
    }, []);

    const stopLocalTypingSignal = useCallback(() => {
        clearTypingEmitTimers();
        emitTyping(false);
    }, [clearTypingEmitTimers, emitTyping]);

    const getBooking = useCallback(async () => {
        const { data } = await AxiosHelper.getData(`/customer/bookings/${id}`);
        if (data.status) {
            setLoading(false);
            setBooking(data.data as BookingDetail);
        } else {
            toast.error(data.message || "Could not load booking.");
            router.push("/user/bookings");
        }
    }, [id, router]);

    const getMessages = useCallback(async () => {
        const { data } = await AxiosHelper.getData(`/customer/bookings/${id}/messages`);
        if (data.status && Array.isArray(data.data)) {
            setMessages(data.data as ChatMessage[]);
        }
    }, [id]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            void getBooking();
            void getMessages();
        }, 0);
        return () => window.clearTimeout(timer);
    }, [getBooking, getMessages]);

    useEffect(() => {
        if (!id) return;
        socket.connect();
        socket.emit("booking:join", { bookingId: id, role: "customer" });

        const onMessage = (next: ChatMessage) => {
            if (!String(next?._id || "")) return;
            if (next.senderType === "provider") setProviderTyping(false);
            setMessages((prev) => prev.some((row) => row._id === next._id) ? prev : [...prev, next]);
        };

        const onPresence = (snap: { customerOnline: boolean; providerOnline: boolean; }) => {
            setProviderOnline(Boolean(snap.providerOnline));
        };

        const onPeerTyping = (payload: { role?: string; typing?: boolean }) => {
            if (payload?.role === "provider") setProviderTyping(Boolean(payload.typing));
        };

        socket.on("booking:message", onMessage);
        socket.on("booking:presence", onPresence);
        socket.on("booking:typing", onPeerTyping);
        return () => {
            socket.emit("booking:typing", { bookingId: id, typing: false });
            socket.emit("booking:leave", id);
            socket.off("booking:message", onMessage);
            socket.off("booking:presence", onPresence);
            socket.off("booking:typing", onPeerTyping);
        };
    }, [id]);

    const acceptQuote = async () => {
        setSubmitting(true);
        const { data } = await AxiosHelper.putData(`/customer/bookings/${id}/accept-quote`, {});
        if (data.status) {
            toast.success(data.message || "Quote accepted.");
            await getBooking();
        } else {
            toast.error(data.message || "Could not accept quote.");
        }
        setSubmitting(false);
    };

    const openCancelBookingDialog = useCallback(async () => {
        if (!id || submitting) return;
        const result = await Swal.fire(getSweetAlertConfigFront({
            title: "Cancel this booking?",
            text: "This action cannot be undone. You can leave an optional note for the provider.",
            icon: "warning",
            confirmButtonText: "Yes, Cancel Booking",
            cancelButtonText: "Keep Booking",
            showCancelButton: true,
            input: "textarea",
            inputLabel: "Cancellation reason (optional)",
            inputPlaceholder: "Why are you cancelling?",
            showLoaderOnConfirm: true,
            allowOutsideClick: () => !Swal.isLoading(),
            customClass: {
                input: "min-h-[120px]",
            },
            preConfirm: async (value) => {
                const cancellationReason = String(value ?? "").trim();
                const { data } = await AxiosHelper.putData(`/customer/bookings/${id}/cancel`, {
                    cancellationReason,
                });
                if (!data.status) {
                    throw new Error(data.message || "Could not cancel booking.");
                }
                return data as { status?: boolean; message?: string };
            },
        }));

        if (result.isConfirmed && result.value?.status) {
            toast.success(result.value.message || "Booking cancelled.");
            await getBooking();
        }
    }, [id, submitting, getBooking]);

    const openMarkCompleteDialog = useCallback(async () => {
        if (!id || submitting) return;
        const result = await Swal.fire(getSweetAlertConfigFront({
            title: "Mark this job complete?",
            html: "<p class=\"text-left text-sm\">Use this if the work is finished and you do not want to share the completion OTP with your provider. You can only do this while the job is <strong>in progress</strong> (after the provider has started).</p>",
            icon: "question",
            confirmButtonText: "Yes, mark complete",
            cancelButtonText: "Not yet",
            showCancelButton: true,
            showLoaderOnConfirm: true,
            allowOutsideClick: () => !Swal.isLoading(),
            preConfirm: async () => {
                const { data } = await AxiosHelper.putData(`/customer/bookings/${id}/complete`, {});
                if (!data.status) {
                    throw new Error(data.message || "Could not complete booking.");
                }

                return data as { status?: boolean; message?: string };
            },
        }));

        if (result.isConfirmed && result.value?.status) {
            toast.success(result.value.message || "Job marked complete.");
            await getBooking();
        }
    }, [id, submitting, getBooking]);

    const sendMessage = useCallback(async () => {
        const text = message.trim();
        if (!text || submitting || !id) return;

        stickToBottomRef.current = true;
        stopLocalTypingSignal();
        setSubmitting(true);
        const { data } = await AxiosHelper.postData(`/customer/bookings/${id}/messages`, { message: text });
        if (data.status) {
            setMessage("");
            setMessages((prev) => prev.some((row) => row._id === data.data?._id) ? prev : [...prev, data.data as ChatMessage]);
        } else {
            toast.error(data.message || "Could not send message.");
        }
        setSubmitting(false);
    }, [message, submitting, id, stopLocalTypingSignal]);

    const onMessageChange = (value: string) => {
        setMessage(value);
        if (!id) return;
        const trimmed = value.trim();
        if (!trimmed) {
            stopLocalTypingSignal();
            return;
        }
        emitTyping(true);
        clearTypingEmitTimers();
        typingIdleRef.current = window.setTimeout(() => {
            typingIdleRef.current = null;
            emitTyping(false);
        }, 1600);
    };

    useEffect(() => () => {
        clearTypingEmitTimers();
    }, [clearTypingEmitTimers]);

    const onComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.nativeEvent.isComposing) return;
        if (event.key !== "Enter" || event.shiftKey) return;
        event.preventDefault();
        void sendMessage();
    };

    return (
        <section className="bg-muted/30 py-10">
            <div className="container mx-auto px-4">
                <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
                    <AccountNav />
                    <div className="min-w-0 space-y-5">
                        <Link href="/user/bookings" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary">
                            <ArrowLeft className="h-4 w-4" /> Back to bookings
                        </Link>

                        {loading ? <div className="rounded-3xl bg-card p-8 text-center text-muted-foreground">Loading booking...</div> : null}
                        {!loading && <>
                            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                                    <div>
                                        <h1 className="text-2xl font-bold">{booking.bookingNumber}</h1>
                                        <p className="mt-1 text-sm text-muted-foreground">{booking.serviceCategoryName} with {booking.providerName}</p>
                                    </div>
                                    <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold capitalize text-primary">{booking.status.replaceAll("_", " ")}</span>
                                </div>

                                <div className="mt-5 grid gap-4 md:grid-cols-2">
                                    <div className="rounded-2xl border border-border p-4">
                                        <div className="mb-2 flex items-center gap-2 font-semibold"><CalendarClock className="h-4 w-4 text-primary" /> Schedule</div>
                                        <p className="text-sm text-muted-foreground">{booking.scheduledTime ? moment(booking.scheduledTime).format("DD MMM YYYY, hh:mm A") : "Not scheduled"}</p>
                                        {booking.status === "in_progress" && booking.startTime ? (
                                            <p className="mt-2 text-xs text-muted-foreground">Job started: {moment(booking.startTime).format("DD MMM YYYY, hh:mm A")}</p>
                                        ) : null}
                                    </div>
                                    <div className="rounded-2xl border border-border p-4">
                                        <div className="mb-2 flex items-center gap-2 font-semibold"><MapPin className="h-4 w-4 text-primary" /> Address</div>
                                        <p className="text-sm text-muted-foreground">{[booking.location?.addressLine1, booking.location?.addressLine2, booking.location?.city, booking.location?.pincode].filter(Boolean).join(", ") || "N/A"}</p>
                                    </div>
                                </div>

                                <div className="mt-5">
                                    <h2 className="font-semibold">Selected Services</h2>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {booking.serviceTypes.map((service) => <span key={service._id} className="rounded-full bg-muted px-3 py-1 text-sm">{service.name}</span>)}
                                    </div>
                                </div>

                                {booking.issueDescription ? <p className="mt-4 rounded-2xl bg-muted/60 p-4 text-sm text-muted-foreground">{booking.issueDescription}</p> : null}
                            </div>

                            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <h2 className="text-xl font-bold">Quote & Price</h2>
                                    {!["completed", "cancelled"].includes(booking.status) ? (
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => void openCancelBookingDialog()}
                                            disabled={submitting}
                                        >
                                            <XCircle className="h-4 w-4" /> Cancel booking
                                        </Button>
                                    ) : null}
                                </div>
                                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                    <div className="rounded-2xl bg-muted/60 p-4"><p className="text-xs text-muted-foreground">Quoted Price</p><p className="text-xl font-bold">
                                        {booking.quotedPrice ? `₹ ${Number(booking.quotedPrice).toFixed(2)}` : "—"}
                                    </p></div>
                                    <div className="rounded-2xl bg-muted/60 p-4"><p className="text-xs text-muted-foreground">Agreed Price</p><p className="text-xl font-bold">
                                        {booking.agreedPrice ? `₹ ${Number(booking.agreedPrice).toFixed(2)}` : "—"}
                                    </p></div>
                                    <div className="rounded-2xl bg-muted/60 p-4"><p className="text-xs text-muted-foreground">Final Price</p><p className="text-xl font-bold">
                                        {booking.finalPrice ? `₹ ${Number(booking.finalPrice).toFixed(2)}` : "—"}
                                    </p></div>
                                </div>

                                {booking.status === "price_pending" && booking.quotedPrice ? (
                                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                                        <Button type="button" onClick={acceptQuote} disabled={submitting}><CheckCircle2 className="h-4 w-4" /> Accept Quote</Button>
                                    </div>
                                ) : null}
                            </div>

                            {booking.status === "in_progress" && booking.startTime ? (
                                <div className="rounded-3xl border border-emerald-200/80 bg-emerald-50/60 p-6 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/25">
                                    <h2 className="text-lg font-bold text-emerald-950 dark:text-emerald-100">Job in progress</h2>
                                    <p className="mt-2 text-sm text-emerald-900/90 dark:text-emerald-200/90">
                                        If the work is done, you can mark this booking complete here without sharing an OTP with your provider. Your provider can still complete the job from their app if needed.
                                    </p>
                                    <Button
                                        type="button"
                                        className="mt-4 bg-emerald-700 text-white hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                                        onClick={() => void openMarkCompleteDialog()}
                                        disabled={submitting}
                                    >
                                        <CheckCircle2 className="h-4 w-4" /> Mark job as complete
                                    </Button>
                                </div>
                            ) : booking.status === "in_progress" && !booking.startTime ? (
                                <div className="rounded-3xl border border-amber-200/80 bg-amber-50/60 p-6 text-sm text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/25 dark:text-amber-100">
                                    Your provider has not started the job on the app yet. Once they start, you can mark the job complete from here if you prefer not to use an OTP.
                                </div>
                            ) : null}

                            <BookingProviderRatingSection
                                key={id}
                                bookingId={id}
                                providerName={booking.providerName}
                                status={booking.status}
                                customerFeedback={booking.customerFeedback ?? null}
                                onFeedbackSaved={() => void getBooking()}
                            />

                            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <h2 className="text-xl font-bold">Chat with Provider</h2>
                                    <span className="inline-flex items-center gap-2 text-sm text-muted-foreground" title={providerOnline ? "Provider has this chat open in the app." : "Provider is not connected to this chat right now."}>
                                        <span className={cn("h-2 w-2 shrink-0 rounded-full", providerOnline ? "bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.35)]" : "bg-slate-400 dark:bg-slate-500")} aria-hidden />
                                        <span>{providerOnline ? "Provider online" : "Provider offline"}</span>
                                    </span>
                                </div>
                                <div
                                    ref={chatScrollRef}
                                    onScroll={onChatScroll}
                                    className="mt-4 max-h-96 overflow-y-auto overflow-x-hidden rounded-2xl bg-muted/40 px-4 py-4"
                                >
                                    <BookingChatThread
                                        messages={messages}
                                        customerMessagesOnLeft={false}
                                        variant="customer"
                                        emptyLabel="No messages yet."
                                    />
                                </div>
                                {providerTyping ? <ChatTypingIndicator label="Provider is typing" className="mt-3 px-0.5" /> : null}
                                <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
                                    <Textarea
                                        value={message}
                                        onChange={(event) => onMessageChange(event.target.value)}
                                        onKeyDown={onComposerKeyDown}
                                        onBlur={() => stopLocalTypingSignal()}
                                        placeholder="Type your message…"
                                        className="min-h-20 resize-y py-2 leading-normal md:text-sm"
                                        rows={3}
                                    />
                                    <Button type="button" onClick={() => void sendMessage()} disabled={submitting || !message.trim()}>{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send</Button>
                                </div>
                                <p className="mt-1.5 text-xs text-muted-foreground">Press Enter to send · Shift+Enter for a new line</p>
                            </div>
                        </>}
                    </div>
                </div>
            </div>
        </section>
    );
}
