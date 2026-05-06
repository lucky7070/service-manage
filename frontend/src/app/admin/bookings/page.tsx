"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { debounce } from "lodash";
import moment from "moment";
import { Eye } from "lucide-react";

import AdminNoTableRecords from "@/components/admin/AdminNoTableRecords";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminPagination from "@/components/admin/AdminPagination";
import AxiosHelperAdmin from "@/helpers/AxiosHelperAdmin";
import { Badge, Button, Input, Option, Select, statusToBadgeVariant } from "@/components/ui";

type BookingRow = {
    _id: string;
    bookingNumber: string;
    customerName: string;
    customerMobile: string;
    providerName: string;
    serviceCategoryName: string;
    cityName: string;
    status: string;
    quotedPrice?: number | null;
    finalPrice?: number | null;
    scheduledTime?: string;
    createdAt?: string;
};

type BookingRecord = {
    count: number;
    record: BookingRow[];
    totalPages: number;
    pagination: number[];
};

const statuses = ["pending", "price_pending", "price_agreed", "confirmed", "in_progress", "completed", "cancelled"];

export default function AdminBookingsPage() {
    const debouncedFetchRef = useRef(debounce(() => { }, 0));
    const [data, setData] = useState<BookingRecord>({ count: 0, record: [], totalPages: 0, pagination: [] });
    const [param, setParam] = useState<{ limit: number; pageNo: number; query: string; status: string }>({ limit: 10, pageNo: 1, query: "", status: "" });

    const fetchBookings = useCallback(async () => {
        const { data } = await AxiosHelperAdmin.getData("/bookings", param);
        if (data.status && data.data) {
            const { count, totalPages, record, pagination } = data.data;
            setData({ count, totalPages, record, pagination });
        } else {
            setData({ count: 0, totalPages: 0, record: [], pagination: [] });
        }
    }, [param]);

    useEffect(() => {
        debouncedFetchRef.current = debounce(() => { fetchBookings(); }, 500);
    }, [fetchBookings]);

    useEffect(() => {
        debouncedFetchRef.current();
        return () => { debouncedFetchRef.current.cancel(); };
    }, [param]);

    return (
        <section className="space-y-4">
            <AdminPageHeader title="Bookings" subtitle="View service bookings, customer/provider details, prices, schedule, and chat history." />

            <div className="rounded-2xl border border-indigo-100 bg-white p-4 dark:border-indigo-100 dark:bg-slate-900">
                <div className="mb-3 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                    <Input
                        value={param.query}
                        onChange={(e) => setParam((prev) => ({ ...prev, pageNo: 1, query: e.target.value }))}
                        className="max-w-xs"
                        placeholder="Search booking, customer, provider..."
                    />
                    <Select
                        value={param.status}
                        onChange={(e) => setParam((prev) => ({ ...prev, pageNo: 1, status: e.target.value }))}
                        className="max-w-[220px]"
                    >
                        <Option value="">All statuses</Option>
                        {statuses.map((status) => <Option key={status} value={status}>{status.replaceAll("_", " ")}</Option>)}
                    </Select>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-[#edf3ff] text-left text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            <tr>
                                <th className="px-3 py-2">Booking</th>
                                <th className="px-3 py-2">Customer</th>
                                <th className="px-3 py-2">Provider</th>
                                <th className="px-3 py-2">Service</th>
                                <th className="px-3 py-2">Schedule</th>
                                <th className="px-3 py-2">Status</th>
                                <th className="px-3 py-2">Amount</th>
                                <th className="px-3 py-2 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.record.map((booking) => (
                                <tr key={booking._id} className="border-t border-indigo-100 dark:border-slate-700">
                                    <td className="px-3 py-2 font-medium text-slate-900 dark:text-slate-100">{booking.bookingNumber}</td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                        <p>{booking.customerName || "—"}</p>
                                        <p className="text-xs text-slate-500">{booking.customerMobile || ""}</p>
                                    </td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{booking.providerName || "—"}</td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{booking.serviceCategoryName || "—"}</td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{booking.scheduledTime ? moment(booking.scheduledTime).format("DD-MM-YYYY hh:mm A") : "—"}</td>
                                    <td className="px-3 py-2">
                                        <Badge variant={statusToBadgeVariant(booking.status)} size="sm" className="capitalize">{booking.status.replaceAll("_", " ")}</Badge>
                                    </td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">₹{Number(booking.finalPrice || booking.quotedPrice || 0).toFixed(2)}</td>
                                    <td className="px-3 py-2 text-right">
                                        <Link href={`/admin/bookings/${booking._id}`}>
                                            <Button type="button" variant="ghost" size="sm">
                                                <Eye className="h-4 w-4" /> View
                                            </Button>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            <AdminNoTableRecords show={data.record.length === 0} />
                        </tbody>
                    </table>
                </div>

                <AdminPagination data={data} param={param} setParam={setParam} />
            </div>
        </section>
    );
}
