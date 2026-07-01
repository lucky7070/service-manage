import { DEVELOPER_CREDIT } from "@/config/constants";
import { cn } from "@/helpers/utils";

type DeveloperCreditProps = {
    variant?: "front" | "admin";
    className?: string;
};

export default function DeveloperCredit({ variant = "front", className }: DeveloperCreditProps) {
    const isAdmin = variant === "admin";

    return (
        <p className={cn(isAdmin ? "text-slate-500 dark:text-slate-400" : "text-gray-500", className)}>
            Designed & Developed By {" "}
            <a
                href={DEVELOPER_CREDIT.href}
                target="_blank"
                rel="noreferrer"
                className={cn("font-semibold underline-offset-2 transition-colors hover:underline", isAdmin ? "text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300" : "text-primary hover:text-orange-400",)}
            >
                {DEVELOPER_CREDIT.name}
            </a>
        </p>
    );
}
