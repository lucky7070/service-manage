"use client";

import { ChevronDown, LogOut, Menu, PanelLeftClose, PanelLeftOpen, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import AxiosHelperFranchise from "@/helpers/AxiosHelperFranchise";
import { deleteFranchiseAuthCookie } from "@/app/franchise/actions";
import { Button } from "@/components/ui";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { resolveFileUrl } from "@/helpers/utils";
import Image from "@/components/ui/Image";
import Link from "next/link";
import { toggleMobileSidebarOpen, toggleSidebarCollapsed } from "@/store/slices/appSlice";
import { resetFranchise } from "@/store/slices/franchiseSlice";
import ThemeToggle from "@/components/admin/ThemeToggle";

export default function FranchiseTopbar() {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const dispatch = useAppDispatch();
    const franchise = useAppSelector((state) => state.franchise);
    const isSidebarCollapsed = useAppSelector((state) => state.app.sidebarCollapsed);
    const profileName = franchise.name || "Franchise";
    const profileSubText = franchise.email || franchise.mobile || "Signed in";
    const profileImage = resolveFileUrl(franchise.image) || "";

    const handleLogout = async () => {
        const { data } = await AxiosHelperFranchise.postData("/logout", {});
        if (data.status) {
            await deleteFranchiseAuthCookie();
            dispatch(resetFranchise());
            toast.success("Logged out successfully");
            router.push("/franchise/login");
            router.refresh();
            return;
        }
        toast.error(data.message);
    };

    return (
        <div className="flex items-center justify-between rounded-2xl border border-indigo-100 bg-linear-to-r from-white via-[#f4f7ff] to-[#edf3ff] px-5 py-2 shadow-sm dark:border-slate-700 dark:bg-linear-to-r dark:from-[#11192b] dark:via-[#16223a] dark:to-[#1b2c4d]">
            <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => dispatch(toggleMobileSidebarOpen())}
                className="mr-2 rounded-xl border border-indigo-100 bg-white p-2 text-slate-600 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 md:hidden"
                aria-label="Open menu"
            >
                <Menu className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => dispatch(toggleSidebarCollapsed())}
                className="mr-2 hidden! md:inline-flex! rounded-xl border border-indigo-100 bg-white p-2 text-slate-600 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                aria-label="Toggle desktop sidebar"
                title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
                {isSidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </Button>

            <div className="ml-auto flex items-center gap-3">
                <ThemeToggle />
                <div className="relative">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setOpen((v) => !v)}
                        className="flex items-center gap-2 rounded-xl border border-indigo-100 bg-white px-2 py-1.5 text-slate-700 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                        {profileImage ? (
                            <Image src={profileImage} alt={profileName} className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-600" />
                        ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white ring-1 ring-slate-200 dark:ring-slate-600">
                                {(profileName?.charAt(0) || "F").toUpperCase()}
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
                            <Link href="/franchise/profile">
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
                                className="h-auto w-full justify-start gap-2 rounded-lg px-3 py-2 font-normal text-rose-600 shadow-none hover:bg-rose-50 focus-visible:ring-0 dark:text-rose-400 dark:hover:bg-rose-950/40 border-none"
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
