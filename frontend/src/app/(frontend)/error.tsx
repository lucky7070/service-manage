"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, Mail, RefreshCw } from "lucide-react";

type ErrorProps = {
    error: Error & { digest?: string };
    reset: () => void;
};

export default function FrontendError({ error, reset }: ErrorProps) {
    useEffect(() => {
        console.error("Frontend error:", error);
    }, [error]);

    return (
        <div className="relative flex min-h-[60vh] flex-col items-center justify-center overflow-hidden px-4 py-16 sm:py-24">
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
                    We could not load this page right now. Please try again, or continue browsing from home.
                </p>

                {error.digest ? (
                    <p className="mt-4 text-xs text-gray-400">
                        Error ID: <span className="font-mono">{error.digest}</span>
                    </p>
                ) : null}

                <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
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
                    <Link
                        href="/contact-us"
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg px-5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                        <Mail className="h-4 w-4" />
                        Contact us
                    </Link>
                </div>
            </section>
        </div>
    );
}
