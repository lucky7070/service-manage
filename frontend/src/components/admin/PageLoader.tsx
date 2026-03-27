import { CheckCircle2, LoaderCircle, ShieldCheck } from "lucide-react";

const PageLoader = () => {
    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center overflow-hidden bg-linear-to-b from-white via-indigo-50/60 to-slate-100/80 px-4 py-8 backdrop-blur-sm dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-14 top-10 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl dark:bg-indigo-500/10" />
                <div className="absolute -right-20 bottom-8 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl dark:bg-violet-500/10" />
            </div>

            <div className="relative w-full max-w-md rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-2xl backdrop-blur sm:p-7 dark:border-slate-700 dark:bg-slate-900/90">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 via-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25">
                    <LoaderCircle className="h-8 w-8 animate-spin" />
                </div>

                <div className="text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">Initializing</p>
                    <p className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100">Service Manage</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Preparing your workspace and syncing your account settings.</p>
                </div>

                <div className="mt-5 space-y-2 rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 dark:border-slate-700 dark:bg-slate-800/60">
                    <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        Loading global settings
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                        <ShieldCheck className="h-4 w-4 text-indigo-500 dark:text-indigo-300" />
                        Verifying admin profile and permissions
                    </div>
                </div>

                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div className="h-full w-1/2 animate-pulse rounded-full bg-linear-to-r from-indigo-500 to-violet-500" />
                </div>
            </div>
        </div>
    );
};

export default PageLoader