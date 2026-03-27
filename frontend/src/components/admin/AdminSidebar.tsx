"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { MENU } from "@/config";
import { useAppSelector } from "@/store/hooks";
import { resolveFileUrl } from "@/helpers/utils";
import Image from "@/components/ui/Image";
import PermissionBlock from "@/components/admin/PermissionBlock";

export default function AdminSidebar() {
    const pathname = usePathname();
    const settings = useAppSelector((state) => state.settings);
    const admin = useAppSelector((state) => state.admin);
    const appName = settings.application_name || "Service Manage";
    const logoSrc = resolveFileUrl(settings.logo);
    const adminName = admin.name || "Admin";
    const adminSubText = admin.email || admin.mobile || "Signed in";
    const [open, setOpen] = useState<Record<string, boolean>>({
        System: true,
        Operations: true
    });

    return (
        <aside className="flex h-full min-h-[calc(100vh-3.5rem)] flex-col rounded-2xl border border-indigo-100 bg-linear-to-b from-white via-[#f6f9ff] to-[#ecf2ff] p-4 text-slate-700 shadow-sm dark:border-slate-700 dark:from-[#0f172a] dark:via-[#15213f] dark:to-[#1c2f53] dark:text-slate-100">
            <div className="mb-4 rounded-xl border border-indigo-100 bg-white p-3 backdrop-blur dark:border-slate-600 dark:bg-white/5">
                <div className="flex items-center gap-2">
                    {logoSrc ? <Image src={logoSrc} alt={`${appName} logo`} className="h-8 w-8 rounded object-cover" /> : null}
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{appName}</p>
                </div>
                <div className="mt-3 border-t border-indigo-100 pt-3 dark:border-slate-600">
                    <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-300">Signed in as</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{adminName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-300">{adminSubText}</p>
                </div>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
                {MENU.map((item) => {
                    if (!("children" in item)) {
                        const Icon = item.icon;
                        return (
                            <PermissionBlock key={item.href} permission_id={item.permission_id}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center gap-2 rounded px-3 py-2 text-sm ${pathname === item.href ? "bg-indigo-600 text-white dark:bg-slate-100 dark:text-slate-900" : "text-slate-700 hover:bg-indigo-100 hover:text-indigo-700 dark:text-slate-100/90 dark:hover:bg-white/10 dark:hover:text-white"}`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.label}
                                </Link>
                            </PermissionBlock>
                        );
                    }

                    const GroupIcon = item.icon;
                    const isOpen = open[item.label];
                    const groupPermissions = item.children.map((child) => child.permission_id);
                    return (
                        <PermissionBlock key={item.label} permission_id={groupPermissions}>
                            <div className="rounded-lg">
                                <button
                                    onClick={() => setOpen((v) => ({ ...v, [item.label]: !v[item.label] }))}
                                    className="flex w-full items-center justify-between rounded px-3 py-2 text-sm text-slate-700 hover:bg-indigo-100 hover:text-indigo-700 dark:text-slate-100/90 dark:hover:bg-white/10 dark:hover:text-white"
                                >
                                    <span className="flex items-center gap-2">
                                        <GroupIcon className="h-4 w-4" />
                                        {item.label}
                                    </span>
                                    <ChevronDown className={`h-4 w-4 transition ${isOpen ? "rotate-180" : ""}`} />
                                </button>
                                {isOpen ? (
                                    <div className="ml-2 mt-1 space-y-1 border-l border-indigo-300/30 pl-2 dark:border-slate-600">
                                        {item.children.map((child) => {
                                            const ChildIcon = child.icon;
                                            return (
                                                <PermissionBlock key={child.href} permission_id={child.permission_id}>
                                                    <Link
                                                        href={child.href}
                                                        className={`flex items-center gap-2 rounded px-3 py-2 text-sm ${pathname === child.href
                                                            ? "bg-indigo-600 text-white dark:bg-slate-100 dark:text-slate-900"
                                                            : "text-slate-700 hover:bg-indigo-100 hover:text-indigo-700 dark:text-slate-100/90 dark:hover:bg-white/10 dark:hover:text-white"
                                                            }`}
                                                    >
                                                        <ChildIcon className="h-4 w-4" />
                                                        {child.label}
                                                    </Link>
                                                </PermissionBlock>
                                            );
                                        })}
                                    </div>
                                ) : null}
                            </div>
                        </PermissionBlock>
                    );
                })}
            </nav>
            <div className="mt-4 rounded-xl border border-indigo-100 bg-white p-3 text-xs text-slate-600 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-200">
                <p className="font-semibold text-slate-800 dark:text-slate-100">{appName}</p>
                <p className="mt-1 text-slate-500 dark:text-slate-300">{settings.copyright || "All rights reserved."}</p>
            </div>
        </aside>
    );
}
