"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, CircleHelp, Globe, HardHat, ImageIcon, Layers, Map, Shield, Tags, UserCog, UserCircle, Wrench } from "lucide-react";
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
    faqs: number;
    banners: number;
    serviceCategories: number;
    serviceTypes: number;
    serviceProviders: number;
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
    { key: "serviceProviders", title: "Service providers", href: "/admin/service-providers", permissionId: 374, icon: HardHat },
    { key: "predefinedRatingTags", title: "Rating Tags", href: "/admin/rating-tags", permissionId: 344, icon: Tags },
    { key: "faqs", title: "FAQs", href: "/admin/faqs", permissionId: 384, icon: CircleHelp },
    { key: "banners", title: "Banners", href: "/admin/banners", permissionId: 394, icon: ImageIcon },
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
        faqs: 0,
        banners: 0,
        serviceCategories: 0,
        serviceTypes: 0,
        serviceProviders: 0
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
                    faqs: Number(data.data.faqs || 0),
                    banners: Number(data.data.banners || 0),
                    serviceCategories: Number(data.data.serviceCategories || 0),
                    serviceTypes: Number(data.data.serviceTypes || 0),
                    serviceProviders: Number(data.data.serviceProviders || 0)
                });
            }
        })();
    }, []);

    return (
        <section className="space-y-5">
            <AdminPageHeader title="Dashboard" subtitle="Quick overview of access-controlled master data." />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {DASHBOARD_CARDS.map((card) => <PermissionBlock key={card.key} permission_id={card.permissionId}>
                    <Link href={card.href} className="group relative overflow-hidden rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-400/60">
                        <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-indigo-100/70 blur-2xl transition group-hover:scale-110 dark:bg-indigo-500/20" />
                        <div className="relative flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{card.title}</p>
                                <p className="mt-2 text-4xl leading-none font-extrabold text-slate-900 dark:text-slate-100">{counts[card.key]}</p>
                                <div className="mt-2 inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">Active module</div>
                            </div>
                            <div className="rounded-2xl border border-indigo-100 bg-linear-to-br from-indigo-50 to-violet-50 p-2.5 text-indigo-600 transition group-hover:scale-105 group-hover:from-indigo-100 group-hover:to-violet-100 dark:border-indigo-500/30 dark:from-indigo-500/10 dark:to-violet-500/10 dark:text-indigo-300">
                                <card.icon className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="relative mt-4 flex items-center justify-between">
                            <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-300">Open {card.title}</p>
                            <span className="text-xs text-slate-400 transition group-hover:translate-x-0.5 dark:text-slate-500">→</span>
                        </div>
                    </Link>
                </PermissionBlock>)}
            </div>
        </section>
    );
}
