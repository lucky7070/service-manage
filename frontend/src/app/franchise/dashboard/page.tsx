"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, HardHat, Clock3, XCircle } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AxiosHelperFranchise from "@/helpers/AxiosHelperFranchise";

type DashboardCounts = {
    serviceProviders: number;
    pending: number;
    approved: number;
    rejected: number;
};

const CARDS = [
    { key: "serviceProviders" as const, title: "Service providers", href: "/franchise/service-providers", icon: HardHat },
    { key: "pending" as const, title: "Pending", href: "/franchise/service-providers?profileStatus=pending", icon: Clock3 },
    { key: "approved" as const, title: "Approved", href: "/franchise/service-providers?profileStatus=approved", icon: CheckCircle2 },
    { key: "rejected" as const, title: "Rejected", href: "/franchise/service-providers?profileStatus=rejected", icon: XCircle }
];

export default function FranchiseDashboardPage() {
    const [counts, setCounts] = useState<DashboardCounts>({
        serviceProviders: 0,
        pending: 0,
        approved: 0,
        rejected: 0
    });

    useEffect(() => {
        (async () => {
            const { data } = await AxiosHelperFranchise.getData("/dashboard");
            if (data?.status && data?.data) {
                setCounts({
                    serviceProviders: Number(data.data.serviceProviders || 0),
                    pending: Number(data.data.pending || 0),
                    approved: Number(data.data.approved || 0),
                    rejected: Number(data.data.rejected || 0)
                });
            }
        })();
    }, []);

    return (
        <section className="space-y-4">
            <AdminPageHeader title="Dashboard" subtitle="Overview of service providers on the platform." />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {CARDS.map((card) => (
                    <Link
                        key={card.key}
                        href={card.href}
                        className="rounded-2xl border border-indigo-100 bg-linear-to-br from-white to-[#f4f7ff] p-4 shadow-sm transition hover:border-indigo-300 dark:border-slate-700 dark:from-slate-900 dark:to-slate-800"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{card.title}</p>
                                <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">{counts[card.key]}</p>
                            </div>
                            <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600 dark:bg-slate-700 dark:text-indigo-300">
                                <card.icon className="h-5 w-5" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
