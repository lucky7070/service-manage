import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/helpers/utils";

export type BadgeVariant = "primary" | "secondary" | "success" | "warning" | "danger" | "info";

const variantClass: Record<BadgeVariant, string> = {
    primary: "badge badge-primary",
    secondary: "badge badge-secondary",
    success: "badge badge-success",
    warning: "badge badge-warning",
    danger: "badge badge-danger",
    info: "badge badge-info"
};

export type BadgeSize = "sm" | "md" | "lg";

const sizeClass: Record<BadgeSize, string> = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-0.5 text-sm",
    lg: "px-3 py-1 text-base"
};

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
    variant?: BadgeVariant;
    size?: BadgeSize;
    children?: ReactNode;
};

export function Badge({ className, variant = "primary", size = "md", children, ...props }: BadgeProps) {
    return (
        <span data-slot="badge" className={cn(variantClass[variant], sizeClass[size], className)} {...props}>
            {children}
        </span>
    );
}

/** Map free-form status strings to semantic badge variants (tables, feeds). */
export function statusToBadgeVariant(value: string): BadgeVariant {
    const v = value.toLowerCase();
    if (
        v.includes("completed") ||
        v.includes("active") ||
        v.includes("success") ||
        v.includes("confirmed")
    ) {
        return "success";
    }
    if (v.includes("pending") || v.includes("progress") || v.includes("processing") || v.includes("kyc")) {
        return "warning";
    }
    if (v.includes("cancel") || v.includes("inactive") || v.includes("failed") || v.includes("suspend")) {
        return "danger";
    }
    return "primary";
}
