"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { debounce } from "lodash";
import * as Yup from "yup";
import moment from "moment";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { Pencil, Plus, Trash2 } from "lucide-react";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AxiosHelperAdmin from "@/helpers/AxiosHelperAdmin";
import { Badge, Button, Input, Label, Modal, Select, Textarea } from "@/components/ui";
import AdminPagination from "@/components/admin/AdminPagination";
import { getSweetAlertConfig } from "@/helpers/utils";
import AdminTableHeader from "@/components/admin/AdminTableHeader";
import PermissionBlock from "@/components/admin/PermissionBlock";
import AdminNoTableRecords from "@/components/admin/AdminNoTableRecords";

type FaqRow = {
    _id: string;
    question: string;
    answer: string;
    displayOrder: number;
    status: number;
    createdAt?: string;
};

type FaqRecord = {
    count: number;
    record: FaqRow[];
    totalPages: number;
    pagination: number[];
};

type SortBy = "question" | "displayOrder" | "status" | "createdAt";
type SortOrder = "asc" | "desc";

const validationSchema = Yup.object().shape({
    question: Yup.string().min(3, "Too short.").max(2000, "Too long.").required("Question is required.").trim(),
    answer: Yup.string().min(3, "Too short.").max(10000, "Too long.").required("Answer is required.").trim(),
    displayOrder: Yup.number().min(0, "Cannot be negative.").max(999999, "Too large.").required("Display order required."),
    status: Yup.number().required("Status required")
});

export default function AdminFaqPage() {
    const debouncedFetchRef = useRef(debounce(() => { }, 0));
    const [open, setOpen] = useState<null | "add" | "edit">(null);
    const [data, setData] = useState<FaqRecord>({ count: 0, record: [], totalPages: 0, pagination: [] });
    const [param, setParam] = useState<{ limit: number; pageNo: number; query: string; sortBy: SortBy; sortOrder: SortOrder; status: "" | 0 | 1; }>({ limit: 10, pageNo: 1, query: "", sortBy: "createdAt", sortOrder: "desc", status: "" });
    const [initialValues, setInitialValues] = useState<FaqRow>({ _id: "", question: "", answer: "", displayOrder: 0, status: 1 });

    const fetchFaqs = useCallback(async () => {
        const { data } = await AxiosHelperAdmin.getData("/faqs", param);
        if (data.status && data.data) {
            const { count, totalPages, record, pagination } = data.data;
            setData({ count, totalPages, record, pagination });
        } else {
            setData({ count: 0, totalPages: 0, record: [], pagination: [] });
        }
    }, [param]);

    useEffect(() => {
        debouncedFetchRef.current = debounce(() => { fetchFaqs(); }, 500);
    }, [fetchFaqs]);

    useEffect(() => {
        debouncedFetchRef.current();
        return () => { debouncedFetchRef.current.cancel(); };
    }, [param]);

    const handleDelete = async (id: string) => {
        const { isConfirmed } = await Swal.fire(getSweetAlertConfig({}));
        if (isConfirmed) {
            const { data } = await AxiosHelperAdmin.deleteData(`/faqs/${id}`);
            if (data.status) {
                toast.success(data.message);
                fetchFaqs();
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
                title="FAQs"
                subtitle="Create and manage frequently asked questions shown to users."
                action={
                    <PermissionBlock permission_id={381}>
                        <Button
                            type="button"
                            variant="primary"
                            size="md"
                            onClick={() => {
                                setInitialValues({ _id: "", question: "", answer: "", displayOrder: 0, status: 1 });
                                setOpen("add");
                            }}
                        >
                            <Plus className="h-3.5 w-3.5" />
                            Create FAQ
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
                        placeholder="Search question..."
                    />
                    <div className="flex flex-wrap items-center gap-2">
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
                                    <AdminTableHeader onClick={() => onSort("question")} name="Question" active={param.sortBy === "question"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2">Answer</th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("displayOrder")} name="Order" active={param.sortBy === "displayOrder"} sortOrder={param.sortOrder} />
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
                                    <td className="max-w-[280px] px-3 py-2 text-slate-700 dark:text-slate-200">{row.question}</td>
                                    <td className="max-w-[400px] px-3 py-2 text-slate-700 dark:text-slate-200">
                                        <span className="line-clamp-2">{row.answer}</span>
                                    </td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.displayOrder ?? 0}</td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                        <Badge variant={row.status === 1 ? "success" : "secondary"} size="sm">
                                            {row.status === 1 ? "Active" : "Inactive"}
                                        </Badge>
                                    </td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.createdAt ? moment(row.createdAt).format("DD-MM-YYYY") : "—"}</td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                        <div className="flex justify-end gap-1.5 sm:gap-2">
                                            <PermissionBlock permission_id={382}>
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => {
                                                        setInitialValues(row);
                                                        setOpen("edit");
                                                    }}
                                                    title="Edit FAQ"
                                                    aria-label="Edit FAQ"
                                                >
                                                    <Pencil className="h-4 w-4 shrink-0" strokeWidth={2} />
                                                </Button>
                                            </PermissionBlock>
                                            <PermissionBlock permission_id={383}>
                                                <Button size="sm" variant="danger" onClick={() => handleDelete(row._id)} title="Delete FAQ" aria-label="Delete FAQ">
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
                title={open === "add" ? "Create FAQ" : "Update FAQ"}
                subTitle="Question, answer, order and status."
                size="lg"
            >
                <div className="space-y-4">
                    <Formik
                        initialValues={initialValues}
                        enableReinitialize
                        validationSchema={validationSchema}
                        onSubmit={async (values, { setSubmitting, resetForm, setErrors }) => {
                            if (open === "add") {
                                const { data } = await AxiosHelperAdmin.postData("/faqs", values);
                                if (data?.status) {
                                    toast.success(data.message);
                                    setOpen(null);
                                    fetchFaqs();
                                    resetForm();
                                } else {
                                    toast.error(data.message);
                                    setErrors(data.data);
                                }
                            } else {
                                const { data } = await AxiosHelperAdmin.putData(`/faqs/${values._id}`, values);
                                if (data?.status) {
                                    toast.success(data.message);
                                    setOpen(null);
                                    fetchFaqs();
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
                                    <Label htmlFor="faq-question">Question</Label>
                                    <Field as={Input} id="faq-question" name="question" placeholder="Enter question" />
                                    <ErrorMessage className="text-xs text-rose-600" name="question" component="small" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="faq-answer">Answer</Label>
                                    <Field as={Textarea} id="faq-answer" name="answer" className="min-h-28" placeholder="Enter answer" />
                                    <ErrorMessage className="text-xs text-rose-600" name="answer" component="small" />
                                </div>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="faq-order">Display order</Label>
                                        <Field as={Input} id="faq-order" name="displayOrder" type="number" min={0} />
                                        <ErrorMessage className="text-xs text-rose-600" name="displayOrder" component="small" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="faq-status">Status</Label>
                                        <Field as={Select} id="faq-status" name="status">
                                            <option value={1}>Active</option>
                                            <option value={0}>Inactive</option>
                                        </Field>
                                        <ErrorMessage className="text-xs text-rose-600" name="status" component="small" />
                                    </div>
                                </div>
                                <div className="pt-1">
                                    <Button type="submit" variant="primary" size="md" fullWidth disabled={isSubmitting}>
                                        {isSubmitting ? "Saving..." : open === "add" ? "Create FAQ" : "Update FAQ"}
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

