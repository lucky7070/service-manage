"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Check, Clock, ImageIcon, Wrench } from "lucide-react";
import Image from "@/components/ui/Image";
import { Button } from "@/components/front/ui";
import { cn, resolveFileUrl } from "@/helpers/utils";
import { useAppSelector } from "@/store/hooks";
import type { ServiceTypeByCategory } from "@/lib/api.server";
import ServiceTypeLeadModal from "@/components/front/ServiceTypeLeadModal";

const STORAGE_IDS_KEY = "selectedServiceTypeIds";
const STORAGE_PATH_KEY = "selectedServiceTypeRedirectPath";

type Props = {
    category: { _id: string; slug: string; name: string };
    serviceTypes: ServiceTypeByCategory[];
};

function formatPrice(value?: number | null) {
    if (value == null || Number.isNaN(Number(value))) return null;
    return `₹${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

function clearSelectionStorage() {
    localStorage.removeItem(STORAGE_IDS_KEY);
    localStorage.removeItem(STORAGE_PATH_KEY);
}

function parseStoredIds(raw: string, validIds: Set<string>): string[] {
    try {
        const parsed = JSON.parse(raw) as unknown;
        if (!Array.isArray(parsed)) return [];
        return [...new Set(parsed.filter((id): id is string => typeof id === "string" && validIds.has(id)))];
    } catch {
        return [];
    }
}

export default function CategoryServiceTypeGrid({ category, serviceTypes }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const user = useAppSelector((state) => state.user);
    const authLoading = useAppSelector((state) => state.app.loading);
    const [open, setOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [pendingResume, setPendingResume] = useState(false);
    const [pendingContinue, setPendingContinue] = useState(false);

    const validIdSet = useMemo(() => new Set(serviceTypes.map((type) => type._id)), [serviceTypes]);
    const selectedTypes = useMemo(
        () => serviceTypes.filter((type) => selectedIds.includes(type._id)),
        [serviceTypes, selectedIds]
    );

    const toggleType = (typeId: string) => {
        setSelectedIds((prev) => (prev.includes(typeId) ? prev.filter((id) => id !== typeId) : [...prev, typeId]));
    };

    const clearSelection = () => {
        setSelectedIds([]);
        clearSelectionStorage();
    };

    const redirectToLogin = useCallback((ids: string[]) => {
        localStorage.setItem(STORAGE_IDS_KEY, JSON.stringify(ids));
        const path = pathname || `/services/${category.slug}`;
        localStorage.setItem(STORAGE_PATH_KEY, path);
        router.push(`/login?redirect=${encodeURIComponent(path)}`);
    }, [pathname, category.slug, router]);

    useEffect(() => {
        let cancelled = false;

        void Promise.resolve().then(() => {
            if (cancelled) return;

            const storedIds = localStorage.getItem(STORAGE_IDS_KEY);
            const storedPath = localStorage.getItem(STORAGE_PATH_KEY);
            if (!storedIds || pathname !== storedPath) return;

            const nextIds = parseStoredIds(storedIds, validIdSet);
            clearSelectionStorage();
            if (!nextIds.length) return;

            setSelectedIds(nextIds);
            setPendingResume(true);
        });

        return () => {
            cancelled = true;
        };
    }, [pathname, validIdSet]);

    useEffect(() => {
        if (!pendingResume || authLoading) return;

        let cancelled = false;
        void Promise.resolve().then(() => {
            if (cancelled) return;
            setPendingResume(false);
            if (user._id) setOpen(true);
        });

        return () => {
            cancelled = true;
        };
    }, [pendingResume, authLoading, user._id]);

    useEffect(() => {
        if (!pendingContinue || authLoading || !selectedIds.length) return;

        let cancelled = false;
        void Promise.resolve().then(() => {
            if (cancelled) return;
            setPendingContinue(false);
            if (user._id) setOpen(true);
            else redirectToLogin(selectedIds);
        });

        return () => {
            cancelled = true;
        };
    }, [pendingContinue, redirectToLogin, authLoading, user._id, selectedIds, pathname, category.slug, router]);

    const handleContinue = () => {
        if (!selectedIds.length) return;
        if (user._id) return setOpen(true);
        if (authLoading) return setPendingContinue(true);
        redirectToLogin(selectedIds);
    };

    if (!serviceTypes.length) {
        return (
            <div className="mt-8 rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center">
                <Wrench className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                <p className="text-sm text-gray-500">Services for this category will appear here soon.</p>
            </div>
        );
    }

    return (
        <div className="mt-8 border-t border-gray-100 pt-6">
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Choose a service</h2>
                    <p className="mt-1 text-sm text-gray-500">Select one or more services, then continue.</p>
                </div>
                {selectedIds.length ? <p className="text-sm font-medium text-primary">{selectedIds.length} selected</p> : null}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {serviceTypes.map((type) => {
                    const thumb = resolveFileUrl(type?.image || "");
                    const price = formatPrice(type?.basePrice || null);
                    const selected = selectedIds.includes(type._id);
                    return (
                        <button
                            key={type._id}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => toggleType(type._id)}
                            className={cn(
                                "group flex w-full items-start gap-3 rounded-2xl border bg-white p-3.5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                                selected ? "border-primary bg-orange-50/50 shadow-md ring-1 ring-primary/20" : "border-gray-100 hover:border-orange-200 hover:shadow-md"
                            )}
                        >

                            {thumb ? <Image src={thumb} alt={type.name} className="object-cover size-14" /> : <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-orange-50 shadow-sm">
                                <div className="flex h-full w-full items-center justify-center text-primary/70">
                                    <ImageIcon className="h-6 w-6" />
                                </div>
                            </div>}

                            <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                    <h3 className={cn("font-semibold text-gray-900", selected && "text-primary")}>
                                        {type.name}
                                    </h3>
                                    <span className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition", selected ? "border-primary bg-primary text-white" : "border-gray-300 bg-white text-transparent")}>
                                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                                    </span>
                                </div>

                                {type.description ? (
                                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-500">{type.description}</p>
                                ) : null}

                                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                                    {price ? <span className="font-semibold text-primary">From {price}</span> : null}
                                    {type.estimatedTimeMinutes != null ? (
                                        <span className="inline-flex items-center gap-1">
                                            <Clock className="h-3.5 w-3.5" />
                                            ~{type.estimatedTimeMinutes} min
                                        </span>
                                    ) : null}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="sticky bottom-4 z-10 mt-5 flex flex-col gap-2 rounded-2xl border border-orange-100 bg-white/95 p-3 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-600">
                    {selectedIds.length ? `${selectedIds.length} service${selectedIds.length > 1 ? "s" : ""} selected` : "Select at least one service to continue"}
                </p>
                <div className="flex gap-2">
                    {selectedIds.length ? <Button type="button" variant="outline" onClick={clearSelection}>Clear</Button> : null}
                    <Button type="button" disabled={!selectedIds.length || pendingContinue} onClick={handleContinue}>
                        {pendingContinue ? "Please wait..." : "Continue"}
                    </Button>
                </div>
            </div>

            <ServiceTypeLeadModal
                open={open}
                onOpenChange={setOpen}
                category={category}
                serviceTypes={selectedTypes}
                onSubmitted={clearSelection}
            />
        </div >
    );
}
