"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MapPinned, X } from "lucide-react";

export type ServiceAreaOption = {
    _id: string;
    name: string;
};

type ServiceAreaFilterProps = {
    areas: ServiceAreaOption[];
    selectedIds: string[];
};

function buildHref(pathname: string, searchParams: URLSearchParams, nextAreaIds: string[], pageNo = 1) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextAreaIds.length > 0) {
        params.set("areas", nextAreaIds.join(","));
    } else {
        params.delete("areas");
    }
    if (pageNo > 1) params.set("pageNo", String(pageNo));
    else params.delete("pageNo");
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
}

export default function ServiceAreaFilter({ areas, selectedIds }: ServiceAreaFilterProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

    if (!areas.length) return null;

    const toggleArea = (areaId: string) => {
        const next = selectedSet.has(areaId) ? selectedIds.filter((id) => id !== areaId) : [...selectedIds, areaId];
        router.push(buildHref(pathname, searchParams, next, 1), { scroll: false });
    };

    const clearAll = () => {
        router.push(buildHref(pathname, searchParams, [], 1), { scroll: false });
    };

    return (
        <div className="mb-6 rounded-2xl border border-gray-100 bg-gray-50/80 p-4 sm:p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <MapPinned className="h-4 w-4" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-900">Filter by area</p>
                        <p className="text-xs text-gray-500">
                            {selectedIds.length > 0
                                ? `${selectedIds.length} area${selectedIds.length === 1 ? "" : "s"} selected — showing matching providers`
                                : "Select areas to narrow providers, or leave empty to see all in this city"}
                        </p>
                    </div>
                </div>
                {selectedIds.length > 0 ? (
                    <button
                        type="button"
                        onClick={clearAll}
                        className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-primary hover:text-primary"
                    >
                        <X className="h-3.5 w-3.5" />
                        Clear areas
                    </button>
                ) : null}
            </div>

            <div className="flex max-h-36 flex-wrap gap-2 overflow-y-auto">
                {areas.map((area) => {
                    const active = selectedSet.has(area._id);
                    return (
                        <button
                            key={area._id}
                            type="button"
                            onClick={() => toggleArea(area._id)}
                            aria-pressed={active}
                            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${active ? "border-primary bg-primary text-white shadow-sm" : "border-gray-200 bg-white text-gray-700 hover:border-primary/40 hover:bg-orange-50 hover:text-primary"}`}
                        >
                            {area.name}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
