import { cn } from "@/helpers/utils";

export type ProgressTone = "primary" | "success" | "warning" | "danger";

const barColor: Record<ProgressTone, string> = {
    primary: "bg-primary-600",
    success: "bg-success-600",
    warning: "bg-warning-600",
    danger: "bg-danger-600"
};

export type ProgressBarProps = {
    label: string;
    value: number;
    tone?: ProgressTone;
    className?: string;
};

export function ProgressBar({ label, value, tone = "primary", className }: ProgressBarProps) {
    const pct = Math.min(100, Math.max(0, value));
    return (
        <div data-slot="progress" className={cn(className)}>
            <div className="mb-1 flex justify-between text-xs text-secondary-600 dark:text-secondary-400">
                <span>{label}</span>
                <span>{pct}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-secondary-200 dark:bg-secondary-700">
                <div className={cn("h-2 rounded-full transition-all", barColor[tone])} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}
