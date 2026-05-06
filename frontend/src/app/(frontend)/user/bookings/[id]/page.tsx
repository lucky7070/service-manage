"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import moment from "moment";
import { ArrowLeft, CalendarClock, CheckCircle2, Loader2, MapPin, Send, XCircle } from "lucide-react";
import { toast } from "react-toastify";
import { BookingChatThread } from "@/components/chat/BookingChatThread";
import AccountNav from "@/components/front/user/AccountNav";
import { Button, Input, Textarea } from "@/components/front/ui";
import AxiosHelper from "@/helpers/AxiosHelper";
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
    location?: { addressLine1?: string; addressLine2?: string; landmark?: string; city?: string; state?: string; pincode?: string };
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
        location: {
            addressLine1: "",
            addressLine2: "",
            landmark: "",
            city: "",
            state: "",
            pincode: "",
        },
    });
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [message, setMessage] = useState("");
    const [cancelReason, setCancelReason] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

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
        socket.emit("booking:join", id);
        const onMessage = (next: ChatMessage) => {
            if (String(next?._id || "")) setMessages((prev) => prev.some((row) => row._id === next._id) ? prev : [...prev, next]);
        };
        socket.on("booking:message", onMessage);
        return () => {
            socket.off("booking:message", onMessage);
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

    const cancelBooking = async () => {
        setSubmitting(true);
        const { data } = await AxiosHelper.putData(`/customer/bookings/${id}/cancel`, { cancellationReason: cancelReason });
        if (data.status) {
            toast.success(data.message || "Booking cancelled.");
            await getBooking();
        } else {
            toast.error(data.message || "Could not cancel booking.");
        }
        setSubmitting(false);
    };

    const sendMessage = async () => {
        if (!message.trim() || submitting || !id) return;

        setSubmitting(true);
        const { data } = await AxiosHelper.postData(`/customer/bookings/${id}/messages`, { message });
        if (data.status) {
            setMessage("");
            setMessages((prev) => prev.some((row) => row._id === data.data?._id) ? prev : [...prev, data.data as ChatMessage]);
        } else {
            toast.error(data.message || "Could not send message.");
        }
        setSubmitting(false);
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
                                <h2 className="text-xl font-bold">Quote & Price</h2>
                                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                    <div className="rounded-2xl bg-muted/60 p-4"><p className="text-xs text-muted-foreground">Quoted Price</p><p className="text-xl font-bold">₹{Number(booking.quotedPrice || 0).toFixed(2)}</p></div>
                                    <div className="rounded-2xl bg-muted/60 p-4"><p className="text-xs text-muted-foreground">Agreed Price</p><p className="text-xl font-bold">₹{Number(booking.agreedPrice || 0).toFixed(2)}</p></div>
                                    <div className="rounded-2xl bg-muted/60 p-4"><p className="text-xs text-muted-foreground">Final Price</p><p className="text-xl font-bold">₹{Number(booking.finalPrice || 0).toFixed(2)}</p></div>
                                </div>

                                {booking.status === "price_pending" && booking.quotedPrice ? (
                                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                                        <Button type="button" onClick={acceptQuote} disabled={submitting}><CheckCircle2 className="h-4 w-4" /> Accept Quote</Button>
                                    </div>
                                ) : null}

                                {!["completed", "cancelled"].includes(booking.status) ? (
                                    <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
                                        <Input value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} placeholder="Cancellation reason (optional)" />
                                        <Button type="button" variant="outline" onClick={cancelBooking} disabled={submitting}><XCircle className="h-4 w-4" /> Cancel Booking</Button>
                                    </div>
                                ) : null}
                            </div>

                            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                                <h2 className="text-xl font-bold">Chat with Provider</h2>
                                <div className="mt-4 max-h-96 overflow-y-auto rounded-2xl bg-muted/40 px-4 py-4">
                                    <BookingChatThread
                                        messages={messages}
                                        customerMessagesOnLeft={false}
                                        variant="customer"
                                        emptyLabel="No messages yet."
                                    />
                                </div>
                                <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
                                    <Textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Type your message..." className="min-h-12" />
                                    <Button type="button" onClick={sendMessage} disabled={submitting || !message.trim()}>{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send</Button>
                                </div>
                            </div>
                        </>}
                    </div>
                </div>
            </div>
        </section>
    );
}
