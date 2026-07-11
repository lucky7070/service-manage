"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, LayoutDashboard, RefreshCw } from "lucide-react";

type ErrorProps = {
    error: Error & { digest?: string };
    reset: () => void;
};

export default function AdminError({ error, reset }: ErrorProps) {
    useEffect(() => {
        console.error("Admin error:", error);
    }, [error]);

    return (
        <section className="relative flex min-h-[50vh] items-center justify-center overflow-hidden p-3">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-indigo-300/20 blur-3xl dark:bg-indigo-500/10" />
                <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-slate-300/30 blur-3xl dark:bg-slate-500/10" />
            </div>

            <div className="relative w-full max-w-xl rounded-2xl border border-indigo-100 bg-white/95 p-8 text-center shadow-xl dark:border-slate-700 dark:bg-slate-900/95">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
                    <AlertTriangle className="h-8 w-8" />
                </div>

                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">Admin error</p>
                <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">Something went wrong</h1>
                <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600 dark:text-slate-300">
                    This admin page failed to load. Try again, or return to the dashboard.
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
            </div>
        </section>
    );
}
