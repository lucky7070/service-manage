import * as React from "react";
import { cn } from "@/helpers/utils";
import { inputClassName } from "@/components/ui/Input";

export const selectClassName = inputClassName;

const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
    ({ className, children, ...props }, ref) => (
        <select ref={ref} className={cn(selectClassName, 'capitalize', className)} {...props}>
            {children}
        </select>
    )
);

export const Option = React.forwardRef<HTMLOptionElement, React.OptionHTMLAttributes<HTMLOptionElement>>(
    ({ className, children, ...props }, ref) => (
        <option ref={ref} className={cn(selectClassName, 'capitalize', className)} {...props}>
            {children}
        </option>
    )
);

Select.displayName = "Select";
Option.displayName = "Option";

export default Select;
