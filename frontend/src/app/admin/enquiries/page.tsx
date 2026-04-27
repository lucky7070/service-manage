"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { debounce } from "lodash";
import moment from "moment";
import { toast } from "react-toastify";
import Swal from "sweetalert2/dist/sweetalert2.js";
import { Trash2 } from "lucide-react";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AxiosHelperAdmin from "@/helpers/AxiosHelperAdmin";
import { Badge, Button, Input, Select, Option } from "@/components/ui";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminTableHeader from "@/components/admin/AdminTableHeader";
import PermissionBlock from "@/components/admin/PermissionBlock";
import AdminNoTableRecords from "@/components/admin/AdminNoTableRecords";
import { getSweetAlertConfig } from "@/helpers/utils";

type EnquiryRow = {
    _id: string;
    name: string;
    email: string;
    phone: string;
    subject?: string;
    message: string;
    isResolved?: boolean;
    resolvedAt?: string;
    createdAt?: string;
};

type EnquiryRecord = {
    count: number;
    record: EnquiryRow[];
    totalPages: number;
    pagination: number[];
};

type SortBy = "name" | "email" | "phone" | "subject" | "isResolved" | "createdAt";
type SortOrder = "asc" | "desc";

export default function AdminEnquiriesPage() {
    const debouncedFetchRef = useRef(debounce(() => { }, 0));
    const [data, setData] = useState<EnquiryRecord>({ count: 0, record: [], totalPages: 0, pagination: [] });
    const [param, setParam] = useState<{ limit: number; pageNo: number; query: string; isResolved: "" | 0 | 1; sortBy: SortBy; sortOrder: SortOrder; }>({ limit: 10, pageNo: 1, query: "", isResolved: "", sortBy: "createdAt", sortOrder: "desc" });

    const fetchEnquiries = useCallback(async () => {
        const { data } = await AxiosHelperAdmin.getData("/enquiries", param);
        if (data.status && data.data) {
            const { count, totalPages, record, pagination } = data.data;
            setData({ count, totalPages, record, pagination });
        } else {
            setData({ count: 0, totalPages: 0, record: [], pagination: [] });
        }
    }, [param]);

    useEffect(() => {
        debouncedFetchRef.current = debounce(() => { fetchEnquiries(); }, 500);
    }, [fetchEnquiries]);

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

    const handleResolveToggle = async (row: EnquiryRow, nextResolved: boolean) => {
        const { data } = await AxiosHelperAdmin.putData(`/enquiries/${row._id}/resolve`, { isResolved: nextResolved ? 1 : 0 });
        if (data.status) {
            toast.success(data.message || "Updated.");
            fetchEnquiries();
        } else {
            toast.error(data?.message || "Could not update enquiry.");
        }
    };

    const handleDelete = async (id: string) => {
        const { isConfirmed } = await Swal.fire(getSweetAlertConfig({}));
        if (!isConfirmed) return;
        const { data } = await AxiosHelperAdmin.deleteData(`/enquiries/${id}`);
        if (data?.status) {
            toast.success(data.message || "Deleted.");
            fetchEnquiries();
        } else {
            toast.error(data?.message || "Could not delete enquiry.");
        }
    };

    return (
        <section className="space-y-4">
            <AdminPageHeader
                title="Enquiries"
                subtitle="Incoming enquiry list. Newest entries appear first by default."
            />

            <div className="rounded-2xl border border-indigo-100 bg-white p-4 dark:border-indigo-100 dark:bg-slate-900">
                <div className="mb-3 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                    <Input
                        value={param.query}
                        onChange={(e) => setParam((prev) => ({ ...prev, pageNo: 1, query: e.target.value }))}
                        className="max-w-xs"
                        placeholder="Search name, email, phone, subject..."
                    />
                    <div className="flex flex-wrap items-center gap-2">
                        <Select
                            value={param.isResolved}
                            onChange={(e) => {
                                const v = e.target.value;
                                setParam((prev) => ({ ...prev, pageNo: 1, isResolved: v === "" ? "" : (Number(v) as 0 | 1) }));
                            }}
                            className="max-w-[180px]"
                        >
                            <Option value="">All</Option>
                            <Option value={0}>Pending</Option>
                            <Option value={1}>Resolved</Option>
                        </Select>
                        <div className="text-sm text-slate-500 dark:text-slate-400">Total: {data.count}</div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-[#edf3ff] text-left text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            <tr>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("name")} name="Name" active={param.sortBy === "name"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("email")} name="Email" active={param.sortBy === "email"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("phone")} name="Phone" active={param.sortBy === "phone"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("subject")} name="Subject" active={param.sortBy === "subject"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2">Message</th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("isResolved")} name="Status" active={param.sortBy === "isResolved"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("createdAt")} name="Created" active={param.sortBy === "createdAt"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.record.map((row) => (
                                <tr key={row._id} className="border-t border-indigo-100 dark:border-slate-700">
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.name || "—"}</td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.email || "—"}</td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.phone || "—"}</td>
                                    <td className="max-w-[200px] px-3 py-2 text-slate-700 dark:text-slate-200">
                                        <span className="line-clamp-2">{row.subject || "—"}</span>
                                    </td>
                                    <td className="max-w-[460px] px-3 py-2 text-slate-700 dark:text-slate-200">
                                        <span className="line-clamp-2">{row.message || "—"}</span>
                                    </td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                        <Badge variant={row.isResolved ? "success" : "warning"} size="sm">
                                            {row.isResolved ? "Resolved" : "Pending"}
                                        </Badge>
                                    </td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.createdAt ? moment(row.createdAt).format("DD-MM-YYYY HH:mm") : "—"}</td>
                                    <td className="px-3 py-2">
                                        <div className="flex justify-end gap-2">
                                            <PermissionBlock permission_id={402}>
                                                <Button
                                                    size="sm"
                                                    variant={row.isResolved ? "secondary" : "success"}
                                                    onClick={() => handleResolveToggle(row, !row.isResolved)}
                                                >
                                                    {row.isResolved ? "Mark Pending" : "Mark Resolved"}
                                                </Button>
                                            </PermissionBlock>
                                            <PermissionBlock permission_id={403}>
                                                <Button
                                                    size="sm"
                                                    variant="danger"
                                                    onClick={() => handleDelete(row._id)}
                                                    title="Delete enquiry"
                                                    aria-label="Delete enquiry"
                                                >
                                                    <Trash2 className="h-4 w-4 shrink-0" strokeWidth={2} />
                                                </Button>
                                            </PermissionBlock>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            <AdminNoTableRecords show={!data.record.length} />
                        </tbody>
                    </table>
                </div>

                <AdminPagination data={data} param={param} setParam={setParam} />
            </div>
        </section>
    );
}

