"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { CheckCircle2, Clock3, Copy, Gift, HardHat, Link2, Share2, Sparkles, UserPlus, Users, XCircle } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AxiosHelperFranchise from "@/helpers/AxiosHelperFranchise";
import { Button, Input } from "@/components/ui";
import { useAppSelector } from "@/store/hooks";

type DashboardCounts = {
    serviceProviders: number;
    pending: number;
    approved: number;
    rejected: number;
    referredProviders: number;
};

const CARDS = [
    { key: "serviceProviders" as const, title: "Service providers", href: "/franchise/service-providers", icon: HardHat },
    { key: "pending" as const, title: "Pending", href: "/franchise/service-providers?profileStatus=pending", icon: Clock3 },
    { key: "approved" as const, title: "Approved", href: "/franchise/service-providers?profileStatus=approved", icon: CheckCircle2 },
    { key: "rejected" as const, title: "Rejected", href: "/franchise/service-providers?profileStatus=rejected", icon: XCircle }
];

const REFERRAL_STEPS = [
    { title: "Share your code", description: "Copy your franchise code or send the registration link to pros.", icon: Share2 },
    { title: "Provider registers", description: "They open Join as Pro and your code is filled automatically.", icon: UserPlus },
    { title: "They join your network", description: "Approved providers appear under your franchise list.", icon: Users }
];

export default function FranchiseDashboardPage() {
    const franchise = useAppSelector((state) => state.franchise);
    const [counts, setCounts] = useState<DashboardCounts>({
        serviceProviders: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        referredProviders: 0
    });
    const [referralCode, setReferralCode] = useState("");

    const shareLink = useMemo(() => {
        const code = referralCode || franchise.userId;
        if (!code || typeof window === "undefined") return "";
        return `${window.location.origin}/join-pro?refer=${encodeURIComponent(code)}`;
    }, [referralCode, franchise.userId]);

    useEffect(() => {
        (async () => {
            const { data } = await AxiosHelperFranchise.getData("/dashboard");
            if (data?.status && data?.data) {
                setCounts({
                    serviceProviders: Number(data.data.serviceProviders || 0),
                    pending: Number(data.data.pending || 0),
                    approved: Number(data.data.approved || 0),
                    rejected: Number(data.data.rejected || 0),
                    referredProviders: Number(data.data.referredProviders || 0)
                });
                if (data.data.referralCode) setReferralCode(String(data.data.referralCode));
            }
        })();
    }, []);

    useEffect(() => {
        (() => { if (!referralCode && franchise.userId) setReferralCode(franchise.userId); })();
    }, [franchise.userId, referralCode]);

    const copyText = async (value: string, message: string) => {
        if (!value) return toast.error("Referral details are not available yet.");
        await navigator.clipboard.writeText(value);
        toast.success(message);
    };

    const shareReferral = async () => {
        const code = referralCode || franchise.userId;
        if (!code || !shareLink) return toast.error("Referral link is not available yet.");

        const shareData = {
            title: "Join as a service professional",
            text: `Use my franchise referral code ${code} to register as a pro.\n${shareLink}`,
            url: shareLink
        };

        if (typeof navigator !== "undefined" && navigator.share) {
            try {
                await navigator.share(shareData);
                return;
            } catch {
                /* user cancelled or share failed — fall through to copy */
            }
        }

        await copyText(shareLink, "Registration link copied.");
    };

    const displayCode = referralCode || franchise.userId || "—";

    return (
        <section className="space-y-5">
            <AdminPageHeader title="Dashboard" subtitle="Overview of service providers and your franchise referral tools." />

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

            <div className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-linear-to-br from-white via-[#f4f7ff] to-indigo-50/90 shadow-lg dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/50">
                <div className="h-1.5 w-full bg-linear-to-r from-indigo-500 via-violet-500 to-sky-400" />
                <div className="relative p-6 sm:p-8">
                    <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-indigo-200/50 blur-3xl dark:bg-indigo-500/15" />
                    <div className="pointer-events-none absolute bottom-0 left-0 h-44 w-44 rounded-full bg-violet-200/35 blur-3xl dark:bg-violet-500/10" />
                    <div className="pointer-events-none absolute right-1/3 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full bg-sky-200/30 blur-2xl dark:bg-sky-500/10" />

                    <div className="relative z-10 grid gap-6 xl:grid-cols-[1fr_340px] xl:items-center">
                        <div>
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-3 py-1 text-sm font-semibold text-indigo-700 shadow-sm backdrop-blur dark:border-indigo-500/30 dark:bg-slate-800/80 dark:text-indigo-300">
                                <Sparkles className="h-4 w-4" />
                                Grow your franchise
                            </div>
                            <h2 className="text-3xl font-bold leading-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
                                Invite professionals with your referral code
                            </h2>
                            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400 sm:text-base">
                                Share your franchise code or registration link. When a provider joins via Join as Pro with your code, they are linked to your franchise network.
                            </p>
                            <div className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-indigo-100 bg-white/70 px-4 py-2 text-sm text-indigo-900 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-800/70 dark:text-indigo-200">
                                <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                <span>
                                    <strong className="font-semibold">{counts.referredProviders}</strong> provider{counts.referredProviders === 1 ? "" : "s"} joined via your link
                                </span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-indigo-100 bg-white p-5 text-slate-900 shadow-md dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
                                <Gift className="h-6 w-6" />
                            </div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Your franchise referral code</p>
                            <div className="mt-2 rounded-2xl border border-dashed border-indigo-300 bg-indigo-50/70 px-4 py-3 text-center font-mono text-2xl font-bold tracking-widest text-indigo-700 dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-200">
                                {displayCode}
                            </div>
                            <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                                <Button type="button" variant="primary" className="w-full" onClick={() => copyText(displayCode === "—" ? "" : displayCode, "Referral code copied.")}>
                                    <Copy className="h-4 w-4" /> Copy Code
                                </Button>
                                <Button type="button" variant="secondary" className="w-full" onClick={shareReferral}>
                                    <Share2 className="h-4 w-4" /> Share Now
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-3xl border border-indigo-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-6">
                <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-slate-800 dark:text-indigo-300">
                            <Link2 className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Provider registration link</h3>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Send this link directly. Your code is applied automatically on the Join as Pro form.
                            </p>
                        </div>
                    </div>
                    <Button type="button" variant="secondary" onClick={() => copyText(shareLink, "Registration link copied.")}>
                        <Copy className="h-4 w-4" /> Copy Link
                    </Button>
                </div>
                <Input value={shareLink || "Registration link will appear here"} readOnly disabled className="font-mono text-sm" />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {REFERRAL_STEPS.map((step, index) => {
                    const Icon = step.icon;
                    return (
                        <div key={step.title} className="rounded-3xl border border-indigo-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                            <div className="mb-4 flex items-center justify-between">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-slate-800 dark:text-indigo-300">
                                    <Icon className="h-6 w-6" />
                                </div>
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                    Step {index + 1}
                                </span>
                            </div>
                            <h3 className="font-bold text-slate-900 dark:text-slate-100">{step.title}</h3>
                            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{step.description}</p>
                        </div>
                    );
                })}
            </div>

            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100 sm:p-6">
                <div className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                    <div>
                        <h3 className="font-bold">How the link works</h3>
                        <p className="mt-1 text-sm leading-6 text-emerald-800 dark:text-emerald-200/90">
                            Providers who register with your franchise code (<span className="font-mono font-semibold">{displayCode}</span>) are assigned to your franchise.
                            You can track them anytime from the service providers list.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
