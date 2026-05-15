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
            return "border border-primary/20 bg-primary/10 text-primary dark:border-primary/25 dark:bg-primary/15 dark:text-primary";
        case "cancelled":
            return "border border-border bg-muted/90 text-muted-foreground";
        case "open":
            return "border border-border bg-muted/70 text-foreground/75 dark:bg-muted/50 dark:text-foreground/80";
        default:
            return "border border-border bg-muted text-muted-foreground";
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
                                <h1 className="text-2xl font-bold">Booking Requests</h1>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Requests submitted without choosing a provider. When we assign one, you can open the booking here.
                                </p>
                            </div>
                            <Select
                                value={params.status}
                                onChange={(event) => {
                                    setParams({ ...params, status: event.target.value as "" | "open" | "assigned" | "cancelled", pageNo: 1 });
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

                        <div className="space-y-2.5">
                            {data.record.map((lead) => {
                                const bookingHref = lead.status === "assigned" ? bookingIdHref(lead.bookingId) : null;
                                const hint =
                                    lead.status === "open"
                                        ? "Finding a provider."
                                        : lead.status === "assigned"
                                            ? "Open your booking to confirm pricing."
                                            : "Cancelled.";
                                return (
                                    <article key={lead._id} className="group relative overflow-hidden rounded-xl border border-border/80 bg-card px-3 py-2.5 pl-3 shadow-sm transition-colors hover:border-primary/25 sm:pl-3.5">
                                        <div
                                            className={cn(
                                                "pointer-events-none absolute inset-y-0 left-0 w-0.5 bg-linear-to-b from-primary to-primary/60 opacity-90 group-hover:opacity-100",
                                                lead.status === "cancelled" && "from-muted-foreground/35 to-muted-foreground/15",
                                                lead.status === "assigned" && "from-primary to-primary/70",
                                                lead.status === "open" && "from-muted-foreground/45 to-muted-foreground/20"
                                            )}
                                            aria-hidden
                                        />
                                        <div className="pl-2">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                                                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                                                            <ClipboardList className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                                                        </span>
                                                        <span className="text-sm font-semibold text-primary">{lead.leadNumber}</span>
                                                    </div>
                                                    <p className="mt-0.5 truncate text-sm text-muted-foreground">
                                                        <Briefcase className="mr-1 inline h-3 w-3 align-text-bottom text-primary/80" aria-hidden />
                                                        <span className="font-medium text-foreground/90">{lead.serviceCategoryName || "Service"}</span>
                                                        <span className="text-muted-foreground"> · </span>
                                                        <span>{lead.cityName || "—"}</span>
                                                    </p>
                                                    {lead.issueDescription ? <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{lead.issueDescription}</p> : null}
                                                </div>
                                                <span className={cn("inline-flex shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold capitalize leading-none", leadStatusBadgeClass(lead.status))}>
                                                    {lead.status}
                                                </span>
                                            </div>

                                            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-0.5 border-t border-border/60 pt-2 text-xs text-muted-foreground">
                                                <span className="inline-flex max-w-[45%] items-center gap-1 truncate sm:max-w-none">
                                                    <MapPin className="h-3 w-3 shrink-0 text-primary/80" aria-hidden />
                                                    <span className="truncate">{lead.cityName || "—"}</span>
                                                </span>
                                                <span className="text-border">|</span>
                                                <span className="inline-flex items-center gap-1">
                                                    <CalendarClock className="h-3 w-3 shrink-0 text-primary/80" aria-hidden />
                                                    <span className="whitespace-nowrap">
                                                        {lead.scheduledTime ? moment(lead.scheduledTime).format("DD MMM, hh:mm A") : "—"}
                                                    </span>
                                                </span>
                                                {lead.createdAt ? <>
                                                    <span className="hidden text-border sm:inline">|</span>
                                                    <span className="w-full text-xs sm:w-auto">Submitted : {moment(lead.createdAt).format("DD MMM YY")}</span>
                                                </> : null}
                                            </div>

                                            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                                                <p className="min-w-0 flex-1 text-xs leading-snug text-muted-foreground">{hint}</p>
                                                {bookingHref ? <Link href={bookingHref} className="inline-flex shrink-0 items-center gap-0.5 rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
                                                    Booking
                                                    <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                                                </Link> : null}
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
