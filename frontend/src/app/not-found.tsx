import Link from "next/link";
import { ArrowLeft, Home, ShieldAlert, UserCircle2 } from "lucide-react";

export default function NotFoundPage() {
    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-20 top-0 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
                <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
            </div>

            <section className="relative w-full max-w-2xl rounded-2xl border border-border bg-card p-8 text-center shadow-xl sm:p-10">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <ShieldAlert className="h-8 w-8" />
                </div>

                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Error 404</p>
                <h1 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">Page not found</h1>
                <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground sm:text-base">
                    The page you are looking for does not exist, was moved, or the URL might be incorrect.
                </p>

                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
                    <Link
                        href="/"
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                    >
                        <Home className="h-4 w-4" />
                        Go to Home
                    </Link>
                    <Link
                        href="/user/dashboard"
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-background px-5 text-sm font-medium text-foreground transition hover:bg-muted"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Link>
                    <Link
                        href="/user/profile"
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-background px-5 text-sm font-medium text-foreground transition hover:bg-muted"
                    >
                        <UserCircle2 className="h-4 w-4" />
                        Open Profile
                    </Link>
                </div>
            </section>
        </main>
    );
}

