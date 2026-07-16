"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { EllipsisVertical } from "lucide-react";
import { Button } from "@/components/ui";
import PermissionBlock from "@/components/admin/PermissionBlock";
import { cn } from "@/helpers/utils";

export type AdminActionsDropdownItem = {
    key: string;
    label: string;
    icon: LucideIcon;
    href?: string;
    onClick?: () => void;
    permissionId?: number | boolean | (number | boolean)[];
    danger?: boolean;
    hidden?: boolean;
};

type AdminActionsDropdownProps = {
    items: AdminActionsDropdownItem[];
    align?: "left" | "right";
    className?: string;
    menuClassName?: string;
    trigger?: ReactNode;
    "aria-label"?: string;
};

export default function AdminActionsDropdown({
    items,
    align = "right",
    className,
    menuClassName,
    trigger,
    "aria-label": ariaLabel = "Actions",
}: AdminActionsDropdownProps) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;

        const handlePointerDown = (event: MouseEvent | TouchEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("touchstart", handlePointerDown);
        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("touchstart", handlePointerDown);
        };
    }, [open]);

    const visibleItems = items.filter((item) => !item.hidden);
    if (!visibleItems.length) return null;

    const itemClassName = (danger?: boolean) =>
        cn(
            "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition",
            danger
                ? "text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
        );

    return (
        <div className={cn("relative flex justify-end", className)} ref={menuRef}>
            {trigger ? (
                <button type="button" onClick={() => setOpen((prev) => !prev)} aria-label={ariaLabel} aria-expanded={open}>
                    {trigger}
                </button>
            ) : (
                <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setOpen((prev) => !prev)}
                    title={ariaLabel}
                    aria-label={ariaLabel}
                    aria-expanded={open}
                >
                    <EllipsisVertical className="h-4 w-4 shrink-0" strokeWidth={2} />
                </Button>
            )}

            {open ? (
                <div
                    className={cn(
                        "absolute top-full z-30 mt-1 w-52 overflow-hidden rounded-xl border border-indigo-100 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900",
                        align === "right" ? "right-0" : "left-0",
                        menuClassName
                    )}
                >
                    {visibleItems.map((item) => {
                        const Icon = item.icon;
                        const content = item.href ? (
                            <Link
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className={itemClassName(item.danger)}
                            >
                                <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
                                {item.label}
                            </Link>
                        ) : (
                            <button
                                type="button"
                                onClick={() => {
                                    setOpen(false);
                                    item.onClick?.();
                                }}
                                className={itemClassName(item.danger)}
                            >
                                <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
                                {item.label}
                            </button>
                        );

                        if (item.permissionId === undefined) return <div key={item.key}>{content}</div>;

                        return (
                            <PermissionBlock key={item.key} permission_id={item.permissionId}>
                                {content}
                            </PermissionBlock>
                        );
                    })}
                </div>
            ) : null}
        </div>
    );
}
