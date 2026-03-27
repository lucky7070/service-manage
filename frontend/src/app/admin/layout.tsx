"use client";

import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminTopbar from "../../components/admin/AdminTopbar";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import AxiosHelper from "@/helpers/AxiosHelper";
import AxiosHelperAdmin from "@/helpers/AxiosHelperAdmin";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateSettings } from "@/store/slices/settingSlice";
import { updateAdmin } from "@/store/slices/adminSlice";
import PageLoader from "@/components/admin/PageLoader";
import Link from "next/link";
import { Home, ShieldAlert, UserCircle2 } from "lucide-react";
import { ADMIN_ROUTE_PERMISSIONS } from "@/config";
import AdminBreadcrumb from "@/components/admin/AdminBreadcrumb";

export default function AdminLayout({ children }: { children: React.ReactNode }) {

    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useAppDispatch();
    const settings = useAppSelector((state) => state.settings);
    const admin = useAppSelector((state) => state.admin);

    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [isBootstrapping, setIsBootstrapping] = useState(true);
    const footerText = settings.copyright?.trim() || `Copyright © ${new Date().getFullYear()}. All rights reserved.`;

    const isLoginPage = useMemo(() => ["/admin/login"].includes(pathname), [pathname]);
    const requiredPermission = useMemo(() => {
        const matchedRule = [...ADMIN_ROUTE_PERMISSIONS]
            .sort((a, b) => b.path.length - a.path.length)
            .find((rule) => pathname.startsWith(rule.path));

        return matchedRule?.permission_id ?? true;
    }, [pathname]);

    const hasRouteAccess = useMemo(() => {
        if (requiredPermission === true) return true;
        if (requiredPermission === false) return false;
        return admin.permissions.includes(requiredPermission);
    }, [admin.permissions, requiredPermission]);

    useEffect(() => {
        (async () => {
            const { data } = await AxiosHelper.getData("/general-settings");
            if (data.status) dispatch(updateSettings(data.data));
        })();
    }, [dispatch]);

    useEffect(() => {
        (async () => {
            setIsBootstrapping(true);
            const { data } = await AxiosHelperAdmin.getData("/profile");
            if (data.status) {
                dispatch(updateAdmin(data.data));
                setIsBootstrapping(false);
            } else {
                if (!isLoginPage) router.push("/admin/login");
                // setIsBootstrapping(false);
            }
        })();
    }, [dispatch, isLoginPage, router]);

    if (isLoginPage) return children;
    if (!isBootstrapping && !hasRouteAccess) {
        return (
            <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-[#f3f7ff] via-white to-[#e8efff] p-3 dark:from-[#0b1020] dark:via-[#111a2f] dark:to-[#172443]">
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
                        <Link href="/" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 text-sm font-medium text-white transition hover:bg-indigo-700">
                            <Home className="h-4 w-4" />
                            Go to Home
                        </Link>
                        <Link href="/admin/profile" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800">
                            <UserCircle2 className="h-4 w-4" />
                            Open Profile
                        </Link>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="relative min-h-[calc(100vh-3.5rem)] bg-linear-to-br from-[#f3f7ff] via-white to-[#e8efff] p-3 dark:from-[#0b1020] dark:via-[#111a2f] dark:to-[#172443] md:grid md:grid-cols-[260px_1fr] md:gap-4">
            {isBootstrapping ? <PageLoader /> : null}
            {mobileSidebarOpen ? <button className="fixed inset-0 z-30 bg-slate-900/40 md:hidden" onClick={() => setMobileSidebarOpen(false)} aria-label="Close sidebar overlay" /> : null}
            <div className={`fixed inset-y-0 left-0 z-40 w-[260px] p-3 transition-transform md:static md:z-auto md:w-auto md:p-0 ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
                <AdminSidebar />
            </div>
            <div className="flex min-h-[calc(100vh-2rem)] flex-col gap-4 md:ml-0">
                <AdminTopbar onMenuClick={() => setMobileSidebarOpen(true)} />
                <AdminBreadcrumb />
                <div className="flex-1 rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/95">{children}</div>
                <footer className="rounded-2xl border border-indigo-100 bg-white/90 px-4 py-3 text-center text-xs text-slate-500 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-400">
                    {footerText}
                </footer>
            </div>
        </section>
    );
}
