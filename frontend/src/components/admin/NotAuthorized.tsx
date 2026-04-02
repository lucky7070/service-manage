import { Home, ShieldAlert, UserCircle2 } from "lucide-react"
import Link from "next/link"

const NotAuthorized = () => {
    return <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-[#f3f7ff] via-white to-[#e8efff] p-3 dark:from-[#0b1020] dark:via-[#111a2f] dark:to-[#172443]">
        <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-danger-300/20 blur-3xl dark:bg-danger-500/10" />
            <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-warning-300/20 blur-3xl dark:bg-warning-500/10" />
        </div>
        <div className="relative w-full max-w-xl rounded-2xl border border-danger-200 bg-white/95 p-8 text-center shadow-xl dark:border-danger-900/40 dark:bg-slate-900/95">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-danger-100 text-danger-600 dark:bg-danger-900/30 dark:text-danger-300">
                <ShieldAlert className="h-8 w-8" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-danger-600 dark:text-danger-300">Access Denied</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">You are not authorized to view this page</h1>
            <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600 dark:text-slate-300">
                Your account does not have the required permission for this module. Please contact the super admin to grant access.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/admin/dashboard" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 text-sm font-medium text-white transition hover:bg-indigo-700">
                    <Home className="h-4 w-4" />
                    Go to Dashboard
                </Link>
                <Link href="/admin/profile" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800">
                    <UserCircle2 className="h-4 w-4" />
                    Open Profile
                </Link>
            </div>
        </div>
    </section>
}

export default NotAuthorized