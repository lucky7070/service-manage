"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ErrorMessage, Field, FieldArray, Form, Formik, type FieldProps } from "formik";
import { debounce } from "lodash";
import * as Yup from "yup";
import moment from "moment";
import Swal from "sweetalert2/dist/sweetalert2.js";
import { toast } from "react-toastify";
import { ImageIcon, Pencil, Plus, Trash2 } from "lucide-react";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AxiosHelperAdmin from "@/helpers/AxiosHelperAdmin";
import { Badge, Button, Checkbox, Input, InputFile, Label, Modal, Select, Textarea, Option } from "@/components/ui";
import AdminPagination from "@/components/admin/AdminPagination";
import { getSweetAlertConfig, resolveFileUrl } from "@/helpers/utils";
import AdminTableHeader from "@/components/admin/AdminTableHeader";
import PermissionBlock from "@/components/admin/PermissionBlock";
import Image from "@/components/ui/Image";
import AdminNoTableRecords from "@/components/admin/AdminNoTableRecords";

type BillingInterval = "day" | "month" | "year";

type SubscriptionFeature = {
    name: string;
    description: string;
    included: number | boolean;
};

type SubscriptionRow = {
    _id: string;
    subscriptionId?: string;
    name: string;
    slug?: string;
    image: string | File | null;
    description: string;
    price: number;
    interval: BillingInterval;
    intervalCount: number;
    features: SubscriptionFeature[];
    status: number;
    createdAt?: string;
};

type SubscriptionRecord = {
    count: number;
    record: SubscriptionRow[];
    totalPages: number;
    pagination: number[];
};

type SortBy = "name" | "price" | "interval" | "status" | "createdAt";
type SortOrder = "asc" | "desc";

const EMPTY_FEATURE: SubscriptionFeature = { name: "", description: "", included: 1 };

const INITIAL_VALUES: SubscriptionRow = {
    _id: "",
    name: "",
    image: null,
    description: "",
    price: 0,
    interval: "month",
    intervalCount: 1,
    features: [{ ...EMPTY_FEATURE }],
    status: 1,
};

const validationSchema = Yup.object().shape({
    name: Yup.string().trim().min(2, "Too short.").max(150, "Too long.").required("Name is required."),
    description: Yup.string().trim().min(3, "Description is required.").max(5000, "Too long.").required("Description is required."),
    price: Yup.number().min(0, "Price cannot be negative.").required("Price is required."),
    interval: Yup.string().oneOf(["day", "month", "year"], "Select interval.").required("Interval required."),
    intervalCount: Yup.number().min(1, "Must be at least 1.").max(365, "Too large.").required("Interval count required."),
    status: Yup.number().required("Status required."),
    features: Yup.array().of(Yup.object({
        name: Yup.string().trim().min(1, "Feature name is required.").max(100, "Too long.").required("Feature name is required."),
        description: Yup.string().trim().min(1, "Feature description is required.").max(1000, "Too long.").required("Feature description is required."),
        included: Yup.mixed().oneOf([0, 1, true, false]),
    })).min(1, "Add at least one feature.").required("At least one feature is required."),
});

function formatBilling(interval: BillingInterval, intervalCount: number) {
    const unit = intervalCount === 1 ? interval : `${interval}s`;
    return `${intervalCount} ${unit}`;
}

export default function AdminSubscriptionsPage() {
    const debouncedFetchRef = useRef(debounce(() => { }, 0));
    const [open, setOpen] = useState<null | "add" | "edit">(null);
    const [data, setData] = useState<SubscriptionRecord>({ count: 0, record: [], totalPages: 0, pagination: [] });
    const [param, setParam] = useState<{
        limit: number;
        pageNo: number;
        query: string;
        sortBy: SortBy;
        sortOrder: SortOrder;
        status: "" | 0 | 1;
        interval: "" | BillingInterval;
    }>({ limit: 10, pageNo: 1, query: "", sortBy: "createdAt", sortOrder: "desc", status: "", interval: "" });
    const [initialValues, setInitialValues] = useState<SubscriptionRow>(INITIAL_VALUES);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const fetchSubscriptions = useCallback(async () => {
        const { data } = await AxiosHelperAdmin.getData("/subscriptions", param);
        if (data.status && data.data) {
            const { count, totalPages, record, pagination } = data.data;
            setData({ count, totalPages, record, pagination });
        } else {
            setData({ count: 0, totalPages: 0, record: [], pagination: [] });
        }
    }, [param]);

    useEffect(() => {
        debouncedFetchRef.current = debounce(() => { fetchSubscriptions(); }, 500);
    }, [fetchSubscriptions]);

    useEffect(() => {
        debouncedFetchRef.current();
        return () => { debouncedFetchRef.current.cancel(); };
    }, [param]);

    const handleDelete = async (id: string) => {
        const { isConfirmed } = await Swal.fire(getSweetAlertConfig({}));
        if (isConfirmed) {
            const { data } = await AxiosHelperAdmin.deleteData(`/subscriptions/${id}`);
            if (data.status) {
                toast.success(data.message);
                fetchSubscriptions();
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
                title="Subscriptions"
                subtitle="Manage subscription plans, pricing, and included features."
                action={
                    <PermissionBlock permission_id={451}>
                        <Button
                            type="button"
                            variant="primary"
                            size="md"
                            onClick={() => {
                                setInitialValues(INITIAL_VALUES);
                                setImagePreview(null);
                                setOpen("add");
                            }}
                        >
                            <Plus className="h-3.5 w-3.5" />
                            Create Subscription
                        </Button>
                    </PermissionBlock>
                }
            />

            <div className="rounded-2xl border border-indigo-100 bg-white p-4 dark:border-indigo-100 dark:bg-slate-900">
                <div className="mb-3 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                    <Input
                        value={param.query}
                        onChange={(e) => setParam((prev) => ({ ...prev, pageNo: 1, query: e.target.value }))}
                        className="max-w-xs"
                        placeholder="Search name / ID..."
                    />
                    <div className="flex flex-wrap items-center gap-2">
                        <Select
                            value={param.interval}
                            onChange={(e) =>
                                setParam((prev) => ({
                                    ...prev,
                                    pageNo: 1,
                                    interval: e.target.value === "" ? "" : (e.target.value as BillingInterval),
                                }))
                            }
                            className="max-w-[160px]"
                        >
                            <Option value="">All intervals</Option>
                            <Option value="day">Day</Option>
                            <Option value="month">Month</Option>
                            <Option value="year">Year</Option>
                        </Select>
                        <Select
                            value={param.status}
                            onChange={(e) => {
                                const v = e.target.value;
                                setParam((prev) => ({ ...prev, pageNo: 1, status: v === "" ? "" : (Number(v) as 0 | 1) }));
                            }}
                            className="max-w-[160px]"
                        >
                            <Option value="">All status</Option>
                            <Option value={1}>Active</Option>
                            <Option value={0}>Inactive</Option>
                        </Select>
                        <div className="text-sm text-slate-500 dark:text-slate-400">Total: {data.count}</div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-[#edf3ff] text-left text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            <tr>
                                <th className="w-14 px-3 py-2" />
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("name")} name="Plan" active={param.sortBy === "name"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2">ID</th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("price")} name="Price" active={param.sortBy === "price"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("interval")} name="Billing" active={param.sortBy === "interval"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2">Features</th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("status")} name="Status" active={param.sortBy === "status"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("createdAt")} name="Created" active={param.sortBy === "createdAt"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.record.map((row) => {
                                const thumb = resolveFileUrl(row.image as string | null);
                                return (
                                    <tr key={row._id} className="border-t border-indigo-100 dark:border-slate-700">
                                        <td className="px-3 py-2">
                                            <div className="relative h-10 w-10 overflow-hidden rounded border border-indigo-100 bg-slate-100 dark:border-slate-600 dark:bg-slate-800">
                                                {thumb ? (
                                                    <Image src={thumb} alt="" className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-slate-400">
                                                        <ImageIcon className="h-4 w-4" />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="max-w-[200px] px-3 py-2 font-medium text-slate-700 dark:text-slate-200">{row.name}</td>
                                        <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{row.subscriptionId || "—"}</td>
                                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">₹{Number(row.price || 0).toLocaleString("en-IN")}</td>
                                        <td className="px-3 py-2 capitalize text-slate-700 dark:text-slate-200">
                                            {formatBilling(row.interval, row.intervalCount || 1)}
                                        </td>
                                        <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{row.features?.length || 0}</td>
                                        <td className="px-3 py-2">
                                            <Badge variant={row.status === 1 ? "success" : "secondary"} size="sm">
                                                {row.status === 1 ? "Active" : "Inactive"}
                                            </Badge>
                                        </td>
                                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                            {row.createdAt ? moment(row.createdAt).format("DD-MM-YYYY") : "—"}
                                        </td>
                                        <td className="px-3 py-2">
                                            <div className="flex justify-end gap-1.5 sm:gap-2">
                                                <PermissionBlock permission_id={452}>
                                                    <Button size="sm" variant="secondary" onClick={() => {
                                                        setInitialValues({
                                                            _id: row._id,
                                                            subscriptionId: row.subscriptionId,
                                                            name: row.name || "",
                                                            image: row.image || null,
                                                            description: row.description || "",
                                                            price: Number(row.price) || 0,
                                                            interval: row.interval || "month",
                                                            intervalCount: row.intervalCount || 1,
                                                            features: (row.features?.length ? row.features : [{ ...EMPTY_FEATURE }]).map((f) => ({
                                                                name: f.name || "",
                                                                description: f.description || "",
                                                                included: f.included === 0 || f.included === false ? 0 : 1,
                                                            })),
                                                            status: row.status ?? 1,
                                                        });
                                                        setImagePreview(typeof row.image === "string" ? resolveFileUrl(row.image) : null);
                                                        setOpen("edit");
                                                    }} title="Edit" aria-label="Edit">
                                                        <Pencil className="h-4 w-4 shrink-0" strokeWidth={2} />
                                                    </Button>
                                                </PermissionBlock>
                                                <PermissionBlock permission_id={453}>
                                                    <Button size="sm" variant="danger" onClick={() => handleDelete(row._id)} title="Delete" aria-label="Delete">
                                                        <Trash2 className="h-4 w-4 shrink-0" strokeWidth={2} />
                                                    </Button>
                                                </PermissionBlock>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            <AdminNoTableRecords show={data.record.length === 0} />
                        </tbody>
                    </table>
                </div>
                <AdminPagination data={data} param={param} setParam={setParam} />
            </div>

            <Modal
                show={!!open}
                onClose={() => setOpen(null)}
                title={open === "add" ? "Create Subscription" : "Update Subscription"}
                subTitle="Set plan pricing, billing cycle, image, and feature list."
                size="xl"
                scrollable
            >
                <Formik
                    initialValues={initialValues}
                    enableReinitialize
                    validationSchema={validationSchema}
                    onSubmit={async (values, { setSubmitting, resetForm, setErrors }) => {
                        if (open === "add") {
                            const { data } = await AxiosHelperAdmin.postData("/subscriptions", values, true);
                            if (data.status) {
                                toast.success(data.message);
                                setOpen(null);
                                fetchSubscriptions();
                                resetForm();
                            } else {
                                toast.error(data.message);
                                setErrors(data.data);
                            }
                        } else {
                            const { data } = await AxiosHelperAdmin.putData(`/subscriptions/${values._id}`, values, true);
                            if (data.status) {
                                toast.success(data.message);
                                setOpen(null);
                                fetchSubscriptions();
                                resetForm();
                            } else {
                                toast.error(data.message);
                                setErrors(data.data);
                            }
                        }
                        setSubmitting(false);
                    }}
                >
                    {({ isSubmitting, values, setFieldValue, errors }) => (
                        <Form className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-indigo-100 bg-slate-100 dark:border-slate-600 dark:bg-slate-800">
                                        {(imagePreview || resolveFileUrl(typeof initialValues.image === "string" ? initialValues.image : null)) ? (
                                            <Image src={imagePreview || resolveFileUrl(typeof initialValues.image === "string" ? initialValues.image : null) || ""} alt="Profile photo" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-slate-400">
                                                <ImageIcon className="h-8 w-8" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="admin-image">Plan Image <span className="font-normal text-slate-500">(optional)</span></Label>
                                        <InputFile
                                            id="admin-image"
                                            accept="image/jpeg,image/png,image/webp,image/gif"
                                            onChange={(e) => {
                                                const f = e.target.files?.[0];
                                                if (f) {
                                                    setFieldValue("image", f);
                                                    setImagePreview(URL.createObjectURL(f));
                                                } else {
                                                    setFieldValue("image", null);
                                                    setImagePreview(resolveFileUrl(typeof initialValues.image === "string" ? initialValues.image : null));
                                                }
                                            }}
                                        />
                                        <ErrorMessage className="text-xs text-rose-600" name="image" component="small" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="subscription-name">Plan name</Label>
                                    <Field as={Input} id="subscription-name" name="name" placeholder="e.g. Premium Home Care" />
                                    <ErrorMessage className="text-xs text-rose-600" name="name" component="small" />
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="subscription-description">Description <span className="text-rose-600">*</span></Label>
                                    <Field as={Textarea} id="subscription-description" name="description" rows={3} placeholder="Short plan description" />
                                    <ErrorMessage className="text-xs text-rose-600" name="description" component="small" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="subscription-price">Price (₹)</Label>
                                    <Field as={Input} id="subscription-price" name="price" type="number" min={0} step="0.01" />
                                    <ErrorMessage className="text-xs text-rose-600" name="price" component="small" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="subscription-interval-count">Every</Label>
                                    <Field as={Input} id="subscription-interval-count" name="intervalCount" type="number" min={1} />
                                    <ErrorMessage className="text-xs text-rose-600" name="intervalCount" component="small" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="subscription-interval">Billing interval</Label>
                                    <Field as={Select} id="subscription-interval" name="interval">
                                        <Option value="day">Day</Option>
                                        <Option value="month">Month</Option>
                                        <Option value="year">Year</Option>
                                    </Field>
                                    <ErrorMessage className="text-xs text-rose-600" name="interval" component="small" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="subscription-status">Status</Label>
                                    <Field as={Select} id="subscription-status" name="status">
                                        <Option value={1}>Active</Option>
                                        <Option value={0}>Inactive</Option>
                                    </Field>
                                    <ErrorMessage className="text-xs text-rose-600" name="status" component="small" />
                                </div>
                            </div>

                            <FieldArray name="features">
                                {(arrayHelpers) => (
                                    <div className="space-y-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                                        <div className="flex items-center justify-between gap-2">
                                            <Label className="mb-0">Features</Label>
                                            <Button type="button" size="sm" variant="outline" onClick={() => arrayHelpers.push({ ...EMPTY_FEATURE })}>
                                                <Plus className="h-3.5 w-3.5" /> Add feature
                                            </Button>
                                        </div>

                                        {values.features.length > 0 ? (
                                            <div className="overflow-x-auto rounded-lg border border-slate-100 dark:border-slate-800">
                                                <table className="min-w-full text-sm">
                                                    <thead className="bg-[#edf3ff] text-left text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                                        <tr>
                                                            <th className="px-3 py-2 font-semibold">Name <span className="text-rose-600">*</span></th>
                                                            <th className="px-3 py-2 font-semibold">Description <span className="text-rose-600">*</span></th>
                                                            <th className="w-24 px-3 py-2 text-center font-semibold">Included</th>
                                                            <th className="w-16 px-3 py-2 text-right font-semibold">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {values.features.map((_, index) => (
                                                            <tr key={index} className="border-t border-slate-100 dark:border-slate-800">
                                                                <td className="px-3 py-2 align-top">
                                                                    <Field as={Input} name={`features.${index}.name`} placeholder="Feature name" />
                                                                    <ErrorMessage className="mt-1 block text-xs text-rose-600" name={`features.${index}.name`} component="small" />
                                                                </td>
                                                                <td className="px-3 py-2 align-top">
                                                                    <Field as={Input} name={`features.${index}.description`} placeholder="Feature detail" />
                                                                    <ErrorMessage className="mt-1 block text-xs text-rose-600" name={`features.${index}.description`} component="small" />
                                                                </td>
                                                                <td className="px-3 py-2 text-center align-middle">
                                                                    <Field name={`features.${index}.included`}>
                                                                        {({ field, form }: FieldProps) => (
                                                                            <Checkbox
                                                                                checked={field.value === 1 || field.value === true}
                                                                                onChange={(e) =>
                                                                                    form.setFieldValue(field.name, e.target.checked ? 1 : 0)
                                                                                }
                                                                                aria-label="Included in plan"
                                                                                className="mx-auto"
                                                                            />
                                                                        )}
                                                                    </Field>
                                                                </td>
                                                                <td className="px-3 py-2 text-right align-middle">
                                                                    <Button type="button" size="sm" variant="danger" disabled={values.features.length <= 1} onClick={() => arrayHelpers.remove(index)} aria-label="Remove feature">
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <Button type="button" size="sm" variant="outline" onClick={() => arrayHelpers.push({ ...EMPTY_FEATURE })}>
                                                <Plus className="h-3.5 w-3.5" /> Add a feature
                                            </Button>
                                        )}

                                        {typeof errors.features === "string" ? <ErrorMessage className="mt-1 block text-xs text-rose-600" name={`features`} component="small" /> : null}
                                    </div>
                                )}
                            </FieldArray>

                            <Button type="submit" variant="primary" size="md" fullWidth disabled={isSubmitting}>
                                {isSubmitting ? "Saving..." : open === "add" ? "Create Subscription" : "Update Subscription"}
                            </Button>
                        </Form>
                    )}
                </Formik>
            </Modal>
        </section>
    );
}
