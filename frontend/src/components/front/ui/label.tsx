import type { LabelHTMLAttributes, ReactNode } from "react";
import { cn } from "@/helpers/utils";

type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
    children: ReactNode;
    required?: boolean;
};

export default function Label({ children, className, required = false, ...props }: LabelProps) {
    return (
        <label className={cn("mb-1.5 block text-sm font-semibold text-muted-foreground", className)} {...props}>
            {children}
            {required ? (
                <span className="ml-0.5 text-rose-600" aria-hidden="true">
                    *
                </span>
            ) : null}
        </label>
    );
}
