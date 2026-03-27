import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/helpers/utils";

export type ButtonVariant =
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger"
    | "outline"
    | "ghost"
    | "gradient";

export type ButtonSize = "sm" | "md" | "lg" | "icon";

const base =
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0";

const variants: Record<ButtonVariant, string> = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500",
    secondary:
        "bg-secondary-200 text-secondary-900 hover:bg-secondary-300 focus:ring-secondary-500 dark:bg-secondary-700 dark:text-white dark:hover:bg-secondary-600",
    success: "bg-success-600 text-white hover:bg-success-700 focus:ring-success-500",
    warning: "bg-warning-600 text-white hover:bg-warning-700 focus:ring-warning-500",
    danger: "bg-danger-600 text-white hover:bg-danger-700 focus:ring-danger-500",
    outline:
        "border-2 border-primary-600 bg-transparent text-primary-600 hover:bg-primary-50 focus:ring-primary-500 dark:hover:bg-primary-900/20",
    ghost:
        "border border-secondary-300 text-secondary-700 hover:bg-secondary-50 focus:ring-secondary-400 dark:border-secondary-600 dark:text-secondary-300 dark:hover:bg-secondary-800",
    gradient:
        "bg-linear-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white shadow-sm hover:from-indigo-500 hover:via-violet-500 hover:to-fuchsia-500 focus-visible:ring-[3px] focus-visible:ring-indigo-200 focus:ring-0"
};

const sizes: Record<ButtonSize, string> = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 py-2 text-sm",
    lg: "h-12 px-6 py-3 text-base",
    icon: "h-8 w-8 shrink-0 p-0 [&_svg]:size-4"
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
    children?: ReactNode;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
    { className, variant = "primary", size = "md", fullWidth, type = "button", children, ...props },
    ref
) {
    return (
        <button
            ref={ref}
            type={type}
            data-slot="button"
            className={cn(base, variants[variant], sizes[size], fullWidth && "w-full", className)}
            {...props}
        >
            {children}
        </button>
    );
});
