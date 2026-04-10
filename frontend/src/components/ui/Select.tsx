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

Select.displayName = "Select";

export default Select;
