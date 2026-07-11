"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertTriangle, Home, LayoutDashboard, RefreshCw } from "lucide-react";
import "@/app/(frontend)/front.css";

type GlobalErrorProps = {
    error: Error & { digest?: string };
    reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith("/admin");

    useEffect(() => {
        console.error("Global application error:", error);
    }, [error]);

    if (isAdmin) {
        return (
            <html lang="en">
                <body>
                    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-[#f3f7ff] via-white to-[#e8efff] p-3 dark:from-[#0b1020] dark:via-[#111a2f] dark:to-[#172443]">
                        <div className="pointer-events-none absolute inset-0">
                            <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-indigo-300/20 blur-3xl dark:bg-indigo-500/10" />
                            <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-slate-300/30 blur-3xl dark:bg-slate-500/10" />
                        </div>

                        <section className="relative w-full max-w-xl rounded-2xl border border-indigo-100 bg-white/95 p-8 text-center shadow-xl dark:border-slate-700 dark:bg-slate-900/95">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
                                <AlertTriangle className="h-8 w-8" />
                            </div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">Admin error</p>
                            <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">Unexpected error</h1>
                            <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600 dark:text-slate-300">
                                The admin application hit an unexpected problem. Try again or go back to the dashboard.
                            </p>
                            {error.digest ? (
                                <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
                                    Error ID: <span className="font-mono">{error.digest}</span>
                                </p>
                            ) : null}
                            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={reset}
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 text-sm font-medium text-white transition hover:bg-indigo-700"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Try again
                                </button>
                                <Link
                                    href="/admin/dashboard"
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                                >
                                    <LayoutDashboard className="h-4 w-4" />
                                    Go to Dashboard
                                </Link>
                            </div>
                        </section>
                    </main>
                </body>
            </html>
        );
    }

    return (
        <html lang="en">
            <body className="bg-white">
                <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-16 sm:py-24">
                    <div className="pointer-events-none absolute inset-0">
                        <div className="absolute -left-20 top-0 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
                        <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-orange-200/40 blur-3xl" />
                    </div>

                    <section className="relative w-full max-w-lg rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-lg sm:p-10">
                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-primary">
                            <AlertTriangle className="h-8 w-8" />
                        </div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Something went wrong</p>
                        <h1 className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl">Unexpected error</h1>
                        <p className="mx-auto mt-3 max-w-md text-sm text-gray-600 sm:text-base">
                            The application hit an unexpected problem. You can try again, or go back to the home page.
                        </p>
                        {error.digest ? (
                            <p className="mt-4 text-xs text-gray-400">
                                Error ID: <span className="font-mono">{error.digest}</span>
                            </p>
                        ) : null}
                        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:justify-center">
                            <button
                                type="button"
                                onClick={reset}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-md transition hover:bg-orange-600"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Try again
                            </button>
                            <Link
                                href="/"
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-5 text-sm font-medium text-gray-800 transition hover:border-primary hover:bg-orange-50 hover:text-primary"
                            >
                                <Home className="h-4 w-4" />
                                Go to home
                            </Link>
                        </div>
                    </section>
                </main>
            </body>
        </html>
    );
}
