import * as React from "react";
import { cn } from "@/helpers/utils";

export const inputClassName = "h-9 w-full min-w-0 rounded-md border border-indigo-100 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs outline-none transition-[color,box-shadow] placeholder:text-slate-400 focus-visible:border-indigo-400 focus-visible:ring-[3px] focus-visible:ring-indigo-200 dark:border-indigo-100 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 read-only:cursor-default read-only:bg-slate-100 read-only:text-slate-600 dark:read-only:bg-slate-900/10 dark:read-only:text-slate-400";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    ({ className, type = "text", ...props }, ref) => {
        const nextProps = { ...props } as React.InputHTMLAttributes<HTMLInputElement>;
        if ("value" in nextProps && nextProps.value === undefined && !("defaultValue" in nextProps)) {
            nextProps.value = "";
        }

        return <input ref={ref} type={type} className={cn(inputClassName, className)} {...nextProps} />;
    }
);

Input.displayName = "Input";

export default Input;
