"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";
import moment from "moment";
import { ArrowLeftIcon, Info, Plus } from "lucide-react";
import { ErrorMessage, Form, Formik } from "formik";
import * as Yup from "yup";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AxiosHelperAdmin from "@/helpers/AxiosHelperAdmin";
import { Badge, Button, Label, Modal } from "@/components/ui";
import AsyncSelect, { type SelectOption } from "@/components/ui/AsyncSelect";
import PermissionBlock from "@/components/admin/PermissionBlock";
import AdminNoTableRecords from "@/components/admin/AdminNoTableRecords";
import AxiosHelper from "@/helpers/AxiosHelper";

type AssignedRow = {
    _id: string;
    voucherNo: string;
    subscriptionId: string;
    planName: string;
    planCode: string;
    planPrice: number;
    planInterval: string;
    planIntervalCount: number;
    startDate: string;
    endDate: string;
    status: "active" | "inactive";
    amount: number;
    taxPercentage: number;
    taxAmount: number;
    paymentAmount: number;
    paymentGatewayTransactionStatus: "success" | "failed" | "pending";
    paymentGatewayTransactionMessage: string | null;
    assignedBy?: string | null;
    createdAt?: string;
    source: "admin" | "self";
};

type AssignFormValues = {
    subscriptionId: string;
};

type PlanOption = SelectOption & { price?: number };

const INITIAL_VALUES: AssignFormValues = {
    subscriptionId: "",
};

const assignSchema = Yup.object({
    subscriptionId: Yup.string().trim().required("Select a subscription plan."),
});

function formatBilling(interval: string, count: number) {
    const unit = count === 1 ? interval : `${interval}s`;
    return `${count} ${unit}`;
}

function getAssignmentMeta(row: AssignedRow) {
    const today = moment().startOf("day");
    const start = moment(row.startDate).startOf("day");
    const end = moment(row.endDate).endOf("day");

    if (row.status === "inactive") {
        return {
            label: "Not paid",
            variant: "warning" as const,
            note: "Payment not captured yet.",
        };
    } else {
        if (start.isAfter(today)) {
            return {
                label: "Queued",
                variant: "info" as const,
                note: "Scheduled to start after the current active plan ends.",
            };
        }

        if (today.isBetween(start, end, null, "[]")) {
            return {
                label: "Current",
                variant: "success" as const,
                note: "Active plan for the provider right now.",
            };
        }

        if (end.isBefore(today)) {
            return {
                label: "Past",
                variant: "secondary" as const,
                note: "Completed assignment period.",
            };
        }

        return {
            label: "Inactive",
            variant: "secondary" as const,
            note: "No longer active.",
        };
    }
}

function normalizeApiFormErrors(data: unknown): Record<string, string> {
    if (!data) return {};
    if (Array.isArray(data)) {
        return data.reduce<Record<string, string>>((acc, row) => {
            if (row && typeof row === "object" && "field" in row && "message" in row) {
                const field = String((row as { field: string }).field);
                const message = String((row as { message: string }).message);
                if (field) acc[field] = message;
            }
            return acc;
        }, {});
    }
    if (typeof data === "object") {
        return Object.entries(data as Record<string, unknown>).reduce<Record<string, string>>((acc, [key, val]) => {
            if (typeof val === "string") acc[key] = val;
            return acc;
        }, {});
    }
    return {};
}

export default function ServiceProviderSubscriptionsPage() {
    const { id } = useParams();
    const router = useRouter();

    const [providerName, setProviderName] = useState("");
    const [rows, setRows] = useState<AssignedRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<PlanOption | null>(null);

    const getData = useCallback(async () => {
        if (!id) return;

        setLoading(true);
        const { data } = await AxiosHelperAdmin.getData(`/service-providers/${id}/subscriptions`);
        if (data.status && data.data?.provider) {
            setProviderName(String(data.data.provider.name || ""));
            setRows(Array.isArray(data.data.record) ? data.data.record : []);
            setLoading(false);
        } else {
            setLoading(false);
            toast.error(data.message || "Could not load service provider.");
            router.push("/admin/service-providers");
        }
    }, [id, router]);

    useEffect(() => {
        (async () => { void getData(); })();
    }, [getData]);

    const loadPlanOptions = useCallback(async (inputValue: string): Promise<PlanOption[]> => {
        const { data } = await AxiosHelper.getData("/subscriptions-list", { query: inputValue || "" });
        if (data.status && Array.isArray(data?.data)) {
            return data.data.map((row: { _id: string; name: string; subscriptionId: string; }) => ({ value: row._id, label: `${row.name} (${row.subscriptionId})` }));
        }
        return [];
    }, []);

    const openAdd = () => {
        setSelectedPlan(null);
        setOpen(true);
    };

    const menuPortalTarget = typeof window !== "undefined" ? document.body : null;

    return (
        <section className="space-y-4">
            <AdminPageHeader
                title="Provider Subscriptions"
                subtitle={loading ? "Loading..." : providerName ? <>Assign plans for <span className="font-medium">{providerName}</span>.</> : "Assign provider subscription plans."}
                action={
                    <div className="flex flex-wrap items-center gap-2">
                        <Link href="/admin/service-providers" className="inline-flex h-10 items-center gap-2 rounded-xl border border-indigo-100 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                            <ArrowLeftIcon className="h-4 w-4" />
                            Back
                        </Link>
                        <PermissionBlock permission_id={455}>
                            <Button type="button" variant="primary" size="md" onClick={openAdd}>
                                <Plus className="h-3.5 w-3.5" />
                                Assign plan
                            </Button>
                        </PermissionBlock>
                    </div>
                }
            />

            <div className="rounded-2xl border border-indigo-100 bg-[#f8faff] p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
                <div className="flex gap-3">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
                    <div className="space-y-2">
                        <p className="font-medium text-slate-800 dark:text-slate-100">How plan dates work</p>
                        <ul className="list-disc space-y-1 pl-4">
                            <li>New plan starts <span className="font-medium">today</span> if no active plan exists right now.</li>
                            <li>If a plan is already active, new plan is <span className="font-medium">queued</span> from the next day after current plan end date.</li>
                        </ul>
                    </div>
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
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200 font-semibold">{row.voucherNo || "—"}</td>
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
                                        <Badge variant={assignment.variant} size="sm">
                                            {assignment.label}
                                        </Badge>
                                        <p className="mt-1 max-w-xs text-xs text-slate-500">{assignment.note}</p>
                                    </td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                        <span className="font-semibold block">₹ {Number(row.paymentAmount || 0).toLocaleString("en-IN")}</span>
                                        {row.taxPercentage > 0 && <span className="text-xs text-slate-500">
                                            ₹ {Number(row.amount || 0).toLocaleString("en-IN")}  + {Number(row.taxAmount || 0).toLocaleString("en-IN")} ( Tax {row.taxPercentage}% )
                                        </span>}
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

            <Modal
                show={open}
                onClose={() => setOpen(false)}
                title="Assign subscription plan"
                subTitle="Start/end dates and payment amount are taken from the selected plan. Plans are auto-sequenced."
                size="lg"
                scrollable
            >
                <Formik
                    initialValues={INITIAL_VALUES}
                    enableReinitialize
                    validationSchema={assignSchema}
                    onSubmit={async (values, { setSubmitting, setErrors, resetForm }) => {
                        const { data } = await AxiosHelperAdmin.postData(`/service-providers/${id}/subscriptions`, {
                            subscriptionId: values.subscriptionId,
                        });

                        if (data.status) {
                            toast.success(data.message);
                            setOpen(false);
                            resetForm();
                            setSelectedPlan(null);
                            void getData();
                        } else {
                            toast.error(data.message);
                            setErrors(normalizeApiFormErrors(data.data));
                        }

                        setSubmitting(false);
                    }}
                >
                    {({ isSubmitting, setFieldValue }) => (
                        <Form className="space-y-4">
                            <div className="space-y-2">
                                <Label>Subscription plan <span className="text-rose-600">*</span></Label>
                                <AsyncSelect
                                    inputId="assign-subscription-plan"
                                    value={selectedPlan}
                                    loadOptions={loadPlanOptions}
                                    menuPortalTarget={menuPortalTarget}
                                    menuPosition="fixed"
                                    onChange={(option) => {
                                        const plan = option as PlanOption | null;
                                        setSelectedPlan(plan);
                                        setFieldValue("subscriptionId", plan?.value || "");
                                    }}
                                    placeholder="Search active plans..."
                                />
                                <ErrorMessage className="text-xs text-rose-600" name="subscriptionId" component="small" />
                                {selectedPlan?.price != null ? (
                                    <p className="text-xs text-slate-500">Plan amount: ₹{Number(selectedPlan.price).toLocaleString("en-IN")}</p>
                                ) : null}
                            </div>

                            <Button type="submit" variant="primary" size="md" fullWidth disabled={isSubmitting}>
                                {isSubmitting ? "Saving..." : "Assign plan"}
                            </Button>
                        </Form>
                    )}
                </Formik>
            </Modal>
        </section>
    );
}
