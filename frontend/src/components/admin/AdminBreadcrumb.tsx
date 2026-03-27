import Link from "next/link";
import { ChevronRight, House } from "lucide-react";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type AdminBreadcrumbProps = {
  items: BreadcrumbItem[];
  className?: string;
};

export default function AdminBreadcrumb({ items, className = "" }: AdminBreadcrumbProps) {
  return (
    <nav className={`mb-6 flex items-center space-x-2 text-sm ${className}`} aria-label="Breadcrumb">
      <Link
        href="/admin/dashboard"
        aria-label="Home"
        className="text-secondary-600 transition-colors hover:text-primary-600 dark:text-secondary-400 dark:hover:text-primary-400"
      >
        <House className="h-4 w-4" aria-hidden />
      </Link>
      {items.map((item, i) => (
        <div key={`${item.label}-${i}`} className="flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-secondary-400 dark:text-secondary-600" aria-hidden />
          {item.href ? (
            <Link
              href={item.href}
              className="text-secondary-600 transition-colors hover:text-primary-600 dark:text-secondary-400 dark:hover:text-primary-400"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-secondary-900 dark:text-white">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
