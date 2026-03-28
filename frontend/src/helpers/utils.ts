import { ADMIN_BREADCRUMB_ROUTES, AdminBreadcrumbItem } from "@/config";
import { SweetAlertOptions } from "sweetalert2";

export function cn(...parts: Array<string | undefined | false | null>): string {
    return parts.filter(Boolean).join(" ");
}

export const resolveFileUrl = (fileName?: string | null) => {
    if (!fileName) return null;
    return fileName.startsWith("http") ? fileName : `${process.env.NEXT_PUBLIC_UPLOAD_URL}${fileName}`;
};

export function getSweetAlertConfig({
    title = 'Are you sure?',
    text = "This action cannot be undone.!",
    icon = 'warning',
    confirmButtonText = 'Yes, Delete',
    customClass = {},
    ...other
}: SweetAlertOptions) {
    return {
        title, text, icon, confirmButtonText,
        // buttonsStyling: false,
        showCancelButton: true,
        // confirmButtonColor: '#3085d6',
        // cancelButtonColor: '#d33',
        customClass: {
            // popup: 'p-3 m-0 d-flex flex-column gap-3 align-items-center',
            // title: 'h3 p-0 m-0',
            // icon: 'm-0 mx-auto',
            // htmlContainer: 'm-0 p-0 fs-0',
            // actions: 'm-0 p-0',
            // denyButton: 'btn btn-secondary',
            // confirmButton: 'btn btn-danger me-2',
            // closeButton: 'btn btn-secondary',
            // cancelButton: 'btn btn-secondary',
            // input: 'form-select m-0 bg-transprent',
            // container: '...',
            // image: '...',
            // input: '...',
            // inputLabel: '...',
            // validationMessage: '...',
            // loader: '...',
            // footer: '...',
            // timerProgressBar: '...',
            ...customClass
        },
        ...other
    }
}

export const titleCaseSegment = (value: string) =>
    value.replace(/[-_]/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase());

export const getAdminBreadcrumbItems = (pathname: string): AdminBreadcrumbItem[] => {
    const matched = ADMIN_BREADCRUMB_ROUTES.find((rule) => rule.startsWith ? pathname.startsWith(rule.path) : pathname === rule.path);

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

/** URL-safe slug from a label (matches backend slugify). */
export function slugify(s: string): string {
    return s
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 100);
}

export type ServiceCategoryFormValues = {
    _id: string;
    slug: string;
    name: string;
    nameHi: string;
    description: string;
    displayOrder: number | "";
    status: number;
    image: string | null;
};

export function buildServiceCategoryFormData(values: ServiceCategoryFormValues, imageFile: File | null): FormData {
    const fd = new FormData();
    fd.append("name", values.name.trim());
    fd.append("slug", values.slug.trim() ? values.slug.trim() : slugify(values.name));
    fd.append("nameHi", values.nameHi?.trim() || "");
    fd.append("description", values.description?.trim() || "");
    fd.append("displayOrder", String(values.displayOrder === "" ? 0 : values.displayOrder));
    fd.append("status", String(values.status));
    if (imageFile) fd.append("image", imageFile);
    return fd;
}

export type ServiceTypeFormValues = {
    _id: string;
    categoryId: string;
    name: string;
    nameHi: string;
    estimatedTimeMinutes: number | "";
    basePrice: number | "";
    description: string;
    status: number;
};

export function serviceTypeFormToPayload(values: ServiceTypeFormValues) {
    const est = values.estimatedTimeMinutes;
    const price = values.basePrice;
    return {
        categoryId: values.categoryId,
        name: values.name.trim(),
        nameHi: values.nameHi?.trim() || "",
        description: values.description?.trim() || "",
        estimatedTimeMinutes: est === "" || est === undefined ? "" : Number(est),
        basePrice: price === "" || price === undefined ? "" : Number(price),
        status: values.status
    };
}