"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { debounce } from "lodash";
import moment from "moment";
import { Ban, Loader2, UserPlus } from "lucide-react";
import { toast } from "react-toastify";
import Swal from "sweetalert2/dist/sweetalert2.js";
import AdminNoTableRecords from "@/components/admin/AdminNoTableRecords";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminTableHeader from "@/components/admin/AdminTableHeader";
import AxiosHelperAdmin from "@/helpers/AxiosHelperAdmin";
import { getSweetAlertConfig } from "@/helpers/utils";
import type { SelectOption } from "@/components/ui/AsyncSelect";
import ReactSelect from "@/components/ui/ReactSelect";
import { Badge, Button, Input, Label, Modal, Option, Select } from "@/components/ui";

type LeadRow = {
    _id: string;
    leadNumber: string;
    cityId: string;
    serviceCategoryId: string;
    customerName: string;
    customerMobile: string;
    cityName: string;
    serviceCategoryName: string;
    status: string;
    scheduledTime?: string;
    issueDescription?: string;
    assignedProviderName?: string;
    bookingId?: string | null;
    createdAt?: string;
    assignedAt?: string;
};

type ProviderOption = { _id: string; name: string; mobile?: string; isVerified?: boolean };

type LeadRecord = {
    count: number;
    record: LeadRow[];
    totalPages: number;
    pagination: number[];
};

const statuses = ["open", "assigned", "cancelled"];

type SortBy = "leadNumber" | "customerName" | "cityName" | "serviceCategoryName" | "status" | "createdAt" | "scheduledTime" | "assignedAt";
type SortOrder = "asc" | "desc";

export default function AdminServiceLeadsPage() {
    const router = useRouter();
    const debouncedFetchRef = useRef(debounce(() => { }, 0));
    const [data, setData] = useState<LeadRecord>({ count: 0, record: [], totalPages: 0, pagination: [] });
    const [param, setParam] = useState<{
        limit: number;
        pageNo: number;
        query: string;
        status: string;
        sortBy: SortBy;
        sortOrder: SortOrder;
    }>({ limit: 10, pageNo: 1, query: "", status: "", sortBy: "createdAt", sortOrder: "desc" });

    const [assignOpen, setAssignOpen] = useState(false);
    const [assignLead, setAssignLead] = useState<LeadRow | null>(null);
    const [providers, setProviders] = useState<ProviderOption[]>([]);
    const [loadingProviders, setLoadingProviders] = useState(false);
    const [providerId, setProviderId] = useState("");
    const [assigning, setAssigning] = useState(false);
    const [cancellingId, setCancellingId] = useState<string | null>(null);

    const providerOptions: SelectOption[] = useMemo(() => providers.map((p) => ({ value: p._id, label: `${p.name}${p.mobile ? ` (${p.mobile})` : ""}`, })), [providers]);
    const providerSelectValue = useMemo(() => providerOptions.find((o) => o.value === providerId) ?? null, [providerOptions, providerId]);

    const fetchLeads = useCallback(async () => {
        const { data: res } = await AxiosHelperAdmin.getData("/service-leads", param);
        if (res.status && res.data) {
            const { count, totalPages, record, pagination } = res.data;
            setData({ count, totalPages, record, pagination });
        } else {
            setData({ count: 0, totalPages: 0, record: [], pagination: [] });
        }
    }, [param]);

    useEffect(() => {
        debouncedFetchRef.current = debounce(() => { void fetchLeads(); }, 500);
    }, [fetchLeads]);

    useEffect(() => {
        debouncedFetchRef.current();
        return () => { debouncedFetchRef.current.cancel(); };
    }, [param]);

    const openAssign = async (row: LeadRow) => {
        setAssignLead(row);
        setProviderId("");
        setAssignOpen(true);
        setLoadingProviders(true);
        const { data: res } = await AxiosHelperAdmin.getData("/service-providers", {
            cityId: String(row.cityId),
            serviceCategoryId: String(row.serviceCategoryId),
            profileStatus: "approved",
            limit: 100,
            pageNo: 1,
        });
        if (res.status && res.data?.record) {
            const rows = (res.data.record as ProviderOption[]).filter((p) => p.isVerified !== false);
            setProviders(rows);
            if (!rows.length) toast.info("No approved providers match this city and category.");
        } else {
            setProviders([]);
        }
        setLoadingProviders(false);
    };

    const submitAssign = async () => {
        if (!assignLead || !providerId) {
            toast.error("Select a service provider.");
            return;
        }
        setAssigning(true);
        const { data: res } = await AxiosHelperAdmin.putData(`/service-leads/${assignLead._id}/assign`, { providerId });
        if (res.status) {
            toast.success(res.message || "Assigned.");
            setAssignOpen(false);
            setAssignLead(null);
            void fetchLeads();
            const bid = res.data?.bookingId;
            if (bid) {
                router.push(`/admin/bookings/${bid}`);
            }
        } else {
            toast.error(res.message || "Assignment failed.");
        }
        setAssigning(false);
    };

    const confirmCancelLead = async (row: LeadRow) => {
        const { isConfirmed } = await Swal.fire(getSweetAlertConfig({
            title: "Cancel this lead?",
            text: `Lead "${row.leadNumber}" will be marked as cancelled. Assigned leads must be handled via the booking instead.`,
            confirmButtonText: "Yes, Cancel Lead",
            icon: "warning",
        }));
        if (!isConfirmed) return;

        setCancellingId(row._id);
        const { data: res } = await AxiosHelperAdmin.putData(`/service-leads/${row._id}/cancel`, {});
        if (res.status) {
            toast.success(res.message || "Lead cancelled.");
            void fetchLeads();
        } else {
            toast.error(res.message || "Could not cancel lead.");
        }

        setCancellingId(null);
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
                title="Booking leads"
                subtitle="Customer requests without a chosen provider. Assign a verified professional to create a booking."
            />

            <div className="rounded-2xl border border-indigo-100 bg-white p-4 dark:border-indigo-100 dark:bg-slate-900">
                <div className="mb-3 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                    <Input
                        value={param.query}
                        onChange={(e) => setParam((prev) => ({ ...prev, pageNo: 1, query: e.target.value }))}
                        className="max-w-xs"
                        placeholder="Search lead # or description…"
                    />
                    <Select
                        value={param.status}
                        onChange={(e) => setParam((prev) => ({ ...prev, pageNo: 1, status: e.target.value }))}
                        className="max-w-[200px]"
                    >
                        <Option value="">All statuses</Option>
                        {statuses.map((s) => <Option key={s} value={s}>{s}</Option>)}
                    </Select>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-[#edf3ff] text-left text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            <tr>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("createdAt")} name="Lead" active={param.sortBy === "createdAt"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("customerName")} name="Customer" active={param.sortBy === "customerName"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("cityName")} name="City" active={param.sortBy === "cityName"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("serviceCategoryName")} name="Service category" active={param.sortBy === "serviceCategoryName"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("scheduledTime")} name="Scheduled time" active={param.sortBy === "scheduledTime"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("status")} name="Status" active={param.sortBy === "status"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.record.map((row) => (
                                <tr key={row._id} className="border-t border-indigo-100 dark:border-slate-700">
                                    <td className="px-3 py-2">
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">{row.leadNumber}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{row.createdAt ? moment(row.createdAt).format("DD-MM-YYYY hh:mm A") : "—"}</p>
                                    </td>
                                    <td className="px-3 py-2">
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">{row.customerName || "—"}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{row.customerMobile || ""}</p>
                                    </td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.cityName || "—"}</td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.serviceCategoryName || "—"}</td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.scheduledTime ? moment(row.scheduledTime).format("DD-MM-YYYY hh:mm A") : "—"}</td>
                                    <td className="px-3 py-2">
                                        <Badge variant={row.status === "open" ? "warning" : row.status === "assigned" ? "success" : "secondary"} size="sm" className="capitalize">
                                            {row.status}
                                        </Badge>
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                        {row.status === "open" ? (
                                            <div className="flex flex-wrap items-center justify-end gap-1">
                                                <Button type="button" variant="ghost" size="sm" onClick={() => void openAssign(row)}>
                                                    <UserPlus className="h-4 w-4" /> Assign
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300"
                                                    disabled={cancellingId === row._id}
                                                    onClick={() => void confirmCancelLead(row)}
                                                >
                                                    {cancellingId === row._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Ban className="h-4 w-4" /> Cancel</>}
                                                </Button>
                                            </div>
                                        ) : row.bookingId ? (
                                            <Link href={`/admin/bookings/${row.bookingId}`}>
                                                <Button type="button" variant="ghost" size="sm">View booking</Button>
                                            </Link>
                                        ) : (
                                            "—"
                                        )}
                                    </td>
                                </tr>
                            ))}
                            <AdminNoTableRecords show={data.record.length === 0} colSpan={7} />
                        </tbody>
                    </table>
                </div>

                <AdminPagination
                    data={{ count: data.count, totalPages: data.totalPages, pagination: data.pagination }}
                    param={param}
                    setParam={setParam}
                />
            </div>

            <Modal
                show={assignOpen}
                onClose={() => { if (!assigning) setAssignOpen(false); }}
                title="Assign provider"
                subTitle={assignLead ? `Lead ${assignLead.leadNumber} — provider must offer all requested service types.` : ""}
                size="md"
                disableBackdropClose={assigning}
            >
                <div className="space-y-4">
                    {loadingProviders ? (
                        <p className="flex items-center gap-2 text-sm text-slate-600">
                            <Loader2 className="h-4 w-4 animate-spin" /> Loading providers…
                        </p>
                    ) : (
                        <div className="space-y-2">
                            <Label htmlFor="assign-service-lead-provider">Service provider</Label>
                            <ReactSelect
                                inputId="assign-service-lead-provider"
                                instanceId={`assign-provider-${assignLead?._id ?? "new"}`}
                                options={providerOptions}
                                placeholder="Search provider by name or mobile…"
                                value={providerSelectValue}
                                onChange={(opt) => setProviderId(opt?.value ?? "")}
                                isDisabled={assigning}
                                isLoading={loadingProviders}
                                isSearchable
                                isClearable
                                menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                                menuPosition="fixed"
                            />
                        </div>
                    )}
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => setAssignOpen(false)} disabled={assigning}>Cancel</Button>
                        <Button type="button" onClick={() => void submitAssign()} disabled={assigning || !providerId || loadingProviders}>
                            {assigning ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create booking"}
                        </Button>
                    </div>
                </div>
            </Modal>
        </section>
    );
}
