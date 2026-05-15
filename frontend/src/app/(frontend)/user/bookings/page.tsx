"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import moment from "moment";
import { Briefcase, CalendarClock, ChevronRight, IndianRupee, MapPin } from "lucide-react";
import AccountNav from "@/components/front/user/AccountNav";
import { Button, Select } from "@/components/front/ui";
import AxiosHelper from "@/helpers/AxiosHelper";
import { bookingAccentStripeClass, bookingStatusBadgeClass } from "@/helpers/customerBookingStatus";
import { cn } from "@/helpers/utils";
import { toast } from "react-toastify";

type BookingRow = {
    _id: string;
    bookingNumber: string;
    providerName?: string;
    serviceCategoryName?: string;
    serviceTypeNames?: string[];
    cityName?: string;
    status: string;
    bookingTime?: string;
    scheduledTime?: string;
    finalPrice?: number | null;
};

type BookingData = {
    record: BookingRow[];
    count: number;
    totalPages: number;
    current_page: number;
};

const statuses = ["pending", "price_pending", "price_agreed", "confirmed", "in_progress", "completed", "cancelled"];

export default function CustomerBookingsPage() {
    const [data, setData] = useState<BookingData>({ record: [], count: 0, totalPages: 0, current_page: 1 });
    const [status, setStatus] = useState("");
    const [pageNo, setPageNo] = useState(1);
    const [loading, setLoading] = useState(true);

    const getData = useCallback(async () => {
        setLoading(true);
        const response = await AxiosHelper.getData("/customer/bookings", { pageNo, limit: 10, status });
        if (response.data.status) {
            setData(response.data.data as BookingData);
        } else if (response.status === 404) {
            setData({ record: [], count: 0, totalPages: 0, current_page: 1 });
        } else {
            toast.error(response.data.message || "Could not load bookings.");
        }
        setLoading(false);
    }, [pageNo, status]);

    useEffect(() => {
        const timer = window.setTimeout(() => { void getData(); }, 0);
        return () => window.clearTimeout(timer);
    }, [getData]);

    return (
        <section className="bg-muted/30 py-10">
            <div className="container mx-auto px-4">
                <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
                    <AccountNav />
                    <div className="min-w-0 rounded-3xl border border-border bg-card p-6 shadow-sm">
                        <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                            <div>
                                <h1 className="text-2xl font-bold">My Bookings</h1>
                                <p className="mt-1 text-sm text-muted-foreground">Track your service requests and booking status.</p>
                            </div>
                            <Select value={status} onChange={(event) => { setStatus(event.target.value); setPageNo(1); }} className="max-w-xs capitalize">
                                <option value="">All Statuses</option>
                                {statuses.map((item) => <option key={item} value={item} className="capitalize">{item.replaceAll("_", " ")}</option>)}
                            </Select>
                        </div>

                        {loading ? <p className="py-8 text-center text-muted-foreground">Loading bookings...</p> : null}
                        {!loading && data.record.length === 0 ? <p className="py-8 text-center text-muted-foreground">No bookings found.</p> : null}

                        <div className="space-y-2.5">
                            {data.record.map((booking) => (
                                <article key={booking._id} className="group relative overflow-hidden rounded-xl border border-border/80 bg-card px-3 py-2.5 pl-3 shadow-sm transition-colors hover:border-primary/25 sm:pl-3.5">
                                    <div className={cn("pointer-events-none absolute inset-y-0 left-0 w-0.5 bg-linear-to-b opacity-90 group-hover:opacity-100", bookingAccentStripeClass(booking.status))} aria-hidden />
                                    <div className="pl-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0 flex-1 space-y-1">
                                                <p className="text-sm font-semibold text-primary">{booking.bookingNumber}</p>
                                                <p className="truncate text-xs leading-snug text-muted-foreground">
                                                    <Briefcase className="mr-1 inline h-3 w-3 align-text-bottom text-primary/80" aria-hidden />
                                                    <span className="font-medium text-foreground/90">{booking.serviceCategoryName || "Service"}</span>
                                                    <span className="text-muted-foreground"> · </span>
                                                    <span>with {booking.providerName || "your professional"}</span>
                                                </p>
                                                {booking.serviceTypeNames?.length ? (
                                                    <ul className="flex flex-wrap gap-1 pt-0.5" aria-label="Service types">
                                                        {booking.serviceTypeNames.map((name, i) => (
                                                            <li key={`${booking._id}-st-${i}-${name}`} className="rounded-md border border-border/70 bg-muted/50 px-1.5 py-0.5 text-xs font-medium text-foreground/85 dark:bg-muted/30">
                                                                {name}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : null}
                                            </div>
                                            <span className={cn("inline-flex shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold capitalize leading-none", bookingStatusBadgeClass(booking.status))}>
                                                {booking.status.replaceAll("_", " ")}
                                            </span>
                                        </div>

                                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-0.5 border-t border-border/60 pt-2 text-xs text-muted-foreground">
                                            <span className="inline-flex max-w-[40%] items-center gap-1 truncate sm:max-w-none">
                                                <MapPin className="h-3 w-3 shrink-0 text-primary/80" aria-hidden />
                                                <span className="truncate">{booking.cityName || "—"}</span>
                                            </span>
                                            <span className="text-border">|</span>
                                            <span className="inline-flex items-center gap-1">
                                                <CalendarClock className="h-3 w-3 shrink-0 text-primary/80" aria-hidden />
                                                <span className="whitespace-nowrap">
                                                    {booking.scheduledTime
                                                        ? moment(booking.scheduledTime).format("DD MMM, hh:mm A")
                                                        : booking.bookingTime
                                                            ? moment(booking.bookingTime).format("DD MMM YYYY")
                                                            : "—"}
                                                </span>
                                            </span>
                                            <span className="hidden text-border sm:inline">|</span>
                                            <span className="inline-flex w-full items-center gap-1 sm:w-auto">
                                                <IndianRupee className="h-3 w-3 shrink-0 text-primary/80" aria-hidden />
                                                <span className="font-medium text-foreground/90">
                                                    {booking.finalPrice != null
                                                        ? `₹${Number(booking.finalPrice).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
                                                        : "—"}
                                                </span>
                                            </span>
                                        </div>

                                        <div className="mt-2 flex justify-end border-t border-border/60 pt-2">
                                            <Link href={`/user/bookings/${booking._id}`} className={"inline-flex shrink-0 items-center gap-0.5 rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"}>
                                                Details
                                                <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>

                        {data.totalPages > 1 ? (
                            <div className="mt-5 flex justify-end gap-2">
                                <Button type="button" variant="outline" disabled={pageNo <= 1} onClick={() => setPageNo((prev) => Math.max(prev - 1, 1))}>Previous</Button>
                                <Button type="button" variant="outline" disabled={pageNo >= data.totalPages} onClick={() => setPageNo((prev) => prev + 1)}>Next</Button>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </section>
    );
}
