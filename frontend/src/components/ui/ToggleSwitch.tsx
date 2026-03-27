import type { ButtonHTMLAttributes } from "react";

export type ToggleSwitchProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> & {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    disabled?: boolean;
};

export function ToggleSwitch({ checked, onCheckedChange, disabled, className, ...props }: ToggleSwitchProps) {
    return (
        <button
            {...props}
            type={props.type ?? "button"}
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => onCheckedChange(!checked)}
            className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-primary-400 dark:focus-visible:ring-offset-slate-900
        ${disabled ? "cursor-not-allowed opacity-60" : ""}
        ${checked ? "bg-primary-600" : "bg-secondary-300 dark:bg-secondary-600"}
        ${className ?? ""}
      `}
        >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
        </button>
    );
}

