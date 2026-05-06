"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import moment from "moment";
import { ArrowLeft, CalendarClock, MapPin, MessageCircle } from "lucide-react";
import { toast } from "react-toastify";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { BookingChatThread } from "@/components/chat/BookingChatThread";
import AxiosHelperAdmin from "@/helpers/AxiosHelperAdmin";
import { Badge, Button, statusToBadgeVariant } from "@/components/ui";

type ServiceTypeRow = {
    _id: string;
    name: string;
    basePrice?: number | null;
    estimatedTimeMinutes?: number | null;
};

type BookingDetail = {
    _id: string;
    bookingNumber: string;
    customerName: string;
    customerMobile: string;
    providerName: string;
    providerMobile?: string;
    serviceCategoryName: string;
    cityName: string;
    status: string;
    issueDescription?: string;
    quotedPrice?: number | null;
    agreedPrice?: number | null;
    finalPrice?: number | null;
    scheduledTime?: string;
    createdAt?: string;
    location?: {
        addressLine1?: string;
        addressLine2?: string;
        landmark?: string;
        city?: string;
        state?: string;
        pincode?: string;
        locationType?: string;
    };
    serviceTypes: ServiceTypeRow[];
};

type ChatMessage = {
    _id: string;
    senderType: "customer" | "provider";
    message: string;
    createdAt?: string;
};

export default function AdminBookingDetailPage() {
    const router = useRouter();
    const { id } = useParams<{ id: string }>();
    const [booking, setBooking] = useState<BookingDetail | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(true);

    const getData = useCallback(async () => {
        const { data } = await AxiosHelperAdmin.getData(`/bookings/${id}`);
        if (data.status && data.data) {
            setBooking(data.data.booking as BookingDetail);
            setMessages(Array.isArray(data.data.messages) ? data.data.messages : []);
        } else {
            toast.error(data.message || "Could not load booking detail.");
            router.push("/admin/bookings");
        }
        setLoading(false);
    }, [id, router]);

    useEffect(() => {
        const timer = window.setTimeout(() => { void getData(); }, 0);
        return () => window.clearTimeout(timer);
    }, [getData]);

    return (
        <section className="space-y-4">
            <AdminPageHeader
                title={booking ? `Booking ${booking.bookingNumber}` : "Booking Detail"}
                subtitle="Review booking details, pricing, address, and complete chat history."
                action={
                    <Link href="/admin/bookings">
                        <Button type="button" variant="secondary" size="md">
                            <ArrowLeft className="h-4 w-4" /> Back to Bookings
                        </Button>
                    </Link>
                }
            />

            {loading ? (
                <div className="rounded-2xl border border-indigo-100 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                    Loading booking detail...
                </div>
            ) : booking ? (
                <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
                    <div className="space-y-4">
                        <div className="grid gap-3 md:grid-cols-3">
                            <div className="rounded-2xl border border-indigo-100 bg-white p-4 text-slate-900 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100">
                                <p className="text-xs text-slate-500 dark:text-slate-400">Customer</p>
                                <p className="mt-1 font-semibold text-slate-900 dark:text-slate-50">{booking.customerName || "—"}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{booking.customerMobile || ""}</p>
                            </div>
                            <div className="rounded-2xl border border-indigo-100 bg-white p-4 text-slate-900 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100">
                                <p className="text-xs text-slate-500 dark:text-slate-400">Provider</p>
                                <p className="mt-1 font-semibold text-slate-900 dark:text-slate-50">{booking.providerName || "—"}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{booking.providerMobile || ""}</p>
                            </div>
                            <div className="rounded-2xl border border-indigo-100 bg-white p-4 text-slate-900 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100">
                                <p className="text-xs text-slate-500 dark:text-slate-400">Status</p>
                                <Badge variant={statusToBadgeVariant(booking.status)} size="sm" className="mt-2 capitalize">{booking.status.replaceAll("_", " ")}</Badge>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-indigo-100 bg-white p-4 text-slate-900 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100">
                            <h3 className="font-semibold text-slate-900 dark:text-slate-50">Service Details</h3>
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{booking.serviceCategoryName} {booking.cityName ? `in ${booking.cityName}` : ""}</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {booking.serviceTypes?.map((service) => (
                                    <span key={service._id} className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-100">
                                        {service.name}
                                    </span>
                                ))}
                            </div>
                            {booking.issueDescription ? <p className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-200">{booking.issueDescription}</p> : null}
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                            <div className="rounded-2xl border border-indigo-100 bg-white p-4 text-slate-900 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100">
                                <h3 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-50"><CalendarClock className="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" /> Schedule</h3>
                                <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">{booking.scheduledTime ? moment(booking.scheduledTime).format("DD MMM YYYY, hh:mm A") : "—"}</p>
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Created: {booking.createdAt ? moment(booking.createdAt).format("DD MMM YYYY, hh:mm A") : "—"}</p>
                            </div>
                            <div className="rounded-2xl border border-indigo-100 bg-white p-4 text-slate-900 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100">
                                <h3 className="font-semibold text-slate-900 dark:text-slate-50">Price</h3>
                                <div className="mt-2 grid grid-cols-3 gap-2 text-sm text-slate-800 dark:text-slate-200">
                                    <span>Quote: ₹{Number(booking.quotedPrice || 0).toFixed(2)}</span>
                                    <span>Agreed: ₹{Number(booking.agreedPrice || 0).toFixed(2)}</span>
                                    <span>Final: ₹{Number(booking.finalPrice || 0).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-indigo-100 bg-white p-4 text-slate-900 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100">
                            <h3 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-50"><MapPin className="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" /> Service Address</h3>
                            <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
                                {[booking.location?.addressLine1, booking.location?.addressLine2, booking.location?.landmark, booking.location?.city, booking.location?.state, booking.location?.pincode].filter(Boolean).join(", ") || "—"}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-indigo-100 bg-white p-4 text-slate-900 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100">
                        <div className="mb-3 flex items-center gap-2">
                            <MessageCircle className="h-5 w-5 shrink-0 text-indigo-600 dark:text-indigo-400" />
                            <h3 className="font-semibold text-slate-900 dark:text-slate-50">Chat History</h3>
                        </div>
                        <div className="max-h-[calc(100vh-260px)] min-h-96 flex-1 overflow-y-auto rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 dark:border-slate-700 dark:bg-slate-950/60">
                            <BookingChatThread
                                messages={messages}
                                customerMessagesOnLeft
                                variant="admin"
                                emptyLabel="No chat messages found."
                            />
                        </div>
                    </div>
                </div>
            ) : null}
        </section>
    );
}
