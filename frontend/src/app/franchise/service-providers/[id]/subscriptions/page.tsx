"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";
import moment from "moment";
import { ArrowLeftIcon, Info } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AxiosHelperFranchise from "@/helpers/AxiosHelperFranchise";
import { Badge, Button } from "@/components/ui";
import AdminNoTableRecords from "@/components/admin/AdminNoTableRecords";

type AssignedRow = {
    _id: string;
    voucherNo: string;
    planName: string;
    planCode: string;
    planInterval: string;
    planIntervalCount: number;
    startDate: string;
    endDate: string;
    status: "active" | "inactive";
    amount: number;
    taxPercentage: number;
    taxAmount: number;
    paymentAmount: number;
    assignedBy?: string | null;
    createdAt?: string;
};

function formatBilling(interval: string, count: number) {
    const unit = count === 1 ? interval : `${interval}s`;
    return `${count} ${unit}`;
}

function getAssignmentMeta(row: AssignedRow) {
    const today = moment().startOf("day");
    const start = moment(row.startDate).startOf("day");
    const end = moment(row.endDate).endOf("day");

    if (row.status === "inactive") {
        return { label: "Not paid", variant: "warning" as const, note: "Payment not captured yet." };
    }
    if (start.isAfter(today)) {
        return { label: "Queued", variant: "info" as const, note: "Scheduled to start after the current active plan ends." };
    }
    if (today.isBetween(start, end, null, "[]")) {
        return { label: "Current", variant: "success" as const, note: "Active plan for the provider right now." };
    }
    if (end.isBefore(today)) {
        return { label: "Past", variant: "secondary" as const, note: "Completed assignment period." };
    }
    return { label: "Inactive", variant: "secondary" as const, note: "No longer active." };
}

export default function FranchiseProviderSubscriptionsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [providerName, setProviderName] = useState("");
    const [rows, setRows] = useState<AssignedRow[]>([]);
    const [loading, setLoading] = useState(true);

    const getData = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        const { data } = await AxiosHelperFranchise.getData(`/service-providers/${id}/subscriptions`);
        if (data.status && data.data?.provider) {
            setProviderName(String(data.data.provider.name || ""));
            setRows(Array.isArray(data.data.record) ? data.data.record : []);
            setLoading(false);
        } else {
            setLoading(false);
            toast.error(data.message || "Could not load plan history.");
            router.push("/franchise/service-providers");
        }
    }, [id, router]);

    useEffect(() => { (() => { void getData(); })() }, [getData]);

    return (
        <section className="space-y-4">
            <AdminPageHeader
                title="Plan purchase history"
                subtitle={loading ? "Loading..." : providerName ? <>Subscription history for <span className="font-medium">{providerName}</span>.</> : "Subscription history for this provider."}
                action={
                    <Link href="/franchise/service-providers">
                        <Button type="button" variant="secondary" size="md">
                            <ArrowLeftIcon className="h-4 w-4" /> Go Back
                        </Button>
                    </Link>
                }
            />

            <div className="rounded-2xl border border-indigo-100 bg-[#f8faff] p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
                <div className="flex gap-3">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
                    <p>View-only purchase and assignment history for this franchise-owned provider.</p>
                </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-indigo-100 bg-white p-4 dark:border-indigo-100 dark:bg-slate-900">
                <table className="min-w-full text-sm">
                    <thead className="bg-[#edf3ff] text-left text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        <tr>
                            <th className="px-3 py-2">Voucher</th>
                            <th className="px-3 py-2">Plan</th>
                            <th className="px-3 py-2">Period</th>
                            <th className="px-3 py-2">Assignment</th>
                            <th className="px-3 py-2">Amount</th>
                            <th className="px-3 py-2">Status</th>
                            <th className="px-3 py-2">Purchased On</th>
                            <th className="px-3 py-2">Assign By</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => {
                            const assignment = getAssignmentMeta(row);
                            return (
                                <tr key={row._id} className="border-t border-indigo-100 dark:border-slate-700">
                                    <td className="px-3 py-2 font-semibold text-slate-700 dark:text-slate-200">{row.voucherNo || "—"}</td>
                                    <td className="px-3 py-2">
                                        <div className="font-medium text-slate-800 dark:text-slate-100">{row.planName || "—"}</div>
                                        <div className="text-xs text-slate-500">{row.planCode || "—"} · {formatBilling(row.planInterval, row.planIntervalCount || 1)}</div>
                                    </td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                        {row.startDate ? moment(row.startDate).format("DD-MM-YYYY") : "—"}
                                        {" → "}
                                        {row.endDate ? moment(row.endDate).format("DD-MM-YYYY") : "—"}
                                    </td>
                                    <td className="px-3 py-2">
                                        <Badge variant={assignment.variant} size="sm">{assignment.label}</Badge>
                                        <p className="mt-1 max-w-xs text-xs text-slate-500">{assignment.note}</p>
                                    </td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                        <span className="block font-semibold">₹ {Number(row.paymentAmount || 0).toLocaleString("en-IN")}</span>
                                        {row.taxPercentage > 0 ? (
                                            <span className="text-xs text-slate-500">
                                                ₹ {Number(row.amount || 0).toLocaleString("en-IN")} + {Number(row.taxAmount || 0).toLocaleString("en-IN")} (Tax {row.taxPercentage}%)
                                            </span>
                                        ) : null}
                                    </td>
                                    <td className="px-3 py-2">
                                        <Badge variant={row.status === "active" ? "success" : "secondary"} size="sm" className="capitalize">
                                            {row.status === "active" ? "Active" : "Un Paid"}
                                        </Badge>
                                    </td>
                                    <td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-200">
                                        {row.createdAt ? moment(row.createdAt).format("DD-MM-YYYY hh:mm A") : "—"}
                                    </td>
                                    <td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-200">
                                        {row.assignedBy ? "Admin" : "Self"}
                                    </td>
                                </tr>
                            );
                        })}
                        <AdminNoTableRecords show={!loading && rows.length === 0} />
                    </tbody>
                </table>
            </div>
        </section>
    );
}
