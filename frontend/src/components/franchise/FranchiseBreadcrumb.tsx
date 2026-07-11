"use client";

import Link from "next/link";
import { ChevronRight, House } from "lucide-react";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { getFranchiseBreadcrumbItems } from "@/helpers/utils";

export default function FranchiseBreadcrumb({ className = "" }: { className?: string }) {
    const pathname = usePathname();
    const breadcrumbItems = useMemo(() => getFranchiseBreadcrumbItems(pathname), [pathname]);

    return (
        <nav className={`p-3 flex items-center space-x-2 text-sm ${className}`} aria-label="Breadcrumb">
            <Link href="/franchise/dashboard" aria-label="Home" className="text-secondary-600 transition-colors hover:text-primary-600 dark:text-secondary-400 dark:hover:text-primary-400">
                <House className="h-4 w-4" aria-hidden />
            </Link>
            {breadcrumbItems.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-secondary-400 dark:text-secondary-600" aria-hidden />
                    {item.href ? (
                        <Link href={item.href} className="text-secondary-600 transition-colors hover:text-primary-600 dark:text-secondary-400 dark:hover:text-primary-400">
                            {item.label}
                        </Link>
                    ) : (
                        <span className="font-medium text-secondary-900 dark:text-white">{item.label}</span>
                    )}
                </div>
            ))}
        </nav>
    );
}
