"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { debounce } from "lodash";
import moment from "moment";
import { RefreshCw } from "lucide-react";
import { toast } from "react-toastify";

import AdminNoTableRecords from "@/components/admin/AdminNoTableRecords";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminPagination from "@/components/admin/AdminPagination";
import AxiosHelperAdmin from "@/helpers/AxiosHelperAdmin";
import { Badge, Button, Input, Modal, Option, Select } from "@/components/ui";
import Loader from "@/components/ui/Loader";

type PurchasedPlanRow = {
    _id: string;
    voucherNo: string;
    providerId: string;
    providerName: string;
    providerMobile: string;
    subscriptionId: string;
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
    paymentGatewayOrderId?: string | null;
    paymentGatewayTransactionId?: string | null;
    paymentGatewayTransactionStatus: "success" | "failed" | "pending";
    paymentGatewayTransactionMessage?: string | null;
    source: "admin" | "self";
    createdAt?: string;
};

type PurchasedPlanRecord = {
    count: number;
    record: PurchasedPlanRow[];
    totalPages: number;
    pagination: number[];
};

type GatewayPaymentDetail = {
    id: string;
    orderId?: string;
    status: string;
    method?: string | null;
    amount: number;
    currency?: string;
    errorCode?: string | null;
    errorDescription?: string | null;
    createdAt?: string | null;
};

type GatewayStatusPayload = {
    assignment: {
        voucherNo?: string;
        paymentAmount?: number;
        paymentGatewayOrderId?: string | null;
        paymentGatewayTransactionId?: string | null;
        paymentGatewayTransactionStatus?: string;
        paymentGatewayTransactionMessage?: string | null;
        status?: string;
    };
    order: {
        id: string;
        status: string;
        amount: number;
        amountPaid: number;
        amountDue: number;
        currency?: string;
        receipt?: string | null;
        attempts?: number;
        createdAt?: string | null;
    };
    latestPayment: GatewayPaymentDetail | null;
    payments: GatewayPaymentDetail[];
};

const paymentStatuses = ["success", "failed", "pending"] as const;
const planStatuses = ["active", "inactive"] as const;

function formatBilling(interval: string, count: number) {
    const unit = count === 1 ? interval : `${interval}s`;
    return `${count} ${unit}`;
}

function paymentStatusVariant(status: PurchasedPlanRow["paymentGatewayTransactionStatus"]) {
    if (status === "success") return "success" as const;
    if (status === "failed") return "danger" as const;
    return "warning" as const;
}

export default function PurchasedPlansPage() {
    const debouncedFetchRef = useRef(debounce(() => { }, 0));
    const [data, setData] = useState<PurchasedPlanRecord>({ count: 0, record: [], totalPages: 0, pagination: [] });
    const [gatewayModalOpen, setGatewayModalOpen] = useState(false);
    const [gatewayLoading, setGatewayLoading] = useState(false);
    const [gatewayRow, setGatewayRow] = useState<PurchasedPlanRow | null>(null);
    const [gatewayData, setGatewayData] = useState<GatewayStatusPayload | null>(null);
    const [param, setParam] = useState({
        limit: 10,
        pageNo: 1,
        query: "",
        paymentStatus: "",
        status: "",
        source: "",
    });

    const fetchRows = useCallback(async () => {
        const { data } = await AxiosHelperAdmin.getData("/purchased-plans", param);
        if (data.status && data.data) {
            const { count, totalPages, record, pagination } = data.data;
            setData({ count, totalPages, record, pagination });
        } else {
            setData({ count: 0, totalPages: 0, record: [], pagination: [] });
        }
    }, [param]);

    useEffect(() => {
        debouncedFetchRef.current = debounce(() => { void fetchRows(); }, 500);
    }, [fetchRows]);

    useEffect(() => {
        debouncedFetchRef.current();
        return () => { debouncedFetchRef.current.cancel(); };
    }, [param]);

    const fetchGatewayStatus = useCallback(async (row: PurchasedPlanRow) => {
        setGatewayRow(row);
        setGatewayModalOpen(true);
        setGatewayLoading(true);
        setGatewayData(null);

        const { data } = await AxiosHelperAdmin.getData(`/purchased-plans/${row._id}/gateway-status`);
        if (data.status && data.data) {
            setGatewayData(data.data as GatewayStatusPayload);
        } else {
            toast.error(data.message || "Could not fetch gateway status.");
            setGatewayModalOpen(false);
            setGatewayRow(null);
        }

        setGatewayLoading(false);
    }, []);

    const closeGatewayModal = () => {
        setGatewayModalOpen(false);
        setGatewayRow(null);
        setGatewayData(null);
        setGatewayLoading(false);
    };

    return (
        <section className="space-y-4">
            <AdminPageHeader
                title="Purchased plans"
                subtitle="All provider subscription purchases and payment history across every status."
            />

            <div className="rounded-2xl border border-indigo-100 bg-white p-4 dark:border-indigo-100 dark:bg-slate-900">
                <div className="mb-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                    <Input
                        value={param.query}
                        onChange={(e) => setParam((prev) => ({ ...prev, pageNo: 1, query: e.target.value }))}
                        placeholder="Search voucher, provider, plan, order id..."
                    />
                    <Select
                        value={param.paymentStatus}
                        onChange={(e) => setParam((prev) => ({ ...prev, pageNo: 1, paymentStatus: e.target.value }))}
                    >
                        <Option value="">All payment statuses</Option>
                        {paymentStatuses.map((status) => (
                            <Option key={status} value={status}>{status}</Option>
                        ))}
                    </Select>
                    <Select
                        value={param.status}
                        onChange={(e) => setParam((prev) => ({ ...prev, pageNo: 1, status: e.target.value }))}
                    >
                        <Option value="">All plan statuses</Option>
                        {planStatuses.map((status) => (
                            <Option key={status} value={status}>{status}</Option>
                        ))}
                    </Select>
                    <Select
                        value={param.source}
                        onChange={(e) => setParam((prev) => ({ ...prev, pageNo: 1, source: e.target.value }))}
                    >
                        <Option value="">All sources</Option>
                        <Option value="self">Self purchase</Option>
                        <Option value="admin">Admin assigned</Option>
                    </Select>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-[#edf3ff] text-left text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            <tr>
                                <th className="px-3 py-2">Voucher</th>
                                <th className="px-3 py-2">Provider</th>
                                <th className="px-3 py-2">Plan</th>
                                <th className="px-3 py-2">Period</th>
                                <th className="px-3 py-2">Amount</th>
                                <th className="px-3 py-2">Payment</th>
                                <th className="px-3 py-2">Plan status</th>
                                <th className="px-3 py-2">Source</th>
                                <th className="px-3 py-2">Purchased on</th>
                                <th className="px-3 py-2 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.record.map((row) => (
                                <tr key={row._id} className="border-t border-indigo-100 dark:border-slate-700">
                                    <td className="px-3 py-2 font-semibold text-slate-800 dark:text-slate-100">{row.voucherNo || "—"}</td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                        <p className="font-medium">{row.providerName || "—"}</p>
                                        <p className="text-xs text-slate-500">{row.providerMobile || ""}</p>
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="font-medium text-slate-800 dark:text-slate-100">{row.planName || "—"}</div>
                                        <div className="text-xs text-slate-500">
                                            {row.planCode || "—"} · {formatBilling(row.planInterval, row.planIntervalCount || 1)}
                                        </div>
                                    </td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                        {row.startDate ? moment(row.startDate).format("DD-MM-YYYY") : "—"}
                                        {" → "}
                                        {row.endDate ? moment(row.endDate).format("DD-MM-YYYY") : "—"}
                                    </td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                        <span className="block font-semibold">₹ {Number(row.paymentAmount || 0).toLocaleString("en-IN")}</span>
                                        {row.taxPercentage > 0 ? (
                                            <span className="text-xs text-slate-500">
                                                ₹ {Number(row.amount || 0).toLocaleString("en-IN")} + ₹ {Number(row.taxAmount || 0).toLocaleString("en-IN")} (tax {row.taxPercentage}%)
                                            </span>
                                        ) : null}
                                    </td>
                                    <td className="px-3 py-2">
                                        <Badge variant={paymentStatusVariant(row.paymentGatewayTransactionStatus)} size="sm" className="capitalize">
                                            {row.paymentGatewayTransactionStatus}
                                        </Badge>
                                        {row.paymentGatewayTransactionMessage ? (
                                            <p className="mt-1 max-w-xs text-xs text-slate-500">{row.paymentGatewayTransactionMessage}</p>
                                        ) : null}
                                    </td>
                                    <td className="px-3 py-2">
                                        <Badge variant={row.status === "active" ? "success" : "secondary"} size="sm" className="capitalize">
                                            {row.status}
                                        </Badge>
                                    </td>
                                    <td className="px-3 py-2 capitalize text-slate-700 dark:text-slate-200">{row.source}</td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                        {row.createdAt ? moment(row.createdAt).format("DD-MM-YYYY hh:mm A") : "—"}
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            disabled={!row.paymentGatewayOrderId}
                                            onClick={() => void fetchGatewayStatus(row)}
                                        >
                                            <RefreshCw className="h-4 w-4" />
                                            Gateway
                                        </Button>
                                    </td>
                                </tr>
                            ))}

                            <AdminNoTableRecords show={data.record.length === 0} />
                        </tbody>
                    </table>
                </div>

                <AdminPagination data={data} param={param} setParam={setParam} />
            </div>

            <Modal
                show={gatewayModalOpen}
                onClose={closeGatewayModal}
                title="Payment gateway status"
                subTitle={gatewayRow ? `${gatewayRow.voucherNo || "Purchase"} · ${gatewayRow.providerName || "Provider"}` : undefined}
                size="lg"
                scrollable
            >
                {gatewayLoading ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-8 ">
                        {/* <Loader2 className="h-15 w-15 animate-spin text-purple-400" /> */}
                        <Loader />
                        <p className="text-center text-sm text-slate-500">Fetching live status from Razorpay…</p>
                    </div>
                ) : gatewayData ? (
                    <div className="space-y-5 text-sm">
                        <section className="rounded-xl border border-indigo-100 bg-[#f8faff] p-4 dark:border-slate-700 dark:bg-slate-800/60">
                            <h3 className="mb-3 font-semibold text-slate-800 dark:text-slate-100">Saved in system</h3>
                            <dl className="grid gap-2 sm:grid-cols-2">
                                <div><dt className="text-slate-500">Payment status</dt><dd className="font-medium capitalize">{gatewayData.assignment.paymentGatewayTransactionStatus || "—"}</dd></div>
                                <div><dt className="text-slate-500">Plan status</dt><dd className="font-medium capitalize">{gatewayData.assignment.status || "—"}</dd></div>
                                <div><dt className="text-slate-500">Order ID</dt><dd className="font-mono text-xs">{gatewayData.assignment.paymentGatewayOrderId || "—"}</dd></div>
                                <div><dt className="text-slate-500">Payment ID</dt><dd className="font-mono text-xs">{gatewayData.assignment.paymentGatewayTransactionId || "—"}</dd></div>
                                <div className="sm:col-span-2"><dt className="text-slate-500">Message</dt><dd>{gatewayData.assignment.paymentGatewayTransactionMessage || "—"}</dd></div>
                            </dl>
                        </section>

                        <section className="rounded-xl border border-indigo-100 p-4 dark:border-slate-700">
                            <h3 className="mb-3 font-semibold text-slate-800 dark:text-slate-100">Razorpay order</h3>
                            <dl className="grid gap-2 sm:grid-cols-2">
                                <div><dt className="text-slate-500">Order status</dt><dd className="font-medium capitalize">{gatewayData.order.status}</dd></div>
                                <div><dt className="text-slate-500">Attempts</dt><dd>{gatewayData.order.attempts ?? 0}</dd></div>
                                <div><dt className="text-slate-500">Amount</dt><dd>₹ {Number(gatewayData.order.amount || 0).toLocaleString("en-IN")}</dd></div>
                                <div><dt className="text-slate-500">Amount paid</dt><dd>₹ {Number(gatewayData.order.amountPaid || 0).toLocaleString("en-IN")}</dd></div>
                                <div><dt className="text-slate-500">Amount due</dt><dd>₹ {Number(gatewayData.order.amountDue || 0).toLocaleString("en-IN")}</dd></div>
                                <div><dt className="text-slate-500">Created</dt><dd>{gatewayData.order.createdAt ? moment(gatewayData.order.createdAt).format("DD-MM-YYYY hh:mm A") : "—"}</dd></div>
                                <div className="sm:col-span-2"><dt className="text-slate-500">Receipt</dt><dd className="font-mono text-xs">{gatewayData.order.receipt || "—"}</dd></div>
                            </dl>
                        </section>

                        {gatewayData.latestPayment ? (
                            <section className="rounded-xl border border-indigo-100 p-4 dark:border-slate-700">
                                <h3 className="mb-3 font-semibold text-slate-800 dark:text-slate-100">Latest payment</h3>
                                <dl className="grid gap-2 sm:grid-cols-2">
                                    <div><dt className="text-slate-500">Payment ID</dt><dd className="font-mono text-xs">{gatewayData.latestPayment.id}</dd></div>
                                    <div><dt className="text-slate-500">Status</dt><dd className="font-medium capitalize">{gatewayData.latestPayment.status}</dd></div>
                                    <div><dt className="text-slate-500">Method</dt><dd className="capitalize">{gatewayData.latestPayment.method || "—"}</dd></div>
                                    <div><dt className="text-slate-500">Amount</dt><dd>₹ {Number(gatewayData.latestPayment.amount || 0).toLocaleString("en-IN")}</dd></div>
                                    {gatewayData.latestPayment.errorDescription ? (
                                        <div className="sm:col-span-2"><dt className="text-slate-500">Error</dt><dd className="text-rose-600">{gatewayData.latestPayment.errorDescription}</dd></div>
                                    ) : null}
                                </dl>
                            </section>
                        ) : null}

                        <section className="rounded-xl border border-indigo-100 p-4 dark:border-slate-700">
                            <h3 className="mb-3 font-semibold text-slate-800 dark:text-slate-100">All payment attempts ({gatewayData.payments.length})</h3>
                            {gatewayData.payments.length ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-xs">
                                        <thead className="bg-slate-100 text-left text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                            <tr>
                                                <th className="px-2 py-2">Payment ID</th>
                                                <th className="px-2 py-2">Status</th>
                                                <th className="px-2 py-2">Method</th>
                                                <th className="px-2 py-2">Amount</th>
                                                <th className="px-2 py-2">Created</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {gatewayData.payments.map((payment) => (
                                                <tr key={payment.id} className="border-t border-slate-200 dark:border-slate-700">
                                                    <td className="px-2 py-2 font-mono">{payment.id}</td>
                                                    <td className="px-2 py-2 capitalize">{payment.status}</td>
                                                    <td className="px-2 py-2 capitalize">{payment.method || "—"}</td>
                                                    <td className="px-2 py-2">₹ {Number(payment.amount || 0).toLocaleString("en-IN")}</td>
                                                    <td className="px-2 py-2">{payment.createdAt ? moment(payment.createdAt).format("DD-MM-YYYY hh:mm A") : "—"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-slate-500">No payment attempts found for this order.</p>
                            )}
                        </section>

                        {gatewayRow?.paymentGatewayOrderId ? (
                            <div className="flex justify-end">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    disabled={gatewayLoading}
                                    onClick={() => void fetchGatewayStatus(gatewayRow)}
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Refresh status
                                </Button>
                            </div>
                        ) : null}
                    </div>
                ) : null}
            </Modal>
        </section>
    );
}
