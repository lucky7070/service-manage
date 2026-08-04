"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "@/components/ui/Image";
import { debounce } from "lodash";
import moment from "moment";
import Link from "next/link";
import { ArrowLeft, ImageIcon } from "lucide-react";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AxiosHelperAdmin from "@/helpers/AxiosHelperAdmin";
import { Badge, Button, Input } from "@/components/ui";
import AdminPagination from "@/components/admin/AdminPagination";
import { resolveFileUrl } from "@/helpers/utils";
import AdminTableHeader from "@/components/admin/AdminTableHeader";
import AdminNoTableRecords from "@/components/admin/AdminNoTableRecords";
import { ProfileStatus } from "@/config";

type DeletedServiceProvider = {
    _id: string;
    userId?: string;
    name: string;
    mobile: string;
    email?: string;
    cityName?: string;
    serviceCategoryName?: string;
    profileStatus?: ProfileStatus;
    image?: string | null;
    createdAt?: string;
    deletedAt?: string;
};

type DeletedServiceProviderRecord = {
    count: number;
    record: DeletedServiceProvider[];
    totalPages: number;
    pagination: number[];
};

type SortBy = "name" | "mobile" | "email" | "userId" | "profileStatus" | "createdAt" | "deletedAt";
type SortOrder = "asc" | "desc";

export default function AdminDeletedServiceProvidersPage() {
    const debouncedFetchRef = useRef(debounce(() => { }, 0));
    const [data, setData] = useState<DeletedServiceProviderRecord>({ count: 0, record: [], totalPages: 0, pagination: [] });
    const [param, setParam] = useState<{ limit: number; pageNo: number; query: string; sortBy: SortBy; sortOrder: SortOrder; deleted: 1 }>({
        limit: 10,
        pageNo: 1,
        query: "",
        sortBy: "deletedAt",
        sortOrder: "desc",
        deleted: 1,
    });

    const fetchRows = useCallback(async () => {
        const { data: res } = await AxiosHelperAdmin.getData("/service-providers", param);
        if (res.status && res.data) {
            const { count, totalPages, record, pagination } = res.data;
            setData({ count, totalPages, record, pagination });
        } else {
            setData({ count: 0, totalPages: 0, record: [], pagination: [] });
        }
    }, [param]);

    useEffect(() => {
        debouncedFetchRef.current = debounce(() => { fetchRows(); }, 500);
    }, [fetchRows]);

    useEffect(() => {
        debouncedFetchRef.current();
        return () => { debouncedFetchRef.current.cancel(); };
    }, [param]);

    const onSort = (nextSortBy: SortBy) => {
        setParam((prev) => {
            const nextOrder: SortOrder = prev.sortBy === nextSortBy ? (prev.sortOrder === "asc" ? "desc" : "asc") : "asc";
            return { ...prev, pageNo: 1, sortBy: nextSortBy, sortOrder: nextOrder };
        });
    };

    return (
        <section className="space-y-4">
            <AdminPageHeader
                title="Deleted service providers"
                subtitle="Soft-deleted providers for reference. This list is view-only."
                action={
                    <Link href="/admin/service-providers">
                        <Button type="button" variant="secondary" size="md">
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Back to providers
                        </Button>
                    </Link>
                }
            />

            <div className="rounded-2xl border border-indigo-100 bg-white p-4 dark:border-indigo-100 dark:bg-slate-900">
                <div className="mb-3 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                    <Input
                        value={param.query}
                        onChange={(e) => setParam((prev) => ({ ...prev, pageNo: 1, query: e.target.value }))}
                        className="max-w-xs"
                        placeholder="Search name, mobile, email, user ID, PAN..."
                    />
                    <div className="text-sm text-slate-500 dark:text-slate-400">Total: {data.count}</div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-[#edf3ff] text-left text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            <tr>
                                <th className="w-14 px-3 py-2"></th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("userId")} name="User ID" active={param.sortBy === "userId"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("name")} name="Name" active={param.sortBy === "name"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("mobile")} name="Mobile" active={param.sortBy === "mobile"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2">City</th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("profileStatus")} name="Profile status" active={param.sortBy === "profileStatus"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("createdAt")} name="Created" active={param.sortBy === "createdAt"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("deletedAt")} name="Deleted" active={param.sortBy === "deletedAt"} sortOrder={param.sortOrder} />
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.record.map((row) => {
                                const thumb = resolveFileUrl(row.image);
                                return (
                                    <tr key={row._id} className="border-t border-indigo-100 dark:border-slate-700">
                                        <td className="px-3 py-2 align-middle">
                                            <div className="relative h-9 w-9 overflow-hidden rounded-full border border-indigo-100 bg-slate-100 dark:border-slate-600 dark:bg-slate-800">
                                                {thumb ? (
                                                    <Image src={thumb} alt="" className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-slate-400">
                                                        <ImageIcon className="h-4 w-4" />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.userId || "—"}</td>
                                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                            <div>{row.name}</div>
                                            <div className="text-xs text-slate-500">{row.email || "—"}</div>
                                        </td>
                                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.mobile}</td>
                                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                            <div>{row.cityName || "—"}</div>
                                            <div className="text-xs text-slate-500">{row.serviceCategoryName || "—"}</div>
                                        </td>
                                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                            <Badge variant="secondary" size="sm" className="capitalize">
                                                {row.profileStatus || "—"}
                                            </Badge>
                                        </td>
                                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.createdAt ? moment(row.createdAt).format("DD-MM-YYYY") : "—"}</td>
                                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.deletedAt ? moment(row.deletedAt).format("DD-MM-YYYY HH:mm") : "—"}</td>
                                    </tr>
                                );
                            })}

                            <AdminNoTableRecords show={data.record.length === 0} />
                        </tbody>
                    </table>
                </div>

                <AdminPagination data={data} param={param} setParam={setParam} />
            </div>
        </section>
    );
}
