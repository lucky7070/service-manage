"use client";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import AxiosHelperAdmin from "@/helpers/AxiosHelperAdmin";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateAdmin } from "@/store/slices/adminSlice";
import PageLoader from "@/components/admin/PageLoader";
import { ADMIN_ROUTE_PERMISSIONS, AUTH_PAGES } from "@/config";
import AdminBreadcrumb from "@/components/admin/AdminBreadcrumb";
import { setLoading, setMobileSidebarOpen } from "@/store/slices/appSlice";
import { compareRoute } from "@/helpers/utils";
import NotAuthorized from "@/components/admin/NotAuthorized";
import { deleteAuthCookie } from "./actions";
import "@/app/admin/admin.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {

    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useAppDispatch();
    const settings = useAppSelector((state) => state.settings);
    const admin = useAppSelector((state) => state.admin);
    const { sidebarCollapsed, loading, mobileSidebarOpen } = useAppSelector((state) => state.app);

    const isAuthPage = useMemo(() => AUTH_PAGES.includes(pathname), [pathname]);

    const hasRouteAccess = useMemo(() => {
        const matchedRule = ADMIN_ROUTE_PERMISSIONS.find((rule) => compareRoute(pathname, rule.path));
        const requiredPermission = matchedRule?.permission_id ?? true;
        if (requiredPermission === true) return true;
        if (requiredPermission === false) return false;
        return admin.permissions.includes(requiredPermission);
    }, [admin.permissions, pathname]);

    useEffect(() => {
        (async () => {
            dispatch(setLoading(true));
            const { data } = await AxiosHelperAdmin.getData("/profile");
            if (data.status) {
                dispatch(updateAdmin(data.data));
                dispatch(setLoading(false));
            } else {
                deleteAuthCookie();
                if (!isAuthPage) router.push("/admin/login");
                dispatch(setLoading(false));
            }
        })();
    }, [dispatch, isAuthPage, router]);

    if (loading) return <PageLoader />;
    if (isAuthPage) return children;
    if (!loading && !hasRouteAccess) return <NotAuthorized />

    return (
        <section className={`relative min-h-[calc(100vh-3.5rem)] bg-linear-to-br from-[#f3f7ff] via-white to-[#e8efff] p-3 dark:from-[#0b1020] dark:via-[#111a2f] dark:to-[#172443] md:grid md:gap-4 ${sidebarCollapsed ? "md:grid-cols-[88px_1fr]" : "md:grid-cols-[260px_1fr]"}`}>
            {mobileSidebarOpen ? <button className="fixed inset-0 z-30 bg-slate-900/40 md:hidden-" onClick={() => dispatch(setMobileSidebarOpen(false))} aria-label="Close sidebar overlay" /> : null}
            <div className={`fixed inset-y-0 left-0 z-40 w-[284px] p-3 transition-transform md:static md:z-auto md:w-auto md:p-0 ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
                <AdminSidebar />
            </div>
            <div className="flex min-h-[calc(100vh-2rem)] flex-col gap-4 md:ml-0">
                <AdminTopbar />
                <AdminBreadcrumb />
                <div className="flex-1 rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/95">{children}</div>
                <footer className="rounded-2xl border border-indigo-100 bg-white/90 px-4 py-3 text-center text-xs text-slate-500 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-400">
                    {settings.copyright?.trim() || `Copyright © ${new Date().getFullYear()}. All rights reserved.`}
                </footer>
            </div>
        </section>
    );
}