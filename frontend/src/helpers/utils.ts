import { ADMIN_ROUTE_PERMISSIONS, AdminBreadcrumbItem } from "@/config";
import envConfig from "@/config/env";
import { SweetAlertOptions } from "sweetalert2";

export function cn(...parts: Array<string | undefined | false | null>): string {
    return parts.filter(Boolean).join(" ");
}

export const resolveFileUrl = (fileName?: string | null) => {
    if (!fileName) return null;
    if (fileName.startsWith("/")) return `${envConfig.uploadUrl}${fileName}`;
    if (fileName.startsWith("http")) return fileName;
    return null;
};

export const getIconConfig = (icon: string) => {
    const icons = {
        warning: {
            html: `<svg xmlns="http://www.w3.org/2000/svg" width="65" height="65" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>`,
            color: "text-warning-500"
        },
        error: {
            html: `<svg xmlns="http://www.w3.org/2000/svg" width="65" height="65" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-badge-x-icon lucide-badge-x"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><line x1="15" x2="9" y1="9" y2="15"/><line x1="9" x2="15" y1="9" y2="15"/></svg>`,
            color: "text-danger-500"
        },
        success: {
            html: `<svg xmlns="http://www.w3.org/2000/svg" width="65" height="65" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-badge-check-icon lucide-badge-check"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/></svg>`,
            color: "text-success-500"
        },
        info: {
            html: `<svg xmlns="http://www.w3.org/2000/svg" width="65" height="65" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-badge-info-icon lucide-badge-info"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/></svg>`,
            color: "text-primary-500"
        }
    };

    return icons[icon as keyof typeof icons] || icons.warning;
};

export function getSweetAlertConfig({
    title = 'Are you sure?',
    text = "This action cannot be undone.!",
    icon = 'warning',
    confirmButtonText = 'Yes, Delete',
    customClass = {},
    ...other
}: SweetAlertOptions): SweetAlertOptions {
    const isDanger = ["warning", "error"].includes(String(icon));
    const iconConfig = getIconConfig(icon);

    const confirmButtonClass = isDanger
        ? "inline-flex min-w-40 items-center justify-center rounded-lg bg-danger-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-danger-700 focus:outline-none focus:ring-2 focus:ring-danger-300 disabled:opacity-50"
        : "inline-flex min-w-40 items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50";

    return {
        title,
        text,
        iconHtml: iconConfig.html,
        confirmButtonText,
        buttonsStyling: false,
        showCancelButton: true,
        reverseButtons: true,
        customClass: {
            container: "px-3 fixed inset-0 flex items-center justify-center bg-white/10 backdrop-blur-xs",
            popup: "w-full p-6 text-center max-w-lg rounded-3xl flex flex-col items-center justify-center border border-indigo-100 bg-white text-slate-900 shadow-xl dark:border-indigo-100 dark:bg-slate-900 dark:text-slate-100 max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto",
            icon: `mt-1 mb-2 flex items-center justify-center mx-auto text-5xl ${iconConfig.color}`,
            title: "text-2xl font-semibold leading-tight text-slate-900 dark:text-slate-100",
            htmlContainer: "mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300",
            actions: "mt-6 flex w-full flex-row-reverse gap-2 sm:justify-end",
            confirmButton: confirmButtonClass,
            cancelButton: "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 bg-secondary-200 text-secondary-900 hover:bg-secondary-300 focus:ring-secondary-500 dark:bg-secondary-700 dark:text-white dark:hover:bg-secondary-600 h-10 px-4 py-2.5 text-sm min-w-[130px]",
            input: "h-10 w-full rounded-md border border-indigo-100 bg-white px-3 text-sm text-slate-900 shadow-xs outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-black dark:text-slate-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-400/30",
            inputLabel: "mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200",
            validationMessage: "mt-2 text-xs text-rose-600",
            denyButton: "inline-flex min-w-[110px] items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:opacity-50 dark:border-slate-700 dark:bg-black dark:text-slate-200 dark:hover:bg-slate-950",
            closeButton: "absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
            loader: "hidden h-6 w-6 border-2 border-indigo-200 border-t-indigo-700 rounded-full animate-spin dark:border-indigo-900 dark:border-t-indigo-400",
            footer: "mt-2 text-sm text-slate-600 dark:text-slate-300",
            timerProgressBar: isDanger ? "bg-danger-600" : "bg-indigo-600",
            image: "my-3 rounded-lg",
            ...customClass
        },
        ...other
    };
}

export const titleCaseSegment = (value: string) => value.replace(/[-_]/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase());

export const compareRoute = (currentRoute: string, definedPattern: string): boolean => {
    const normalizedCurrent = currentRoute.replace(/\/+$/, "") || "/";
    const normalizedPattern = definedPattern.replace(/\/+$/, "") || "/";
    const regexPattern = normalizedPattern.replace(/:[^/]+/g, "([^/]+)").replace(/\//g, "\\/");
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(normalizedCurrent);
};

export const getAdminBreadcrumbItems = (pathname: string): AdminBreadcrumbItem[] => {
    const matched = ADMIN_ROUTE_PERMISSIONS.find((rule) => compareRoute(pathname, rule.path));

    if (matched) return matched.items;
    if (!pathname.startsWith("/admin")) return [];

    const segments = pathname.split("/").filter(Boolean);
    const adminIndex = segments.indexOf("admin");
    const routeSegments = adminIndex >= 0 ? segments.slice(adminIndex + 1) : segments;

    let cumulative = "/admin";
    return routeSegments.map((segment, idx) => {
        cumulative += `/${segment}`;
        const isLast = idx === routeSegments.length - 1;
        const isIdLike = /^[a-f0-9]{24}$/i.test(segment);
        return {
            label: isIdLike ? "Details" : titleCaseSegment(segment),
            href: isLast ? undefined : cumulative
        };
    });
};

export function slugify(s: string): string {
    return s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100);
}

export function isProductionEnvironment(): boolean {
    return envConfig.environment === "production";
}