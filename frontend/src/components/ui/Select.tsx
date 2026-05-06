import * as React from "react";
import { cn } from "@/helpers/utils";
import { inputClassName } from "@/components/ui/Input";

export const selectClassName = inputClassName;

const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
    ({ className, children, ...props }, ref) => (
        <select ref={ref} className={cn(selectClassName, "capitalize dark:[&>option]:bg-slate-900 dark:[&>option]:text-slate-100", className)} {...props}>
            {children}
        </select>
    )
);

export const Option = React.forwardRef<HTMLOptionElement, React.OptionHTMLAttributes<HTMLOptionElement>>(
    ({ className, children, ...props }, ref) => (
        <option ref={ref} className={cn("bg-white text-slate-900 capitalize dark:bg-slate-900 dark:text-slate-100", className)} {...props}>
            {children}
        </option>
    )
);

Select.displayName = "Select";
Option.displayName = "Option";

export default Select;
