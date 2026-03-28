import Link from "next/link";
import { ArrowLeft, ShieldAlert, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui";

export default function NotFoundPage() {
    return <section className="relative w-full max-w-2xl p-8 text-center dark:border-secondary-700 dark:bg-secondary-900/80 mx-auto py-12">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-danger-100 text-danger-600 dark:bg-danger-900/30 dark:text-danger-300">
            <ShieldAlert className="h-8 w-8" />
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary-500 dark:text-secondary-400">Error 404</p>
        <h1 className="mt-3 text-xl font-bold text-secondary-900 sm:text-2xl dark:text-secondary-100">Page not found</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-secondary-600 sm:text-base dark:text-secondary-300">
            The page you are looking for does not exist, was moved, or the URL might be incorrect.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/admin/profile">
                <Button variant="primary">
                    <UserCircle2 className="h-4 w-4" />
                    Open Profile
                </Button>
            </Link>
            <Link href="/admin/dashboard" >
                <Button variant="secondary">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </Button>
            </Link>
        </div>
    </section>
}

