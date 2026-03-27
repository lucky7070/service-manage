import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/helpers/utils";

export type IconActionTone = "permission" | "edit" | "delete";

const tones: Record<IconActionTone, string> = {
  permission: "border-indigo-100 bg-primary-600 text-white shadow-sm hover:bg-primary-700 focus-visible:ring-primary-500 dark:border-indigo-100 dark:bg-primary-600 dark:hover:bg-primary-500",
  edit: "border-indigo-100 bg-secondary-600 text-white shadow-sm hover:bg-secondary-700 focus-visible:ring-secondary-500 dark:border-indigo-100 dark:bg-secondary-600 dark:hover:bg-secondary-700",
  delete: "border-indigo-100 bg-danger-600 text-white shadow-sm hover:bg-danger-700 focus-visible:ring-danger-500 dark:border-indigo-100 dark:bg-danger-600 dark:hover:bg-danger-700"
};

const base =
  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

export type IconActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone: IconActionTone;
  children: ReactNode;
  "aria-label": string;
};

export const IconActionButton = forwardRef<HTMLButtonElement, IconActionButtonProps>(function IconActionButton(
  { className, tone, type = "button", children, ...props },
  ref
) {
  return (
    <button ref={ref} type={type} className={cn(base, tones[tone], className)} {...props}>
      {children}
    </button>
  );
});

