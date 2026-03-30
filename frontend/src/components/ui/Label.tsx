import * as React from "react";
import { cn } from "@/helpers/utils";

const labelClassName = "flex items-center gap-2 text-sm font-medium leading-none select-none text-slate-500 dark:text-slate-200 mb-3";

const Label = ({ children, className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement> & { className?: string }) => (
    <label className={cn(labelClassName, className)} {...props}>
        {children}
    </label>
);

export default Label;
