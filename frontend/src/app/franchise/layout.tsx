"use client";

import FranchiseSidebar from "@/components/franchise/FranchiseSidebar";
import FranchiseTopbar from "@/components/franchise/FranchiseTopbar";
import FranchiseBreadcrumb from "@/components/franchise/FranchiseBreadcrumb";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import AxiosHelperFranchise from "@/helpers/AxiosHelperFranchise";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateFranchise } from "@/store/slices/franchiseSlice";
import PageLoader from "@/components/admin/PageLoader";
import { AUTH_PAGES_FRANCHISE } from "@/config";
import { setLoading, setMobileSidebarOpen } from "@/store/slices/appSlice";
import DeveloperCredit from "@/components/DeveloperCredit";
import { deleteFranchiseAuthCookie } from "./actions";
import "@/app/admin/admin.css";

export default function FranchiseLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useAppDispatch();
    const settings = useAppSelector((state) => state.settings);
    const { sidebarCollapsed, loading, mobileSidebarOpen } = useAppSelector((state) => state.app);

    const isAuthPage = useMemo(() => AUTH_PAGES_FRANCHISE.includes(pathname), [pathname]);

    useEffect(() => {
        (async () => {
            dispatch(setLoading(true));
            const { data } = await AxiosHelperFranchise.getData("/profile");
            if (data.status) {
                dispatch(updateFranchise(data.data));
                dispatch(setLoading(false));
            } else {
                await deleteFranchiseAuthCookie();
                if (!isAuthPage) router.push("/franchise/login");
                dispatch(setLoading(false));
            }
        })();
    }, [dispatch, isAuthPage, router]);

    if (loading) return <PageLoader />;
    if (isAuthPage) return children;

    return (
        <section className={`relative min-h-[calc(100vh-3.5rem)] bg-linear-to-br from-[#f3f7ff] via-white to-[#e8efff] p-3 dark:from-[#0b1020] dark:via-[#111a2f] dark:to-[#172443] md:grid md:gap-4 ${sidebarCollapsed ? "md:grid-cols-[88px_1fr]" : "md:grid-cols-[260px_1fr]"}`}>
            {mobileSidebarOpen ? <button className="fixed inset-0 z-30 bg-slate-900/40 md:hidden" onClick={() => dispatch(setMobileSidebarOpen(false))} aria-label="Close sidebar overlay" /> : null}
            <div className={`fixed inset-y-0 left-0 z-40 w-[284px] p-3 transition-transform md:static md:z-auto md:w-auto md:p-0 ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
                <FranchiseSidebar />
            </div>
            <div className="flex min-h-[calc(100vh-2rem)] flex-col gap-4 md:ml-0">
                <FranchiseTopbar />
                <FranchiseBreadcrumb />
                <div className="flex-1 rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/95">{children}</div>
                <footer className="flex justify-between items-center flex-col md:flex-row rounded-2xl border border-indigo-100 bg-white/90 px-4 py-3 text-center text-xs text-slate-500 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-400">
                    <p>{settings.copyright?.trim() || `Copyright © ${new Date().getFullYear()}. All rights reserved.`}</p>
                    <DeveloperCredit variant="admin" className="mt-1.5 text-[11px] md:mt-0" />
                </footer>
            </div>
        </section>
    );
}
