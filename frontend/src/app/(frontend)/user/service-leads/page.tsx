"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import moment from "moment";
import { Briefcase, CalendarClock, ChevronRight, ClipboardList, MapPin } from "lucide-react";
import AccountNav from "@/components/front/user/AccountNav";
import { Button, Select } from "@/components/front/ui";
import AxiosHelper from "@/helpers/AxiosHelper";
import { cn } from "@/helpers/utils";
import { toast } from "react-toastify";

type ServiceLeadRow = {
    _id: string;
    leadNumber: string;
    status: "open" | "assigned" | "cancelled";
    scheduledTime?: string;
    issueDescription?: string | null;
    bookingId?: string | null;
    createdAt?: string;
    serviceCategoryName?: string;
    cityName?: string;
};

type LeadsData = {
    record: ServiceLeadRow[];
    count: number;
    totalPages: number;
    current_page: number;
};

const statuses: Array<{ value: ""; label: string } | { value: "open" | "assigned" | "cancelled"; label: string }> = [
    { value: "", label: "All statuses" },
    { value: "open", label: "Open" },
    { value: "assigned", label: "Assigned" },
    { value: "cancelled", label: "Cancelled" }
];

function leadStatusBadgeClass(status: string) {
    switch (status) {
        case "assigned":
            return "bg-indigo-100 text-indigo-900 ring-1 ring-indigo-200/80 dark:bg-indigo-950/50 dark:text-indigo-100 dark:ring-indigo-800";
        case "cancelled":
            return "bg-slate-200 text-slate-800 ring-1 ring-slate-300/80 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-600";
        case "open":
            return "bg-amber-100 text-amber-950 ring-1 ring-amber-200/90 dark:bg-amber-950/40 dark:text-amber-100 dark:ring-amber-800";
        default:
            return "bg-primary/12 text-primary ring-1 ring-primary/20";
    }
}

function bookingIdHref(id: string | null | undefined) {
    if (id == null || id === "") return null;
    return `/user/bookings/${String(id)}`;
}

export default function CustomerServiceLeadsPage() {
    const [data, setData] = useState<LeadsData>({ record: [], count: 0, totalPages: 0, current_page: 1 });
    const [params, setParams] = useState<{ pageNo: number, status: "" | "open" | "assigned" | "cancelled", limit: number }>({ pageNo: 1, status: "", limit: 10 });
    const [loading, setLoading] = useState(true);

    const getData = useCallback(async () => {
        setLoading(true);
        const response = await AxiosHelper.getData("/customer/service-leads", params);
        if (response.data.status) {
            setData(response.data.data as LeadsData);
        } else if (response.status === 404) {
            setData({ record: [], count: 0, totalPages: 0, current_page: 1 });
        } else {
            toast.error(response.data.message || "Could not load booking requests.");
        }
        setLoading(false);
    }, [params]);

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
                                <h1 className="text-2xl font-bold">Booking requests</h1>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Requests submitted without choosing a provider. When we assign one, you can open the booking here.
                                </p>
                            </div>
                            <Select
                                value={params.status}
                                onChange={(event) => {
                                    setParams({ ...params, status: event.target.value as "" | "open" | "assigned" | "cancelled" });
                                }}
                                className="max-w-xs capitalize"
                            >
                                {statuses.map((item) => (
                                    <option key={item.value || "all"} value={item.value} className="capitalize">
                                        {item.label}
                                    </option>
                                ))}
                            </Select>
                        </div>

                        {loading ? <p className="py-8 text-center text-muted-foreground">Loading requests...</p> : null}
                        {!loading && data.record.length === 0 ? (
                            <p className="py-8 text-center text-muted-foreground">No booking requests yet.</p>
                        ) : null}

                        <div className="space-y-4">
                            {data.record.map((lead) => {
                                const bookingHref = lead.status === "assigned" ? bookingIdHref(lead.bookingId) : null;
                                return (
                                    <article
                                        key={lead._id}
                                        className="group relative overflow-hidden rounded-2xl border border-border/90 bg-card p-5 shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md"
                                    >
                                        <div
                                            className={cn(
                                                "pointer-events-none absolute inset-y-0 left-0 w-1 bg-linear-to-b from-primary to-primary/60 opacity-90 transition-opacity group-hover:opacity-100",
                                                lead.status === "cancelled" && "from-slate-400 to-slate-500",
                                                lead.status === "assigned" && "from-indigo-500 to-indigo-600",
                                                lead.status === "open" && "from-amber-500 to-amber-600"
                                            )}
                                            aria-hidden
                                        />
                                        <div className="pl-3 sm:pl-4">
                                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                                <div className="min-w-0 flex-1 space-y-2">
                                                    <div className="flex items-start gap-2">
                                                        <ClipboardList className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                                                        <div className="min-w-0">
                                                            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Request ref</p>
                                                            <p className="font-mono text-lg font-bold tracking-tight text-foreground sm:text-xl">{lead.leadNumber}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-2.5 text-sm leading-snug text-muted-foreground">
                                                        <Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                                                        <p>
                                                            <span className="font-medium text-foreground">{lead.serviceCategoryName || "Service"}</span>
                                                            <span className="text-muted-foreground"> · </span>
                                                            <span>{lead.cityName || "—"}</span>
                                                        </p>
                                                    </div>
                                                    {lead.issueDescription ? (
                                                        <p className="line-clamp-2 text-sm text-muted-foreground">{lead.issueDescription}</p>
                                                    ) : null}
                                                </div>
                                                <span
                                                    className={cn(
                                                        "inline-flex shrink-0 items-center rounded-full px-3 py-1.5 text-xs font-semibold capitalize tracking-wide",
                                                        leadStatusBadgeClass(lead.status)
                                                    )}
                                                >
                                                    {lead.status}
                                                </span>
                                            </div>

                                            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                                <div className="flex gap-3 rounded-xl border border-border/60 bg-muted/35 px-3 py-3 dark:bg-muted/15">
                                                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                                                    <div className="min-w-0">
                                                        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">City</p>
                                                        <p className="truncate text-sm font-medium text-foreground">{lead.cityName || "—"}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-3 rounded-xl border border-border/60 bg-muted/35 px-3 py-3 dark:bg-muted/15">
                                                    <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                                                    <div className="min-w-0">
                                                        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Preferred time</p>
                                                        <p className="text-sm font-medium text-foreground">
                                                            {lead.scheduledTime ? moment(lead.scheduledTime).format("DD MMM YYYY, hh:mm A") : "—"}
                                                        </p>
                                                        {lead.createdAt ? (
                                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                                Submitted {moment(lead.createdAt).format("DD MMM YYYY")}
                                                            </p>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-5 flex flex-col gap-3 border-t border-border/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
                                                <p className="text-xs text-muted-foreground">
                                                    {lead.status === "open"
                                                        ? "We are finding a provider for you."
                                                        : lead.status === "assigned"
                                                            ? "A provider has been assigned. Open your booking to confirm details and pricing."
                                                            : "This request was cancelled."}
                                                </p>
                                                {bookingHref ? (
                                                    <Link
                                                        href={bookingHref}
                                                        className={cn(
                                                            "inline-flex h-9 w-full items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all",
                                                            "bg-primary hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:h-8 sm:w-auto sm:px-3"
                                                        )}
                                                    >
                                                        View booking
                                                        <ChevronRight className="h-4 w-4 opacity-90" aria-hidden />
                                                    </Link>
                                                ) : null}
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>

                        {data.totalPages > 1 ? (
                            <div className="mt-5 flex justify-end gap-2">
                                <Button type="button" variant="outline" disabled={params.pageNo <= 1} onClick={() => setParams({ ...params, pageNo: Math.max(params.pageNo - 1, 1) })}>
                                    Previous
                                </Button>
                                <Button type="button" variant="outline" disabled={params.pageNo >= data.totalPages} onClick={() => setParams({ ...params, pageNo: params.pageNo + 1 })}>
                                    Next
                                </Button>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </section>
    );
}
