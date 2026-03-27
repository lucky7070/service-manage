"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { MENU } from "@/config";
import { useAppSelector } from "@/store/hooks";
import { cn, resolveFileUrl } from "@/helpers/utils";
import Image from "@/components/ui/Image";
import PermissionBlock from "@/components/admin/PermissionBlock";

export default function AdminSidebar() {
    const pathname = usePathname();
    const settings = useAppSelector((state) => state.settings);
    const admin = useAppSelector((state) => state.admin);
    const isSidebarCollapsed = useAppSelector((state) => state.app.sidebarCollapsed);

    const logoSrc = resolveFileUrl(settings.logo);
    const adminSubText = admin.roleName || admin.email || admin.mobile || "Signed in";

    const [open, setOpen] = useState<Record<string, boolean>>({});
    const [isHoveringCollapsed, setIsHoveringCollapsed] = useState(false);

    const isHoverExpanded = isSidebarCollapsed && isHoveringCollapsed;
    const effectiveCollapsed = isSidebarCollapsed && !isHoverExpanded;

    return (
        <aside
            className={cn("relative z-0 flex h-full min-h-[calc(100vh-3.5rem)] flex-col rounded-2xl border border-indigo-100 bg-linear-to-b from-white via-[#f6f9ff] to-[#ecf2ff] p-4 text-slate-700 shadow-sm transition-[width] duration-200 dark:border-slate-700 dark:from-[#0f172a] dark:via-[#15213f] dark:to-[#1c2f53] dark:text-slate-100", (isHoverExpanded || isSidebarCollapsed === false) ? "md:w-[260px] md:px-4" : "md:w-[88px] md:px-2")}
            onMouseEnter={() => {
                if (isSidebarCollapsed) setIsHoveringCollapsed(true);
            }}
            onMouseLeave={() => {
                if (isSidebarCollapsed) setIsHoveringCollapsed(false);
            }}
        >
            <div className={`mb-4 rounded-xl border border-indigo-100 bg-white p-3 backdrop-blur dark:border-slate-600 dark:bg-white/5`}>
                <div className={`flex items-center ${effectiveCollapsed ? "justify-center" : "gap-2"}`}>
                    {logoSrc ? <Image src={logoSrc} alt="" className="h-8 w-8 rounded object-cover" /> : null}
                    {!effectiveCollapsed ? <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{settings.application_name}</p> : null}
                </div>
                {!effectiveCollapsed ? (
                    <div className="mt-3 border-t border-indigo-100 pt-3 dark:border-slate-600">
                        <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-300">Signed in as</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{admin.name || "Admin"}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-300">{adminSubText}</p>
                    </div>
                ) : null}
            </div>

            <nav className={`flex-1 space-y-1 overflow-y-auto ${effectiveCollapsed ? "overflow-x-visible pr-0" : "pr-1"}`}>
                {MENU.map((item) => {
                    // Single link
                    if (!("children" in item)) {
                        return (
                            <PermissionBlock key={item.href} permission_id={item.permission_id}>
                                <Link
                                    href={item.href}
                                    title={item.label}
                                    className={cn("flex items-center rounded px-3 py-2 text-sm transition gap-2", effectiveCollapsed ? "justify-center" : "", pathname === item.href ? "bg-indigo-600 text-white dark:bg-slate-100 dark:text-slate-900" : "text-slate-700 hover:bg-indigo-100 hover:text-indigo-700 dark:text-slate-100/90 dark:hover:bg-white/10 dark:hover:text-white")}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {!effectiveCollapsed ? item.label : null}
                                </Link>
                            </PermissionBlock>
                        );
                    }

                    return (
                        <PermissionBlock key={item.label} permission_id={item.children.map((child) => child.permission_id)}>
                            {effectiveCollapsed ? (
                                <div className="space-y-1 rounded-lg">
                                    {item.children.map((child) => {
                                        return <PermissionBlock key={child.href} permission_id={child.permission_id}>
                                            <Link
                                                href={child.href}
                                                title={child.label}
                                                className={cn("flex items-center justify-center rounded px-3 py-2 text-sm transition", pathname === child.href ? "bg-indigo-600 text-white dark:bg-slate-100 dark:text-slate-900" : "text-slate-700 hover:bg-indigo-100 hover:text-indigo-700 dark:text-slate-100/90 dark:hover:bg-white/10 dark:hover:text-white")}
                                            >
                                                <child.icon className="h-4 w-4" />
                                            </Link>
                                        </PermissionBlock>
                                    })}
                                </div>
                            ) : (
                                <div className="rounded-lg">
                                    <button
                                        type="button"
                                        onClick={() => setOpen((v) => ({ ...v, [item.label]: !v[item.label] }))}
                                        className="flex w-full items-center justify-between rounded px-3 py-2 text-sm text-slate-700 hover:bg-indigo-100 hover:text-indigo-700 dark:text-slate-100/90 dark:hover:bg-white/10 dark:hover:text-white"
                                    >
                                        <span className="flex items-center gap-2">
                                            <item.icon className="h-4 w-4" />
                                            <p className="text-ellipsis md:text-clip ...">{item.label}</p>
                                        </span>
                                        <ChevronDown className={`h-4 w-4 transition ${open[item.label] ? "rotate-180" : ""}`} />
                                    </button>

                                    {(isHoverExpanded || open[item.label]) ? (
                                        <div className="ml-2 mt-1 space-y-1 border-l border-indigo-300/30 pl-2 dark:border-slate-600">
                                            {item.children.map((child) => {
                                                const ChildIcon = child.icon as unknown as LucideIcon;
                                                return (
                                                    <PermissionBlock key={child.href} permission_id={child.permission_id}>
                                                        <Link href={child.href} className={cn("flex items-center gap-2 rounded px-3 py-2 text-sm transition", pathname === child.href ? "bg-indigo-600 text-white dark:bg-slate-100 dark:text-slate-900" : "text-slate-700 hover:bg-indigo-100 hover:text-indigo-700 dark:text-slate-100/90 dark:hover:bg-white/10 dark:hover:text-white")}>
                                                            <ChildIcon className="h-4 w-4" />
                                                            <p className="text-ellipsis md:text-clip ...">{child.label}</p>
                                                        </Link>
                                                    </PermissionBlock>
                                                );
                                            })}
                                        </div>
                                    ) : null}
                                </div>
                            )}
                        </PermissionBlock>
                    );
                })}
            </nav>

            {!effectiveCollapsed ? (
                <div className="mt-4 rounded-xl border border-indigo-100 bg-white p-3 text-xs text-slate-600 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-200">
                    <p className="font-semibold text-slate-800 dark:text-slate-100">{settings.application_name}</p>
                    <p className="mt-1 text-slate-500 dark:text-slate-300">{settings.copyright || "All rights reserved."}</p>
                </div>
            ) : null}
        </aside>
    );
}

