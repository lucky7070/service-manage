import Link from "next/link";
import { ArrowLeft, Home, ShieldAlert, UserCircle2 } from "lucide-react";

export default function NotFoundPage() {
    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-b from-white via-primary-50/40 to-secondary-100/80 px-4 py-12 dark:from-secondary-900 dark:via-secondary-900 dark:to-secondary-800">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-20 top-0 h-64 w-64 rounded-full bg-primary-400/20 blur-3xl dark:bg-primary-500/10" />
                <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-info-400/20 blur-3xl dark:bg-info-500/10" />
            </div>

            <section className="relative w-full max-w-2xl rounded-2xl border border-secondary-200/80 bg-white/90 p-8 text-center shadow-xl backdrop-blur sm:p-10 dark:border-secondary-700 dark:bg-secondary-900/80">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-danger-100 text-danger-600 dark:bg-danger-900/30 dark:text-danger-300">
                    <ShieldAlert className="h-8 w-8" />
                </div>

                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary-500 dark:text-secondary-400">Error 404</p>
                <h1 className="mt-3 text-3xl font-bold text-secondary-900 sm:text-4xl dark:text-secondary-100">Page not found</h1>
                <p className="mx-auto mt-3 max-w-lg text-sm text-secondary-600 sm:text-base dark:text-secondary-300">
                    The page you are looking for does not exist, was moved, or the URL might be incorrect.
                </p>

                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
                    <Link
                        href="/"
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary-600 px-5 text-sm font-medium text-white transition hover:bg-primary-700"
                    >
                        <Home className="h-4 w-4" />
                        Go to Home
                    </Link>
                    <Link
                        href="/dashboard"
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-secondary-300 px-5 text-sm font-medium text-secondary-700 transition hover:bg-secondary-50 dark:border-secondary-600 dark:text-secondary-200 dark:hover:bg-secondary-800"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Link>
                    <Link
                        href="/profile"
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-secondary-300 px-5 text-sm font-medium text-secondary-700 transition hover:bg-secondary-50 dark:border-secondary-600 dark:text-secondary-200 dark:hover:bg-secondary-800"
                    >
                        <UserCircle2 className="h-4 w-4" />
                        Open Profile
                    </Link>
                </div>
            </section>
        </main>
    );
}

