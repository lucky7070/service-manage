"use client";

import { Input, Label } from "@/components/ui";

type AdminDateRangeFilterProps = {
    dateFrom: string;
    dateTo: string;
    onChange: (next: { dateFrom?: string; dateTo?: string }) => void;
};

export default function AdminDateRangeFilter({ dateFrom, dateTo, onChange }: AdminDateRangeFilterProps) {
    return (
        <div className="flex items-end gap-2">
            <div>
                <Label htmlFor="admin-date-from" className="text-xs">From</Label>
                <Input
                    id="admin-date-from"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => onChange({ dateFrom: e.target.value })}
                    className="w-[140px]"
                />
            </div>
            <div>
                <Label htmlFor="admin-date-to" className="text-xs">To</Label>
                <Input
                    id="admin-date-to"
                    type="date"
                    value={dateTo}
                    onChange={(e) => onChange({ dateTo: e.target.value })}
                    className="w-[140px]"
                />
            </div>
        </div>
    );
}
