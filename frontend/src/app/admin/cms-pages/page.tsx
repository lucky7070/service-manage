"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { debounce } from "lodash";
import moment from "moment";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { Pencil, Plus, Trash2 } from "lucide-react";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AxiosHelperAdmin from "@/helpers/AxiosHelperAdmin";
import { Button, Input } from "@/components/ui";
import AdminPagination from "@/components/admin/AdminPagination";
import { getSweetAlertConfig } from "@/helpers/utils";
import AdminTableHeader from "@/components/admin/AdminTableHeader";
import PermissionBlock from "@/components/admin/PermissionBlock";
import AdminNoTableRecords from "@/components/admin/AdminNoTableRecords";

type CmsPageRow = {
    _id: string;
    pageSlug: string;
    pageTitle: string;
    pageTitleHi?: string | null;
    metaDescription?: string | null;
    metaKeywords?: string | null;
    content?: string | null;
    contentHi?: string | null;
    viewCount: number;
    createdAt?: string;
    updatedAt?: string;
};

type CmsPageRecord = {
    count: number;
    record: CmsPageRow[];
    totalPages: number;
    pagination: number[];
};

type SortBy = "pageTitle" | "pageSlug" | "viewCount" | "createdAt" | "updatedAt";
type SortOrder = "asc" | "desc";

export default function AdminCmsPagesPage() {
    const debouncedFetchRef = useRef(debounce(() => { }, 0));
    const [data, setData] = useState<CmsPageRecord>({ count: 0, record: [], totalPages: 0, pagination: [] });
    const [param, setParam] = useState<{ limit: number; pageNo: number; query: string; sortBy: SortBy; sortOrder: SortOrder; }>({ limit: 10, pageNo: 1, query: "", sortBy: "updatedAt", sortOrder: "desc" });

    const fetchCmsPages = useCallback(async () => {
        const { data } = await AxiosHelperAdmin.getData("/cms-pages", param);
        if (data.status && data.data) {
            const { count, totalPages, record, pagination } = data.data;
            setData({ count, totalPages, record, pagination });
        } else {
            setData({ count: 0, totalPages: 0, record: [], pagination: [] });
        }
    }, [param]);

    useEffect(() => {
        debouncedFetchRef.current = debounce(() => { fetchCmsPages(); }, 500);
    }, [fetchCmsPages]);

    useEffect(() => {
        debouncedFetchRef.current();
        return () => { debouncedFetchRef.current.cancel(); };
    }, [param]);

    const handleDelete = async (id: string) => {
        const { isConfirmed } = await Swal.fire(getSweetAlertConfig({}));
        if (isConfirmed) {
            const { data } = await AxiosHelperAdmin.deleteData(`/cms-pages/${id}`);
            if (data.status) {
                toast.success(data.message);
                fetchCmsPages();
            } else {
                toast.error(data?.message);
            }
        }
    };

    const onSort = (nextSortBy: SortBy) => {
        setParam((prev) => {
            const nextOrder: SortOrder = prev.sortBy === nextSortBy ? (prev.sortOrder === "asc" ? "desc" : "asc") : "asc";
            return { ...prev, pageNo: 1, sortBy: nextSortBy, sortOrder: nextOrder };
        });
    };

    return (
        <section className="space-y-4">
            <AdminPageHeader
                title="CMS Pages"
                subtitle="Create and manage static pages and SEO content."
                action={
                    <PermissionBlock permission_id={411}>
                        <Link href="/admin/cms-pages/create">
                            <Button type="button" variant="primary" size="md">
                                <Plus className="h-3.5 w-3.5" />
                                Create CMS Page
                            </Button>
                        </Link>
                    </PermissionBlock>
                }
            />

            <div className="rounded-2xl border border-indigo-100 bg-white p-4 dark:border-indigo-100 dark:bg-slate-900">
                <div className="mb-3 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                    <Input
                        value={param.query}
                        onChange={(e) => setParam((prev) => ({ ...prev, pageNo: 1, query: e.target.value }))}
                        className="max-w-xs"
                        placeholder="Search title or slug..."
                    />
                    <div className="text-sm text-slate-500 dark:text-slate-400">Total: {data.count}</div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-[#edf3ff] text-left text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            <tr>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("pageTitle")} name="Page Title" active={param.sortBy === "pageTitle"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("pageSlug")} name="Slug" active={param.sortBy === "pageSlug"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("viewCount")} name="Views" active={param.sortBy === "viewCount"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("updatedAt")} name="Updated" active={param.sortBy === "updatedAt"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.record.map((row) => (
                                <tr key={row._id} className="border-t border-indigo-100 dark:border-slate-700">
                                    <td className="max-w-[320px] px-3 py-2 text-slate-700 dark:text-slate-200">{row.pageTitle}</td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.pageSlug}</td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.viewCount ?? 0}</td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.updatedAt ? moment(row.updatedAt).format("DD-MM-YYYY HH:mm") : "—"}</td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                        <div className="flex justify-end gap-1.5 sm:gap-2">
                                            <PermissionBlock permission_id={412}>
                                                <Link href={`/admin/cms-pages/${row._id}/edit`}>
                                                    <Button size="sm" variant="secondary" title="Edit CMS Page" aria-label="Edit CMS Page">
                                                        <Pencil className="h-4 w-4 shrink-0" strokeWidth={2} />
                                                    </Button>
                                                </Link>
                                            </PermissionBlock>
                                            <PermissionBlock permission_id={413}>
                                                <Button size="sm" variant="danger" onClick={() => handleDelete(row._id)} title="Delete CMS Page" aria-label="Delete CMS Page">
                                                    <Trash2 className="h-4 w-4 shrink-0" strokeWidth={2} />
                                                </Button>
                                            </PermissionBlock>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            <AdminNoTableRecords show={data.record.length === 0} />
                        </tbody>
                    </table>
                </div>
                <AdminPagination data={data} param={param} setParam={setParam} />
            </div>
        </section>
    );
}

