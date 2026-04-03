"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { debounce } from "lodash";
import * as Yup from "yup";
import moment from "moment";
import Swal from "sweetalert2/dist/sweetalert2.js";
import { toast } from "react-toastify";
import { Pencil, Plus, Trash2 } from "lucide-react";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AxiosHelperAdmin from "@/helpers/AxiosHelperAdmin";
import { Badge, Button, Input, Label, Modal, Select } from "@/components/ui";
import AdminPagination from "@/components/admin/AdminPagination";
import { getSweetAlertConfig } from "@/helpers/utils";
import AdminTableHeader from "@/components/admin/AdminTableHeader";
import PermissionBlock from "@/components/admin/PermissionBlock";
import AdminNoTableRecords from "@/components/admin/AdminNoTableRecords";

type TagRow = {
    _id: string;
    tagFor: "customer" | "provider";
    tagName: string;
    tagType: "positive" | "negative" | "neutral";
    status: number;
    createdAt?: string;
};

type TagRecord = {
    count: number;
    record: TagRow[];
    totalPages: number;
    pagination: number[];
};

type SortBy = "tagName" | "tagFor" | "tagType" | "status" | "createdAt";
type SortOrder = "asc" | "desc";

const validationSchema = Yup.object().shape({
    tagFor: Yup.string().oneOf(["customer", "provider"], "Select who the tag is for.").required("Required."),
    tagName: Yup.string().min(1, "Too short.").max(150, "Too long.").required("Tag name required.").trim(),
    tagType: Yup.string().oneOf(["positive", "negative", "neutral"], "Select type.").required("Required."),
    status: Yup.number().required("Status required")
});

function tagTypeBadgeVariant(t: TagRow["tagType"]) {
    if (t === "positive") return "success" as const;
    if (t === "negative") return "danger" as const;
    return "secondary" as const;
}

export default function AdminPredefinedRatingTagsPage() {
    const debouncedFetchRef = useRef(debounce(() => { }, 0));
    const [open, setOpen] = useState<null | "add" | "edit">(null);
    const [data, setData] = useState<TagRecord>({ count: 0, record: [], totalPages: 0, pagination: [] });
    const [param, setParam] = useState<{
        limit: number;
        pageNo: number;
        query: string;
        sortBy: SortBy;
        sortOrder: SortOrder;
        status: "" | 0 | 1;
        tagFor: "" | "customer" | "provider";
    }>({
        limit: 10,
        pageNo: 1,
        query: "",
        sortBy: "createdAt",
        sortOrder: "desc",
        status: "",
        tagFor: ""
    });
    const [initialValues, setInitialValues] = useState<TagRow>({
        _id: "",
        tagFor: "customer",
        tagName: "",
        tagType: "positive",
        status: 1
    });

    const fetchTags = useCallback(async () => {
        const { data } = await AxiosHelperAdmin.getData("/rating-tags", param);
        if (data.status && data.data) {
            const { count, totalPages, record, pagination } = data.data;
            setData({ count, totalPages, record, pagination });
        } else {
            setData({ count: 0, totalPages: 0, record: [], pagination: [] });
        }
    }, [param]);

    useEffect(() => {
        debouncedFetchRef.current = debounce(() => { fetchTags(); }, 500);
    }, [fetchTags]);

    useEffect(() => {
        debouncedFetchRef.current();
        return () => { debouncedFetchRef.current.cancel(); };
    }, [param]);

    const handleDelete = async (id: string) => {
        const { isConfirmed } = await Swal.fire(getSweetAlertConfig({}));
        if (isConfirmed) {
            const { data } = await AxiosHelperAdmin.deleteData(`/rating-tags/${id}`);
            if (data.status) {
                toast.success(data.message);
                fetchTags();
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
                title="Rating Tags"
                subtitle="Quick labels for customer and provider ratings (positive, negative, or neutral)."
                action={
                    <PermissionBlock permission_id={341}>
                        <Button
                            type="button"
                            variant="primary"
                            size="md"
                            onClick={() => {
                                setInitialValues({ _id: "", tagFor: "customer", tagName: "", tagType: "positive", status: 1 });
                                setOpen("add");
                            }}
                        >
                            <Plus className="h-3.5 w-3.5" />
                            Create tag
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
                        placeholder="Search tag name..."
                    />
                    <div className="flex flex-wrap items-center gap-2">
                        <Select
                            value={param.tagFor}
                            onChange={(e) => {
                                const v = e.target.value;
                                setParam((prev) => ({
                                    ...prev,
                                    pageNo: 1,
                                    tagFor: v === "" ? "" : (v as "customer" | "provider")
                                }));
                            }}
                            className="max-w-[180px]"
                        >
                            <option value="">All audiences</option>
                            <option value="customer">Customer</option>
                            <option value="provider">Provider</option>
                        </Select>
                        <Select
                            value={param.status}
                            onChange={(e) => {
                                const v = e.target.value;
                                setParam((prev) => ({ ...prev, pageNo: 1, status: v === "" ? "" : (Number(v) as 0 | 1) }));
                            }}
                            className="max-w-[180px]"
                        >
                            <option value="">All</option>
                            <option value={1}>Active</option>
                            <option value={0}>Inactive</option>
                        </Select>
                        <div className="text-sm text-slate-500 dark:text-slate-400">Total: {data.count}</div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-[#edf3ff] text-left text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            <tr>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("tagName")} name="Tag name" active={param.sortBy === "tagName"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("tagFor")} name="Applicable For" active={param.sortBy === "tagFor"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("tagType")} name="Type" active={param.sortBy === "tagType"} sortOrder={param.sortOrder} />
                                </th>
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
                            {data.record.map((row) => (
                                <tr key={row._id} className="border-t border-indigo-100 dark:border-slate-700">
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.tagName}</td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200 capitalize">{row.tagFor}</td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                        <Badge variant={tagTypeBadgeVariant(row.tagType)} size="sm">
                                            {row.tagType}
                                        </Badge>
                                    </td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                        <Badge variant={row.status === 1 ? "success" : "secondary"} size="sm">
                                            {row.status === 1 ? "Active" : "Inactive"}
                                        </Badge>
                                    </td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.createdAt ? moment(row.createdAt).format("DD-MM-YYYY") : "—"}</td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                        <div className="flex justify-end gap-1.5 sm:gap-2">
                                            <PermissionBlock permission_id={342}>
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => {
                                                        setInitialValues(row);
                                                        setOpen("edit");
                                                    }}
                                                    title="Edit tag"
                                                    aria-label="Edit tag"
                                                >
                                                    <Pencil className="h-4 w-4 shrink-0" strokeWidth={2} />
                                                </Button>
                                            </PermissionBlock>
                                            <PermissionBlock permission_id={343}>
                                                <Button size="sm" variant="danger" onClick={() => handleDelete(row._id)} title="Delete tag" aria-label="Delete tag">
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

            <Modal
                show={!!open}
                onClose={() => setOpen(null)}
                title={open === "add" ? "Create tag" : "Update tag"}
                subTitle="Audience, label, sentiment type, and status."
                size="md"
            >
                <div className="space-y-4">
                    <Formik
                        initialValues={initialValues}
                        enableReinitialize
                        validationSchema={validationSchema}
                        onSubmit={async (values, { setSubmitting, resetForm, setErrors }) => {
                            const payload = {
                                tagFor: values.tagFor,
                                tagName: values.tagName.trim(),
                                tagType: values.tagType,
                                status: values.status
                            };
                            if (open === "add") {
                                const { data } = await AxiosHelperAdmin.postData("/rating-tags", payload);
                                if (data?.status) {
                                    toast.success(data.message);
                                    setOpen(null);
                                    fetchTags();
                                    resetForm();
                                } else {
                                    toast.error(data.message);
                                    setErrors(data.data);
                                }
                            } else {
                                const { data } = await AxiosHelperAdmin.putData(`/rating-tags/${values._id}`, payload);
                                if (data?.status) {
                                    toast.success(data.message);
                                    setOpen(null);
                                    fetchTags();
                                    resetForm();
                                } else {
                                    toast.error(data.message);
                                    setErrors(data.data);
                                }
                            }
                            setSubmitting(false);
                        }}
                    >
                        {({ isSubmitting }) => (
                            <Form className="space-y-3">
                                <div className="space-y-2">
                                    <Label htmlFor="prt-tagFor">Tag for</Label>
                                    <Field as={Select} id="prt-tagFor" name="tagFor">
                                        <option value="customer">Customer</option>
                                        <option value="provider">Provider</option>
                                    </Field>
                                    <ErrorMessage className="text-xs text-rose-600" name="tagFor" component="small" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="prt-tagName">Tag name</Label>
                                    <Field as={Input} id="prt-tagName" name="tagName" placeholder="e.g. Punctual" />
                                    <ErrorMessage className="text-xs text-rose-600" name="tagName" component="small" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="prt-tagType">Type</Label>
                                    <Field as={Select} id="prt-tagType" name="tagType">
                                        <option value="positive">Positive</option>
                                        <option value="negative">Negative</option>
                                        <option value="neutral">Neutral</option>
                                    </Field>
                                    <ErrorMessage className="text-xs text-rose-600" name="tagType" component="small" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="prt-status">Status</Label>
                                    <Field as={Select} id="prt-status" name="status">
                                        <option value={1}>Active</option>
                                        <option value={0}>Inactive</option>
                                    </Field>
                                    <ErrorMessage className="text-xs text-rose-600" name="status" component="small" />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="ghost" size="md" className="border border-indigo-100 dark:border-indigo-100" onClick={() => setOpen(null)}>
                                        Cancel
                                    </Button>
                                    <Button disabled={isSubmitting} type="submit" variant="primary" size="md">
                                        {isSubmitting ? "Saving..." : "Save"}
                                    </Button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </Modal>
        </section>
    );
}
