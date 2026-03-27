import type { Dispatch, SetStateAction } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui";

type PaginationData = {
    count: number;
    totalPages: number;
    pagination: number[];
};

export default function AdminPagination<T extends { limit: number; pageNo: number }>({ data, param, setParam }: { data: PaginationData; param: T; setParam: Dispatch<SetStateAction<T>> }) {
    const startRow = data.count === 0 ? 0 : (param.pageNo - 1) * param.limit + 1;
    const endRow = data.count === 0 ? 0 : Math.min(param.pageNo * param.limit, data.count);

    const pages = data.pagination?.length ? data.pagination : Array.from({ length: Math.max(1, data.totalPages || 1) }, (_, i) => i + 1).slice(0, 5);

    return (
        <div className="mt-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="text-sm text-slate-500 dark:text-slate-400">
                Showing {startRow}-{endRow} of {data.count} results
            </div>
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Rows</span>
                    <div className="relative">
                        <select
                            value={param.limit}
                            onChange={(e) => setParam((prev) => ({ ...prev, pageNo: 1, limit: Number(e.target.value) || prev.limit }))}
                            className="h-8 appearance-none rounded-lg border border-indigo-100 bg-white px-8 pl-3 text-xs text-slate-700 shadow-xs outline-none hover:bg-slate-50 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                            aria-label="Rows per page"
                        >
                            {[5, 10, 20, 50].map((n) => (
                                <option key={n} value={n}>
                                    {n}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2 top-2 h-4 w-4 opacity-50" aria-hidden />
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 border border-indigo-100 bg-white dark:border-slate-700 dark:bg-slate-800"
                        disabled={param.pageNo <= 1}
                        onClick={() => setParam((prev) => ({ ...prev, pageNo: Math.max(1, prev.pageNo - 1) }))}
                    >
                        Previous
                    </Button>

                    {pages.map((p) => (
                        <Button
                            key={p}
                            type="button"
                            variant={p === param.pageNo ? "primary" : "ghost"}
                            size="sm"
                            className={
                                p === param.pageNo
                                    ? "h-8 min-w-8 px-3"
                                    : "h-8 min-w-8 border border-indigo-100 bg-white px-3 dark:border-slate-700 dark:bg-slate-800"
                            }
                            onClick={() => setParam((prev) => ({ ...prev, pageNo: p }))}
                        >
                            {p}
                        </Button>
                    ))}

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 border border-indigo-100 bg-white dark:border-slate-700 dark:bg-slate-800"
                        disabled={data.totalPages ? param.pageNo >= data.totalPages : endRow >= data.count}
                        onClick={() => setParam((prev) => ({ ...prev, pageNo: Math.min(data.totalPages || prev.pageNo + 1, prev.pageNo + 1) }))}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}