"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/helpers/utils";
import { inputClassName } from "./Input";

export type PasswordInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
    showToggle?: boolean;
};

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
    ({ className, showToggle = true, disabled, ...props }, ref) => {
        const [visible, setVisible] = React.useState(false);

        return (
            <div className="relative">
                <input
                    ref={ref}
                    type={visible ? "text" : "password"}
                    disabled={disabled}
                    className={cn(inputClassName, showToggle && "pr-10", className)}
                    {...props}
                />
                {showToggle ? (
                    <button
                        type="button"
                        disabled={disabled}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                        aria-label={visible ? "Hide password" : "Show password"}
                        aria-pressed={visible}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setVisible((v) => !v)}
                    >
                        {visible ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
                    </button>
                ) : null}
            </div>
        );
    }
);

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
