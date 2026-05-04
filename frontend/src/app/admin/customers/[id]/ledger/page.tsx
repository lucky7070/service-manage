"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { debounce } from "lodash";
import moment from "moment";
import * as Yup from "yup";
import { ArrowLeftIcon, Plus, WalletCards } from "lucide-react";
import { toast } from "react-toastify";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminNoTableRecords from "@/components/admin/AdminNoTableRecords";
import AdminPagination from "@/components/admin/AdminPagination";
import PermissionBlock from "@/components/admin/PermissionBlock";
import AxiosHelperAdmin from "@/helpers/AxiosHelperAdmin";
import { Badge, Button, Input, Label, Modal, Option, Select, Textarea } from "@/components/ui";

type LedgerRow = {
    _id: string;
    voucherNo: string;
    amount: number;
    currentBalance: number;
    updatedBalance: number;
    paymentType: 1 | 2;
    paymentMethod: 1 | 2 | 3 | 4 | 5 | 6;
    particulars?: string | null;
    paidByName?: string;
    createdAt?: string;
};

type LedgerRecord = {
    count: number;
    record: LedgerRow[];
    totalPages: number;
    pagination: number[];
};

type CustomerInfo = {
    _id: string;
    userId?: string;
    name: string;
    mobile: string;
    balance: number;
    email?: string;
};

type FormValues = {
    paymentType: 1 | 2;
    amount: string;
    particulars: string;
};

const validationSchema = Yup.object().shape({
    paymentType: Yup.number().oneOf([1, 2]).required("Payment type is required."),
    amount: Yup.number().typeError("Amount must be numeric.").min(0.01, "Amount must be greater than 0.").max(1000000, "Amount must be less than 1000000.").required("Amount is required."),
    particulars: Yup.string().trim().max(200, "Particulars is too long.").required("Particulars is required.")
});

export default function CustomerLedgerPage() {

    const router = useRouter();
    const { id: customerId } = useParams();

    const debouncedFetchRef = useRef(debounce(() => { }, 0));
    const [open, setOpen] = useState(false);
    const [customer, setCustomer] = useState<CustomerInfo>({ _id: "", name: "", mobile: "", balance: 0 });
    const [data, setData] = useState<LedgerRecord>({ count: 0, record: [], totalPages: 0, pagination: [] });
    const [param, setParam] = useState<{ limit: number; pageNo: number; query: string; paymentType: "" | 1 | 2 }>({ limit: 10, pageNo: 1, query: "", paymentType: "" });

    useEffect(() => {
        const timer = window.setTimeout(async () => {
            const { data } = await AxiosHelperAdmin.getData(`/customers/${customerId}`);
            if (data.status && data.data) {
                setCustomer(data.data);
            } else {
                toast.error(data.message || "Could not load customer.");
                router.push("/admin/customers");
            }
        }, 0);
        return () => window.clearTimeout(timer);
    }, [router, customerId]);

    const fetchLedger = useCallback(async () => {
        if (!customerId) return;

        const { data } = await AxiosHelperAdmin.getData(`/customers/${customerId}/ledger`, param);
        if (data.status && data.data) {
            const { count, totalPages, record, pagination } = data.data;
            setData({ count, totalPages, record, pagination });
        } else {
            setData({ count: 0, totalPages: 0, record: [], pagination: [] });
            toast.error(data.message || "Could not load ledger.");
        }
    }, [customerId, param]);

    useEffect(() => {
        debouncedFetchRef.current = debounce(() => { void fetchLedger(); }, 500);
    }, [fetchLedger]);

    useEffect(() => {
        debouncedFetchRef.current();
        return () => { debouncedFetchRef.current.cancel(); };
    }, [param]);

    return (
        <section className="space-y-4">
            <AdminPageHeader
                title="Customer Ledger"
                subtitle={customer ? <>Manage wallet ledger for <span className="font-medium">{customer.name}</span> ({customer.mobile}).</> : "Manage customer wallet ledger."}
                action={
                    <div className="flex gap-2">
                        <Link href="/admin/customers">
                            <Button type="button" variant="secondary" size="md">
                                <ArrowLeftIcon className="h-4 w-4" /> Go Back
                            </Button>
                        </Link>
                        <PermissionBlock permission_id={339}>
                            <Button type="button" variant="primary" size="md" onClick={() => setOpen(true)}>
                                <Plus className="h-4 w-4" /> Add Entry
                            </Button>
                        </PermissionBlock>
                    </div>
                }
            />

            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-slate-800 dark:text-indigo-300">
                            <WalletCards className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Current Balance</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">₹{Number(customer.balance || 0).toFixed(2)}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Customer ID</p>
                    <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">{customer.userId || "—"}</p>
                </div>
                <div className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Total Entries</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{data.count}</p>
                </div>
            </div>

            <div className="rounded-2xl border border-indigo-100 bg-white p-4 dark:border-indigo-100 dark:bg-slate-900">
                <div className="mb-3 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                    <Input
                        value={param.query}
                        onChange={(e) => setParam((prev) => ({ ...prev, pageNo: 1, query: e.target.value }))}
                        className="max-w-xs"
                        placeholder="Search voucher or particulars..."
                    />
                    <div className="flex items-center gap-2">
                        <Select
                            value={param.paymentType}
                            onChange={(e) => {
                                const v = e.target.value;
                                setParam((prev) => ({ ...prev, pageNo: 1, paymentType: v === "" ? "" : (Number(v) as 1 | 2) }));
                            }}
                            className="max-w-[180px]"
                        >
                            <Option value="">All</Option>
                            <Option value={1}>Credit</Option>
                            <Option value={2}>Debit</Option>
                        </Select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-[#edf3ff] text-left text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            <tr>
                                <th className="px-3 py-2">Voucher</th>
                                <th className="px-3 py-2">Type</th>
                                <th className="px-3 py-2">Amount</th>
                                <th className="px-3 py-2">Updated Balance</th>
                                <th className="px-3 py-2">Particulars</th>
                                <th className="px-3 py-2">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.record.map((row) => (
                                <tr key={row._id} className="border-t border-indigo-100 dark:border-slate-700">
                                    <td className="px-3 py-2 font-mono text-xs text-slate-700 dark:text-slate-200">{row.voucherNo}</td>
                                    <td className="px-3 py-2">
                                        <Badge variant={row.paymentType === 1 ? "success" : "danger"} size="sm">
                                            {row.paymentType === 1 ? "Credit" : "Debit"}
                                        </Badge>
                                    </td>
                                    <td className={`px-3 py-2 font-semibold ${row.paymentType === 1 ? "text-success-500" : "text-danger-500"}`}>₹{Number(row.amount || 0).toFixed(2)}</td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">₹{Number(row.updatedBalance || 0).toFixed(2)}</td>
                                    <td className="max-w-xs px-3 py-2 text-slate-700 dark:text-slate-200">{row.particulars || "—"}</td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.createdAt ? moment(row.createdAt).format("DD-MM-YYYY hh:mm A") : "—"}</td>
                                </tr>
                            ))}
                            <AdminNoTableRecords show={data.record.length === 0} />
                        </tbody>
                    </table>
                </div>
                <AdminPagination data={data} param={param} setParam={setParam} />
            </div>

            <Modal show={open} onClose={() => setOpen(false)} title="Add Ledger Entry" size="md">
                <Formik<FormValues>
                    initialValues={{ paymentType: 1, amount: "", particulars: "" }}
                    validationSchema={validationSchema}
                    onSubmit={async (values, { setSubmitting, setErrors, resetForm }) => {
                        const { data } = await AxiosHelperAdmin.postData(`/customers/${customerId}/ledger`, values);
                        if (data.status) {
                            toast.success(data.message || "Ledger entry added.");
                            setOpen(false);
                            resetForm();
                            setCustomer(data.data);
                            await fetchLedger();
                        } else {
                            toast.error(data.message || "Could not add ledger entry.");
                            setErrors(data.data || {});
                        }
                        setSubmitting(false);
                    }}
                >
                    {({ isSubmitting }) => (
                        <Form className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="ledger-payment-type">Payment Type</Label>
                                <Field as={Select} id="ledger-payment-type" name="paymentType">
                                    <Option value={1}>Credit</Option>
                                    <Option value={2}>Debit</Option>
                                </Field>
                                <ErrorMessage className="text-xs text-rose-600" name="paymentType" component="small" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ledger-amount">Amount</Label>
                                <Field as={Input} id="ledger-amount" name="amount" type="number" min={0.01} step="0.01" placeholder="0.00" />
                                <ErrorMessage className="text-xs text-rose-600" name="amount" component="small" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ledger-particulars">Particulars</Label>
                                <Field as={Textarea} id="ledger-particulars" name="particulars" rows={3} placeholder="Reason for credit/debit..." />
                                <ErrorMessage className="text-xs text-rose-600" name="particulars" component="small" />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                                <Button type="submit" variant="primary" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Entry"}</Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </Modal>
        </section>
    );
}
