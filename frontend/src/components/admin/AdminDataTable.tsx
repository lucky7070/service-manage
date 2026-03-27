"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, ChevronDown, Download, Ellipsis, Search } from "lucide-react";
import { Badge, Button, IconActionButton, statusToBadgeVariant } from "@/components/ui";

type Column = { key: string; label: string };

type AdminDataTableProps = {
    title?: string;
    columns: Column[];
    rows: Record<string, string>[];
    filterBy?: { key: string; label: string; options: string[] };
};

export default function AdminDataTable({ title, columns, rows, filterBy }: AdminDataTableProps) {
    const [query, setQuery] = useState("");
    const [filterValue, setFilterValue] = useState("All");

    const filteredRows = useMemo(() => {
        return rows.filter((row) => {
            const hit = Object.values(row).join(" ").toLowerCase().includes(query.toLowerCase());
            if (!filterBy || filterValue === "All") return hit;
            return hit && row[filterBy.key] === filterValue;
        });
    }, [rows, query, filterBy, filterValue]);


    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
                <div className="flex flex-1 items-center gap-2">
                    <div className="relative max-w-sm flex-1">
                        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="h-9 w-full rounded-md border border-indigo-100 bg-white py-1 pl-9 pr-3 text-sm shadow-xs outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                            placeholder={`Search ${title?.toLowerCase() || "records"}...`}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5 border border-indigo-100 bg-white shadow-xs hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
                    >
                        <Download className="h-4 w-4" />
                        <span className="hidden sm:inline">Export</span>
                    </Button>
                    {filterBy ? (
                        <select
                            value={filterValue}
                            onChange={(e) => setFilterValue(e.target.value)}
                            className="h-8 rounded-md border border-indigo-100 bg-white px-3 text-sm shadow-xs outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        >
                            <option value="All">All {filterBy.label}</option>
                            {filterBy.options.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    ) : null}
                </div>
            </div>

            <div className="hidden rounded-md border border-indigo-100 dark:border-slate-700 md:block">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-[#edf3ff] text-left text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            <tr className="border-b dark:border-slate-700">
                                {columns.map((c) => (
                                    <th key={c.key} className="px-2 py-4">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-auto gap-1 px-1 py-0.5 font-normal text-inherit shadow-none hover:bg-transparent focus-visible:ring-0 dark:hover:bg-transparent"
                                        >
                                            {c.label}
                                            <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
                                        </Button>
                                    </th>
                                ))}
                                <th className="w-12 px-2 py-2 text-right">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRows.map((row, idx) => (
                                <tr key={idx} className="border-t border-indigo-100 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/70">
                                    {columns.map((c) => (
                                        <td key={c.key} className="px-2 py-2 text-slate-700 dark:text-slate-200">
                                            {c.key.toLowerCase().includes("status") ? (
                                                <Badge variant={statusToBadgeVariant(row[c.key] || "")} size="sm">
                                                    {row[c.key] || "-"}
                                                </Badge>
                                            ) : (
                                                row[c.key] || "-"
                                            )}
                                        </td>
                                    ))}
                                    <td className="px-2 py-2 text-right">
                                        <IconActionButton
                                            tone="permission"
                                            type="button"
                                            className="h-7 w-7 min-w-7"
                                            title="Row actions"
                                            aria-label="Row actions"
                                        >
                                            <Ellipsis className="h-4 w-4" />
                                        </IconActionButton>
                                    </td>
                                </tr>
                            ))}
                            {!filteredRows.length ? (
                                <tr>
                                    <td colSpan={columns.length + 2} className="px-3 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                                        No records found.
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="space-y-3 md:hidden">
                {filteredRows.map((row, idx) => (
                    <div key={idx} className="rounded-lg border border-indigo-100 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                        <div className="mb-3 flex items-center justify-between">
                            <div className="font-mono text-sm font-semibold">{Object.values(row)[0]}</div>
                            <IconActionButton
                                tone="permission"
                                type="button"
                                className="h-7 w-7 min-w-7"
                                title="Row actions"
                                aria-label="Row actions"
                            >
                                <Ellipsis className="h-4 w-4" />
                            </IconActionButton>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            {columns.map((c) => (
                                <div key={c.key}>
                                    <p className="text-xs text-slate-500">{c.label}</p>
                                    <div className="mt-1 text-slate-800 dark:text-slate-200">
                                        {c.key.toLowerCase().includes("status") ? (
                                            <Badge variant={statusToBadgeVariant(row[c.key] || "")} size="sm">
                                                {row[c.key] || "-"}
                                            </Badge>
                                        ) : (
                                            row[c.key] || "-"
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                {!filteredRows.length ? (
                    <div className="rounded-lg border border-indigo-100 bg-white p-4 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                        No records found.
                    </div>
                ) : null}
            </div>

            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <div className="text-sm text-slate-500 dark:text-slate-400">
                    Showing 1-{Math.min(filteredRows.length, 10)} of {filteredRows.length} results
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500 dark:text-slate-400">Rows</span>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1 border border-indigo-100 bg-white px-3 dark:border-slate-700 dark:bg-slate-800"
                        >
                            10
                            <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button type="button" variant="ghost" size="sm" className="h-8 border border-indigo-100 bg-white dark:border-slate-700 dark:bg-slate-800" disabled>
                            Previous
                        </Button>
                        <Button type="button" variant="primary" size="sm" className="h-8 min-w-8 px-3">
                            1
                        </Button>
                        <Button type="button" variant="ghost" size="sm" className="h-8 min-w-8 border border-indigo-100 bg-white dark:border-slate-700 dark:bg-slate-800">
                            2
                        </Button>
                        <Button type="button" variant="ghost" size="sm" className="h-8 border border-indigo-100 bg-white dark:border-slate-700 dark:bg-slate-800">
                            Next
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
