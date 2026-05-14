"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import moment from "moment";
import { Briefcase, CalendarClock, ChevronRight, IndianRupee, MapPin } from "lucide-react";
import AccountNav from "@/components/front/user/AccountNav";
import { Button, Select } from "@/components/front/ui";
import AxiosHelper from "@/helpers/AxiosHelper";
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

function bookingStatusBadgeClass(status: string) {
    switch (status) {
        case "completed":
            return "bg-emerald-100 text-emerald-900 ring-1 ring-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-100 dark:ring-emerald-800";
        case "cancelled":
            return "bg-slate-200 text-slate-800 ring-1 ring-slate-300/80 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-600";
        case "in_progress":
            return "bg-sky-100 text-sky-900 ring-1 ring-sky-200/80 dark:bg-sky-950/50 dark:text-sky-100 dark:ring-sky-800";
        case "confirmed":
        case "price_agreed":
            return "bg-indigo-100 text-indigo-900 ring-1 ring-indigo-200/80 dark:bg-indigo-950/50 dark:text-indigo-100 dark:ring-indigo-800";
        case "price_pending":
            return "bg-amber-100 text-amber-950 ring-1 ring-amber-200/90 dark:bg-amber-950/40 dark:text-amber-100 dark:ring-amber-800";
        default:
            return "bg-primary/12 text-primary ring-1 ring-primary/20";
    }
}

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

                        <div className="space-y-4">
                            {data.record.map((booking) => (
                                <article
                                    key={booking._id}
                                    className="group relative overflow-hidden rounded-2xl border border-border/90 bg-card p-5 shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md"
                                >
                                    <div
                                        className={cn(
                                            "pointer-events-none absolute inset-y-0 left-0 w-1 bg-linear-to-b from-primary to-primary/60 opacity-90 transition-opacity group-hover:opacity-100",
                                            booking.status === "cancelled" && "from-slate-400 to-slate-500",
                                            booking.status === "completed" && "from-emerald-500 to-emerald-600"
                                        )}
                                        aria-hidden
                                    />
                                    <div className="pl-3 sm:pl-4">
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="min-w-0 flex-1 space-y-2">
                                                <div>
                                                    <p className="mt-0.5 font-mono text-lg font-bold tracking-tight text-foreground sm:text-xl">{booking.bookingNumber}</p>
                                                </div>
                                                <div className="flex items-start gap-2.5 text-sm leading-snug text-muted-foreground">
                                                    <Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                                                    <p>
                                                        <span className="font-medium text-foreground">{booking.serviceCategoryName || "Service"}</span>
                                                        <span className="text-muted-foreground"> · </span>
                                                        <span>with {booking.providerName || "your professional"}</span>
                                                    </p>
                                                </div>
                                                {booking.serviceTypeNames?.length ? (
                                                    <ul className="flex flex-wrap gap-1.5 pt-0.5" aria-label="Service types">
                                                        {booking.serviceTypeNames.map((name, i) => (
                                                            <li
                                                                key={`${booking._id}-st-${i}-${name}`}
                                                                className="rounded-lg border border-border/80 bg-muted/40 px-2.5 py-1 text-xs font-medium text-foreground/90 dark:bg-muted/25"
                                                            >
                                                                {name}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : null}
                                            </div>
                                            <span
                                                className={cn(
                                                    "inline-flex shrink-0 items-center rounded-full px-3 py-1.5 text-xs font-semibold capitalize tracking-wide",
                                                    bookingStatusBadgeClass(booking.status)
                                                )}
                                            >
                                                {booking.status.replaceAll("_", " ")}
                                            </span>
                                        </div>

                                        <div className="mt-5 grid gap-3 sm:grid-cols-3">
                                            <div className="flex gap-3 rounded-xl border border-border/60 bg-muted/35 px-3 py-3 dark:bg-muted/15">
                                                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                                                <div className="min-w-0">
                                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">City</p>
                                                    <p className="truncate text-sm font-medium text-foreground">{booking.cityName || "—"}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-3 rounded-xl border border-border/60 bg-muted/35 px-3 py-3 dark:bg-muted/15">
                                                <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                                                <div className="min-w-0">
                                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                                        {booking.scheduledTime ? "Scheduled" : "Booked on"}
                                                    </p>
                                                    <p className="text-sm font-medium text-foreground">
                                                        {booking.scheduledTime
                                                            ? moment(booking.scheduledTime).format("DD MMM YYYY, hh:mm A")
                                                            : booking.bookingTime
                                                                ? moment(booking.bookingTime).format("DD MMM YYYY")
                                                                : "—"}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-3 rounded-xl border border-border/60 bg-muted/35 px-3 py-3 dark:bg-muted/15">
                                                <IndianRupee className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                                                <div className="min-w-0">
                                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Amount</p>
                                                    <p className="text-sm font-medium text-foreground">
                                                        {booking.finalPrice != null ? `₹${Number(booking.finalPrice).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}` : "—"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-5 flex justify-end border-t border-border/70 pt-4">
                                            <Link
                                                href={`/user/bookings/${booking._id}`}
                                                className={cn(
                                                    "inline-flex h-9 w-full items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all",
                                                    "bg-primary hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:h-8 sm:px-3 sm:text-sm sm:w-auto"
                                                )}
                                            >
                                                View details
                                                <ChevronRight className="h-4 w-4 opacity-90" aria-hidden />
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
