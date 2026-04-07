import type { LabelHTMLAttributes, ReactNode } from "react";

type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
    children: ReactNode;
};

export default function Label({ children, ...props }: LabelProps) {
    return <label className="mb-1.5 block text-sm font-semibold text-muted-foreground" {...props}>{children}</label>;
}