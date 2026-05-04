"use client";

import { useMemo } from "react";
import { CheckCircle2, Copy, Gift, Share2, Sparkles, Users, WalletCards } from "lucide-react";
import { toast } from "react-toastify";

import AccountNav from "@/components/front/user/AccountNav";
import { Button, Input } from "@/components/front/ui";
import { useAppSelector } from "@/store/hooks";

const steps = [
    { title: "Share your code", description: "Send your referral link to friends and family.", icon: Share2 },
    { title: "Friend registers", description: "They sign up using your referral code.", icon: Users },
    { title: "Earn reward", description: "Your wallet gets credited after successful registration.", icon: WalletCards }
];

export default function ReferEarnPage() {
    const user = useAppSelector((state) => state.user);

    const shareLink = useMemo(() => {

        if (!user.referralCode) return "";
        return `${window.location.origin}/login?ref=${encodeURIComponent(user.referralCode)}`;
    }, [user.referralCode]);

    const copyText = async (value: string, message: string) => {
        if (!value) return toast.error("Referral code is not available.");
        await navigator.clipboard.writeText(value);
        return toast.success(message);
    };

    const shareReferral = async () => {
        if (!shareLink) return toast.error("Referral link is not available.");

        const shareData = {
            title: "Join and book trusted home services",
            text: `Use my referral code ${window.location.origin} when you sign up.`,
            url: shareLink
        };

        if (navigator.share) {
            await navigator.share(shareData);
            return;
        }

        await copyText(shareLink, "Referral link copied.");
    };

    return (
        <section className="bg-muted/30 py-10">
            <div className="container mx-auto px-4">
                <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
                    <AccountNav />
                    <div className="min-w-0 space-y-6">
                        <div className="overflow-hidden rounded-3xl bg-primary text-white shadow-xl">
                            <div className="relative p-6 sm:p-8">
                                <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10" />
                                <div className="absolute bottom-4 right-8 hidden h-24 w-24 rounded-full bg-white/10 sm:block" />

                                <div className="relative z-10 grid gap-6 xl:grid-cols-[1fr_320px] xl:items-center">
                                    <div>
                                        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-semibold text-white">
                                            <Sparkles className="h-4 w-4" />
                                            Refer & Earn
                                        </div>
                                        <h1 className="text-3xl font-bold leading-tight sm:text-4xl">Invite friends and earn wallet rewards</h1>
                                        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80 sm:text-base">
                                            Share your referral code. When a new customer registers with it, your referral reward will be credited to your wallet as per the active offer.
                                        </p>
                                    </div>

                                    <div className="rounded-2xl bg-white p-5 text-foreground shadow-lg">
                                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                            <Gift className="h-6 w-6" />
                                        </div>
                                        <p className="text-sm font-medium text-muted-foreground">Your Referral Code</p>
                                        <div className="mt-2 rounded-2xl border border-dashed border-primary/40 bg-primary/5 px-4 py-3 text-center font-mono text-2xl font-bold tracking-widest text-primary">
                                            {user.referralCode || "—"}
                                        </div>
                                        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                                            <Button type="button" className="w-full" onClick={() => copyText(user.referralCode, "Referral code copied.")}>
                                                <Copy className="h-4 w-4" /> Copy Code
                                            </Button>
                                            <Button type="button" variant="outline" className="w-full" onClick={shareReferral}>
                                                <Share2 className="h-4 w-4" /> Share Now
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
                            <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                                <div>
                                    <h2 className="text-xl font-bold">Share Link</h2>
                                    <p className="mt-1 text-sm text-muted-foreground">Send this link directly. Your code will be filled on signup.</p>
                                </div>
                                <Button type="button" variant="outline" onClick={() => copyText(shareLink, "Referral link copied.")}>
                                    <Copy className="h-4 w-4" /> Copy Link
                                </Button>
                            </div>
                            <Input value={shareLink || "Referral link will appear here"} readOnly className="font-mono text-sm" />
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            {steps.map((step, index) => {
                                const Icon = step.icon;
                                return (
                                    <div key={step.title} className="rounded-3xl border border-border bg-card p-5 shadow-sm">
                                        <div className="mb-4 flex items-center justify-between">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                                <Icon className="h-6 w-6" />
                                            </div>
                                            <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">Step {index + 1}</span>
                                        </div>
                                        <h3 className="font-bold">{step.title}</h3>
                                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900 sm:p-6">
                            <div className="flex gap-3">
                                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                                <div>
                                    <h2 className="font-bold">Reward will reflect in your ledger</h2>
                                    <p className="mt-1 text-sm leading-6 text-emerald-800">
                                        Once the referred customer registers successfully and the referral reward setting is greater than zero, the credited amount will appear in your wallet ledger.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
