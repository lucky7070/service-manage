"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, Globe, Layers, Map, Shield, Tags, UserCog, UserCircle, Wrench } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AxiosHelperAdmin from "@/helpers/AxiosHelperAdmin";
import PermissionBlock from "@/components/admin/PermissionBlock";

type DashboardCountState = {
    roles: number;
    admins: number;
    countries: number;
    states: number;
    cities: number;
    customers: number;
    predefinedRatingTags: number;
    serviceCategories: number;
    serviceTypes: number;
};

type DashboardCard = {
    key: keyof DashboardCountState;
    title: string;
    href: string;
    permissionId: number;
    icon: React.ComponentType<{ className?: string }>;
};

const DASHBOARD_CARDS: DashboardCard[] = [
    { key: "roles", title: "Roles", href: "/admin/roles", permissionId: 104, icon: UserCog },
    { key: "admins", title: "Sub Admins", href: "/admin/admins", permissionId: 204, icon: Shield },
    { key: "countries", title: "Countries", href: "/admin/countries", permissionId: 304, icon: Globe },
    { key: "states", title: "States", href: "/admin/states", permissionId: 314, icon: Map },
    { key: "cities", title: "Cities", href: "/admin/cities", permissionId: 324, icon: Building2 },
    { key: "customers", title: "Customers", href: "/admin/customers", permissionId: 334, icon: UserCircle },
    { key: "predefinedRatingTags", title: "Rating tags", href: "/admin/rating-tags", permissionId: 344, icon: Tags },
    { key: "serviceCategories", title: "Service Categories", href: "/admin/service-categories", permissionId: 354, icon: Layers },
    { key: "serviceTypes", title: "Service types", href: "/admin/service-types", permissionId: 364, icon: Wrench }
];

export default function AdminDashboardPage() {
    const [counts, setCounts] = useState<DashboardCountState>({
        roles: 0,
        admins: 0,
        countries: 0,
        states: 0,
        cities: 0,
        customers: 0,
        predefinedRatingTags: 0,
        serviceCategories: 0,
        serviceTypes: 0
    });

    useEffect(() => {
        (async () => {
            const { data } = await AxiosHelperAdmin.getData("/dashboard-stats");
            if (data?.status && data?.data) {
                setCounts({
                    roles: Number(data.data.roles || 0),
                    admins: Number(data.data.admins || 0),
                    countries: Number(data.data.countries || 0),
                    states: Number(data.data.states || 0),
                    cities: Number(data.data.cities || 0),
                    customers: Number(data.data.customers || 0),
                    predefinedRatingTags: Number(data.data.predefinedRatingTags || 0),
                    serviceCategories: Number(data.data.serviceCategories || 0),
                    serviceTypes: Number(data.data.serviceTypes || 0)
                });
            }
        })();
    }, []);

    return (
        <section className="space-y-5">
            <AdminPageHeader title="Dashboard" subtitle="Quick overview of access-controlled master data." />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {DASHBOARD_CARDS.map((card) => <PermissionBlock key={card.key} permission_id={card.permissionId}>
                    <Link href={card.href} className="group rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-400/60">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{card.title}</p>
                                <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-slate-100">{counts[card.key]}</p>
                            </div>
                            <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600 transition group-hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300 dark:group-hover:bg-indigo-500/20">
                                <card.icon className="h-5 w-5" />
                            </div>
                        </div>
                        <p className="mt-3 text-xs font-medium text-indigo-600 dark:text-indigo-300">Open {card.title}</p>
                    </Link>
                </PermissionBlock>)}
            </div>
        </section>
    );
}
