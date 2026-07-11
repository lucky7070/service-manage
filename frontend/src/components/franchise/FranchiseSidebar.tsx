"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FRANCHISE_MENU } from "@/config";
import { useAppSelector } from "@/store/hooks";
import { cn, resolveFileUrl } from "@/helpers/utils";
import Image from "@/components/ui/Image";

export default function FranchiseSidebar() {
    const pathname = usePathname();
    const settings = useAppSelector((state) => state.settings);
    const franchise = useAppSelector((state) => state.franchise);
    const isSidebarCollapsed = useAppSelector((state) => state.app.sidebarCollapsed);

    const logoSrc = resolveFileUrl(settings.logo);
    const subText = franchise.email || franchise.mobile || "Signed in";

    return (
        <aside
            className={cn(
                "relative z-0 flex h-full min-h-[calc(100vh-3.5rem)] flex-col rounded-2xl border border-indigo-100 bg-linear-to-b from-white via-[#f6f9ff] to-[#ecf2ff] p-4 text-slate-700 shadow-sm transition-[width] duration-200 dark:border-slate-700 dark:from-secondary-900 dark:via-[#15213f] dark:to-[#1c2f53] dark:text-slate-100",
                isSidebarCollapsed ? "md:w-[88px] md:px-2" : "md:w-[260px] md:px-4"
            )}
        >
            <div className="mb-4 rounded-xl border border-indigo-100 bg-white p-3 backdrop-blur dark:border-slate-600 dark:bg-white/5">
                <div className={`flex items-center ${isSidebarCollapsed ? "justify-center" : "gap-2"}`}>
                    {logoSrc ? <Image src={logoSrc} alt="" className="h-8 w-8 rounded object-cover" /> : null}
                    {!isSidebarCollapsed ? <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{settings.application_name}</p> : null}
                </div>
                {!isSidebarCollapsed ? (
                    <div className="mt-3 border-t border-indigo-100 pt-3 dark:border-slate-600">
                        <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-300">Franchise</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{franchise.name || "Franchise"}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-300">{subText}</p>
                    </div>
                ) : null}
            </div>

            <nav className={`flex-1 space-y-1 overflow-y-auto ${isSidebarCollapsed ? "pr-0" : "pr-1"}`}>
                {FRANCHISE_MENU.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        title={item.label}
                        className={cn(
                            "flex items-center rounded px-3 py-2 text-sm transition gap-2",
                            isSidebarCollapsed ? "justify-center" : "",
                            pathname === item.href
                                ? "bg-indigo-600 text-white dark:bg-slate-100 dark:text-slate-900"
                                : "text-slate-700 hover:bg-indigo-100 hover:text-indigo-700 dark:text-slate-100/90 dark:hover:bg-white/10 dark:hover:text-white"
                        )}
                    >
                        <item.icon className="h-4 w-4" />
                        {!isSidebarCollapsed ? item.label : null}
                    </Link>
                ))}
            </nav>

            {!isSidebarCollapsed ? (
                <div className="mt-4 rounded-xl border border-indigo-100 bg-white p-3 text-xs text-slate-600 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-200">
                    <p className="font-semibold text-slate-800 dark:text-slate-100">{settings.application_name}</p>
                    <p className="mt-1 text-slate-500 dark:text-slate-300">{settings.copyright || "All rights reserved."}</p>
                </div>
            ) : null}
        </aside>
    );
}
