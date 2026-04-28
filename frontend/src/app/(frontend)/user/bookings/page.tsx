"use client";

import { useCallback, useEffect, useState } from "react";
import moment from "moment";
import AccountNav from "@/components/front/user/AccountNav";
import { Button, Select } from "@/components/front/ui";
import AxiosHelper from "@/helpers/AxiosHelper";
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
                            <Select value={status} onChange={(event) => { setStatus(event.target.value); setPageNo(1); }} className="max-w-xs">
                                <option value="">All statuses</option>
                                {statuses.map((item) => <option key={item} value={item}>{item.replaceAll("_", " ")}</option>)}
                            </Select>
                        </div>

                        {loading ? <p className="py-8 text-center text-muted-foreground">Loading bookings...</p> : null}
                        {!loading && data.record.length === 0 ? <p className="py-8 text-center text-muted-foreground">No bookings found.</p> : null}

                        <div className="space-y-3">
                            {data.record.map((booking) => (
                                <div key={booking._id} className="rounded-2xl border border-border p-4">
                                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                                        <div>
                                            <p className="font-semibold">{booking.bookingNumber}</p>
                                            <p className="mt-1 text-sm text-muted-foreground">{booking.serviceCategoryName || "Service"} with {booking.providerName || "provider"}</p>
                                            {booking.serviceTypeNames?.length ? <p className="mt-1 text-xs text-muted-foreground">{booking.serviceTypeNames.join(", ")}</p> : null}
                                        </div>
                                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold capitalize text-primary">{booking.status.replaceAll("_", " ")}</span>
                                    </div>
                                    <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                                        <span>City: {booking.cityName || "—"}</span>
                                        <span>Booked: {booking.bookingTime ? moment(booking.bookingTime).format("DD MMM YYYY") : "—"}</span>
                                        <span>Amount: {booking.finalPrice != null ? `₹${booking.finalPrice}` : "—"}</span>
                                    </div>
                                </div>
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
