"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarCheck, CheckCircle2, Clock3, Home, LogOut, UserRound, XCircle } from "lucide-react";
import moment from "moment";
import { toast } from "react-toastify";
import AccountNav from "@/components/front/user/AccountNav";
import { Button } from "@/components/front/ui";
import AxiosHelper from "@/helpers/AxiosHelper";

type BookingRow = {
    _id: string;
    bookingNumber: string;
    providerName?: string;
    serviceCategoryName?: string;
    status: string;
    bookingTime?: string;
};

type DashboardData = {
    profile?: { name: string; mobile: string; email?: string; userId?: string };
    addressCount: number;
    bookingStats: Record<string, number>;
    recentBookings: BookingRow[];
};

const statCards = [
    { key: "total", label: "Total Bookings", icon: CalendarCheck },
    { key: "pending", label: "Pending", icon: Clock3 },
    { key: "completed", label: "Completed", icon: CheckCircle2 },
    { key: "cancelled", label: "Cancelled", icon: XCircle }
];

export default function CustomerDashboardPage() {
    const router = useRouter();
    const [dashboard, setDashboard] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = window.setTimeout(async () => {
            const { data } = await AxiosHelper.getData("/customer/dashboard");
            if (data.status) setDashboard(data.data as DashboardData);
            else toast.error(data.message || "Could not load dashboard.");
            setLoading(false);
        }, 0);
        return () => window.clearTimeout(timer);
    }, []);

    const logout = async () => {
        const { data } = await AxiosHelper.postData("/customer/logout", {});
        if (data.status) router.push("/login");
        else toast.error(data.message || "Could not logout.");
    };

    return (
        <section className="bg-muted/30 py-10">
            <div className="container mx-auto px-4">
                <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
                    <AccountNav />
                    <div className="min-w-0">
                        <div className="mb-6 flex flex-col justify-between gap-4 rounded-3xl bg-primary p-6 text-white shadow-lg sm:flex-row sm:items-center">
                            <div>
                                <p className="text-sm text-white/80">Welcome back</p>
                                <h1 className="text-3xl font-bold">{dashboard?.profile?.name || "Customer"}</h1>
                                <p className="mt-1 text-sm text-white/80">{dashboard?.profile?.mobile || ""}</p>
                            </div>
                            <Button type="button" variant="secondary" onClick={logout}>
                                <LogOut className="h-4 w-4" /> Logout
                            </Button>
                        </div>

                        {loading ? <p className="rounded-2xl bg-card p-8 text-center text-muted-foreground">Loading dashboard...</p> : (
                            <div className="space-y-6">
                                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                    {statCards.map((card) => {
                                        const Icon = card.icon;
                                        return (
                                            <div key={card.key} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                                                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                    <Icon className="h-5 w-5" />
                                                </div>
                                                <div className="text-2xl font-bold text-foreground">{dashboard?.bookingStats?.[card.key] ?? 0}</div>
                                                <p className="text-sm text-muted-foreground">{card.label}</p>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
                                    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                                        <div className="mb-4 flex items-center justify-between">
                                            <h2 className="text-lg font-semibold">Recent Bookings</h2>
                                            <Link href="/user/bookings" className="text-sm font-medium text-primary hover:underline">View all</Link>
                                        </div>
                                        {dashboard?.recentBookings?.length ? (
                                            <div className="divide-y divide-border">
                                                {dashboard.recentBookings.map((booking) => (
                                                    <div key={booking._id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                                                        <div>
                                                            <p className="font-medium">{booking.bookingNumber}</p>
                                                            <p className="text-sm text-muted-foreground">{booking.serviceCategoryName || "Service"} with {booking.providerName || "provider"}</p>
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">{booking.bookingTime ? moment(booking.bookingTime).format("DD MMM YYYY") : ""}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : <p className="py-8 text-center text-muted-foreground">No bookings yet.</p>}
                                    </div>

                                    <div className="space-y-4">
                                        <Link href="/user/profile" className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-primary">
                                            <UserRound className="h-6 w-6 text-primary" />
                                            <div>
                                                <p className="font-semibold">Update Profile</p>
                                                <p className="text-sm text-muted-foreground">Manage name, email and date of birth.</p>
                                            </div>
                                        </Link>
                                        <Link href="/user/addresses" className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-primary">
                                            <Home className="h-6 w-6 text-primary" />
                                            <div>
                                                <p className="font-semibold">Saved Addresses</p>
                                                <p className="text-sm text-muted-foreground">{dashboard?.addressCount ?? 0} address saved.</p>
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
