"use client";

import { Bell, CheckCheck, ChevronDown, LogOut, Menu, Search, User } from "lucide-react";
import { Moon, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import AxiosHelper from "@/helpers/AxiosHelper";
import { Button } from "@/components/ui";
import { useAppSelector } from "@/store/hooks";
import { resolveFileUrl } from "@/helpers/utils";
import Image from "@/components/ui/Image";
import Link from "next/link";

export default function AdminTopbar({ onMenuClick }: { onMenuClick?: () => void }) {
    const [open, setOpen] = useState(false);
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const router = useRouter();
    const admin = useAppSelector((state) => state.admin);
    const profileName = admin.name || "Admin";
    const profileSubText = admin.email || admin.mobile || "Signed in";
    const profileImage = resolveFileUrl(admin.image) || "";
    const notifications: { title: string; time: string; unread: boolean; }[] = [];

    const handleLogout = async () => {
        const res = await AxiosHelper.postData("/admin/logout", {});
        if (res?.data?.status) {
            toast.success("Logged out successfully");
            router.push("/admin/login");
            router.refresh();
            return;
        }
        toast.error(res?.data?.message || "Logout failed");
    };

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const stored = window.localStorage.getItem("theme");
            const dark = stored === "dark";
            if (!cancelled) setIsDark(dark);
            document.documentElement.classList.toggle("dark", dark);
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    const toggleTheme = () => {
        const next = !isDark;
        setIsDark(next);
        localStorage.setItem("theme", next ? "dark" : "light");
        document.documentElement.classList.toggle("dark", next);
    };

    return (
        <div className="flex items-center justify-between rounded-2xl border border-indigo-100 bg-linear-to-r from-white via-[#f4f7ff] to-[#edf3ff] px-5 py-2 shadow-sm dark:border-slate-700 dark:bg-linear-to-r dark:from-[#11192b] dark:via-[#16223a] dark:to-[#1b2c4d]">
            <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onMenuClick}
                className="mr-2 rounded-xl border border-indigo-100 bg-white p-2 text-slate-600 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 md:hidden"
                aria-label="Open menu"
            >
                <Menu className="h-4 w-4" />
            </Button>
            <div className="relative hidden w-full max-w-md md:block">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                    className="w-full rounded-xl border border-indigo-100 bg-white py-2 pl-9 pr-3 text-sm outline-none ring-indigo-500/30 placeholder:text-slate-400 focus:ring dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
                    placeholder="Search users, bookings, reports..."
                />
            </div>

            <div className="ml-auto flex items-center gap-3">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    className="rounded-xl border border-indigo-100 bg-white p-2 text-slate-600 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    title="Toggle theme"
                    aria-label="Toggle theme"
                >
                    {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
                <div className="relative">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setNotificationOpen((v) => !v)}
                        className="relative rounded-xl border border-indigo-100 bg-white p-2 text-slate-600 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                        aria-label="Notifications"
                    >
                        <Bell className="h-4 w-4" />
                        <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-rose-500" />
                    </Button>
                    {notificationOpen ? (
                        <div className="absolute right-0 z-20 mt-2 w-80 overflow-hidden rounded-xl border border-indigo-100 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
                            <div className="flex items-center justify-between border-b bg-indigo-50/60 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Notifications</p>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto gap-1 px-1 py-0 text-xs text-indigo-600 shadow-none hover:bg-transparent hover:text-indigo-700 focus-visible:ring-0 dark:hover:bg-transparent"
                                >
                                    <CheckCheck className="h-3.5 w-3.5" />
                                    Mark all read
                                </Button>
                            </div>
                            <ul className="max-h-72 overflow-y-auto p-2">
                                {notifications.map((n) => (
                                    <li
                                        key={`${n.title}-${n.time}`}
                                        className={`mb-1 rounded-lg px-3 py-2 last:mb-0 ${n.unread ? "bg-indigo-50/70 dark:bg-indigo-900/30" : "hover:bg-slate-50 dark:hover:bg-slate-800"
                                            }`}
                                    >
                                        <p className="text-sm text-slate-800 dark:text-slate-100">{n.title}</p>
                                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{n.time}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : null}
                </div>

                <div className="relative">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setOpen((v) => !v)}
                        className="h-12 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 shadow-xs hover:bg-slate-50 focus-visible:ring-1 dark:border-slate-700 dark:bg-slate-800/80 dark:hover:bg-slate-800"
                    >
                        {profileImage ? (
                            <Image src={profileImage} alt={profileName} className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-600" />
                        ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white ring-1 ring-slate-200 dark:ring-slate-600">
                                {(profileName?.charAt(0) || "A").toUpperCase()}
                            </div>
                        )}
                        <div className="hidden min-w-0 text-left md:block">
                            <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{profileName}</p>
                            <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">{profileSubText}</p>
                        </div>
                        <ChevronDown className="h-4 w-4 text-slate-500 transition-transform dark:text-slate-300" />
                    </Button>

                    {open ? (
                        <div className="absolute right-0 z-20 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                            <Link href="/admin/profile">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto w-full justify-start gap-2 rounded-lg px-3 py-2 font-normal text-slate-700 shadow-none hover:bg-slate-50 focus-visible:ring-0 dark:text-slate-200 dark:hover:bg-slate-800 border-none"
                                >
                                    <User className="h-4 w-4" />
                                    Profile
                                </Button>
                            </Link>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleLogout}
                                className="h-auto w-full justify-start gap-2 rounded-lg px-3 py-2 font-normal text-rose-600! shadow-none hover:bg-rose-50 focus-visible:ring-0 border-none"
                            >
                                <LogOut className="h-4 w-4" />
                                Logout
                            </Button>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
