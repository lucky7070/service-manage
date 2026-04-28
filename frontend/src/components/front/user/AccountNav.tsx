"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, Home, LayoutDashboard, UserRound } from "lucide-react";
import { cn } from "@/helpers/utils";

const links = [
    { href: "/user/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/user/bookings", label: "Bookings", icon: CalendarCheck },
    { href: "/user/addresses", label: "Addresses", icon: Home },
    { href: "/user/profile", label: "Profile", icon: UserRound }
];

export default function AccountNav() {
    const pathname = usePathname();

    return (
        <aside className="rounded-2xl border border-border bg-card p-3 shadow-sm lg:sticky lg:top-28">
            <div className="mb-3 px-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">My Account</p>
            </div>
            <nav className="grid gap-2 sm:grid-cols-4 lg:grid-cols-1">
                {links.map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground lg:justify-start",
                                active && "bg-primary text-white hover:bg-primary hover:text-white"
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
