import type { InputHTMLAttributes } from "react";
import { cn } from "@/helpers/utils";

export type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export function Radio({ className, ...props }: RadioProps) {
    return (
        <input
            type="radio"
            className={cn(
                "h-4 w-4 border-secondary-300 text-primary-600 shadow-xs focus:ring-2 focus:ring-primary-500 dark:border-secondary-600 dark:focus:ring-primary-400",
                className
            )}
            {...props}
        />
    );
}
