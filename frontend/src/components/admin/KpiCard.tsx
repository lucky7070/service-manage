import { Badge } from "@/components/ui";

type KpiCardProps = {
    title: string;
    value: string;
    change: string;
    positive?: boolean;
};

export default function KpiCard({ title, value, change, positive = true }: KpiCardProps) {
    return (
        <div className="rounded-2xl border border-indigo-100 bg-linear-to-br from-white to-[#eef3ff] p-4 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:to-slate-800">
            <p className="text-xs font-medium uppercase tracking-wide text-indigo-500 dark:text-indigo-300">{title}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{value}</p>
            <div className="mt-1">
                <Badge variant={positive ? "success" : "danger"} size="sm">
                    {change}
                </Badge>
            </div>
        </div>
    );
}
