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
import { Badge, Button, Input, InputFile, Label, Modal, Select, Option, Textarea } from "@/components/ui";
import AdminPagination from "@/components/admin/AdminPagination";
import { getSweetAlertConfig, resolveFileUrl } from "@/helpers/utils";
import AdminTableHeader from "@/components/admin/AdminTableHeader";
import PermissionBlock from "@/components/admin/PermissionBlock";
import AdminNoTableRecords from "@/components/admin/AdminNoTableRecords";
import Image from "@/components/ui/Image";

type TestimonialRow = {
    _id: string;
    from: "customer" | "provider";
    name: string;
    designation: string;
    image: string | File | null;
    rating: number;
    review: string;
    status: number;
    createdAt?: string;
};

type TestimonialRecord = {
    count: number;
    record: TestimonialRow[];
    totalPages: number;
    pagination: number[];
};

type SortBy = "name" | "designation" | "from" | "rating" | "status" | "createdAt";
type SortOrder = "asc" | "desc";

const initialFormValues: TestimonialRow = { _id: "", from: "customer", name: "", designation: "", image: null, rating: 5, review: "", status: 1 };

const validationSchema = Yup.object().shape({
    from: Yup.string().oneOf(["customer", "provider"], "Select source.").required("Source is required."),
    name: Yup.string().min(2, "Too short.").max(100, "Too long.").required("Name is required.").trim(),
    designation: Yup.string().min(2, "Too short.").max(100, "Too long.").required("Designation is required.").trim(),
    image: Yup.mixed().nullable(),
    rating: Yup.number().min(1, "Minimum is 1.").max(5, "Maximum is 5.").required("Rating required."),
    review: Yup.string().min(3, "Too short.").max(5000, "Too long.").required("Review is required.").trim(),
    status: Yup.number().required("Status required")
});

export default function AdminTestimonialsPage() {
    const debouncedFetchRef = useRef(debounce(() => { }, 0));
    const [open, setOpen] = useState<null | "add" | "edit">(null);
    const [data, setData] = useState<TestimonialRecord>({ count: 0, record: [], totalPages: 0, pagination: [] });
    const [param, setParam] = useState<{ limit: number; pageNo: number; query: string; sortBy: SortBy; sortOrder: SortOrder; status: "" | 0 | 1; from: "" | "customer" | "provider"; }>({ limit: 10, pageNo: 1, query: "", sortBy: "createdAt", sortOrder: "desc", status: "", from: "" });
    const [initialValues, setInitialValues] = useState<TestimonialRow>(initialFormValues);

    const fetchTestimonials = useCallback(async () => {
        const { data } = await AxiosHelperAdmin.getData("/testimonials", param);
        if (data.status && data.data) {
            const { count, totalPages, record, pagination } = data.data;
            setData({ count, totalPages, record, pagination });
        } else {
            setData({ count: 0, totalPages: 0, record: [], pagination: [] });
        }
    }, [param]);

    useEffect(() => {
        debouncedFetchRef.current = debounce(() => { fetchTestimonials(); }, 500);
    }, [fetchTestimonials]);

    useEffect(() => {
        debouncedFetchRef.current();
        return () => { debouncedFetchRef.current.cancel(); };
    }, [param]);

    const handleDelete = async (id: string) => {
        const { isConfirmed } = await Swal.fire(getSweetAlertConfig({}));
        if (isConfirmed) {
            const { data } = await AxiosHelperAdmin.deleteData(`/testimonials/${id}`);
            if (data.status) {
                toast.success(data.message);
                fetchTestimonials();
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
                title="Testimonials"
                subtitle="Manage customer and provider testimonials shown on the public website."
                action={
                    <PermissionBlock permission_id={421}>
                        <Button
                            type="button"
                            variant="primary"
                            size="md"
                            onClick={() => {
                                setInitialValues(initialFormValues);
                                setOpen("add");
                            }}
                        >
                            <Plus className="h-3.5 w-3.5" />
                            Create Testimonial
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
                        placeholder="Search name, designation, review..."
                    />
                    <div className="flex flex-wrap items-center gap-2">
                        <Select
                            value={param.from}
                            onChange={(e) => {
                                const v = e.target.value as "" | "customer" | "provider";
                                setParam((prev) => ({ ...prev, pageNo: 1, from: v }));
                            }}
                            className="max-w-[180px]"
                        >
                            <Option value="">All Sources</Option>
                            <Option value="customer">Customer</Option>
                            <Option value="provider">Provider</Option>
                        </Select>
                        <Select
                            value={param.status}
                            onChange={(e) => {
                                const v = e.target.value;
                                setParam((prev) => ({ ...prev, pageNo: 1, status: v === "" ? "" : (Number(v) as 0 | 1) }));
                            }}
                            className="max-w-[180px]"
                        >
                            <Option value="">All Status</Option>
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
                                <th className="px-3 py-2">Image</th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("name")} name="Name" active={param.sortBy === "name"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("designation")} name="Designation" active={param.sortBy === "designation"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("from")} name="Source" active={param.sortBy === "from"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("rating")} name="Rating" active={param.sortBy === "rating"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2">Review</th>
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
                                    <td className="px-3 py-2">
                                        <div className="h-10 w-10 overflow-hidden rounded-md border border-slate-200 dark:border-slate-700">
                                            <Image src={resolveFileUrl(row.image as string) || ""} alt={row.name} className="h-full w-full object-cover" />
                                        </div>
                                    </td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.name}</td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.designation}</td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.from === "provider" ? "Provider" : "Customer"}</td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{Number(row.rating || 0).toFixed(1)}</td>
                                    <td className="max-w-[360px] px-3 py-2 text-slate-700 dark:text-slate-200"><span className="line-clamp-2">{row.review}</span></td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                        <Badge variant={row.status === 1 ? "success" : "secondary"} size="sm">
                                            {row.status === 1 ? "Active" : "Inactive"}
                                        </Badge>
                                    </td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.createdAt ? moment(row.createdAt).format("DD-MM-YYYY") : "—"}</td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                        <div className="flex justify-end gap-1.5 sm:gap-2">
                                            <PermissionBlock permission_id={422}>
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => {
                                                        setInitialValues(row);
                                                        setOpen("edit");
                                                    }}
                                                    title="Edit Testimonial"
                                                    aria-label="Edit Testimonial"
                                                >
                                                    <Pencil className="h-4 w-4 shrink-0" strokeWidth={2} />
                                                </Button>
                                            </PermissionBlock>
                                            <PermissionBlock permission_id={423}>
                                                <Button size="sm" variant="danger" onClick={() => handleDelete(row._id)} title="Delete Testimonial" aria-label="Delete Testimonial">
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
                title={open === "add" ? "Create Testimonial" : "Update Testimonial"}
                subTitle="Source, person info, rating, review and status."
                size="lg"
            >
                <div className="space-y-4">
                    <Formik
                        initialValues={initialValues}
                        enableReinitialize
                        validationSchema={validationSchema}
                        onSubmit={async (values, { setSubmitting, resetForm, setErrors }) => {
                            if (open === "add") {
                                const { data } = await AxiosHelperAdmin.postData("/testimonials", values, true);
                                if (data?.status) {
                                    toast.success(data.message);
                                    setOpen(null);
                                    fetchTestimonials();
                                    resetForm();
                                } else {
                                    toast.error(data.message);
                                    setErrors(data.data);
                                }
                            } else {
                                const { data } = await AxiosHelperAdmin.putData(`/testimonials/${values._id}`, values, true);
                                if (data?.status) {
                                    toast.success(data.message);
                                    setOpen(null);
                                    fetchTestimonials();
                                    resetForm();
                                } else {
                                    toast.error(data.message);
                                    setErrors(data.data);
                                }
                            }
                            setSubmitting(false);
                        }}
                    >
                        {({ isSubmitting, values, setFieldValue }) => (
                            <Form className="space-y-3">
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="testimonial-from">Source</Label>
                                        <Field as={Select} id="testimonial-from" name="from">
                                            <Option value="customer">Customer</Option>
                                            <Option value="provider">Provider</Option>
                                        </Field>
                                        <ErrorMessage className="text-xs text-rose-600" name="from" component="small" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="testimonial-rating">Rating</Label>
                                        <Field as={Input} id="testimonial-rating" name="rating" type="number" min={1} max={5} step={0.1} />
                                        <ErrorMessage className="text-xs text-rose-600" name="rating" component="small" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="testimonial-name">Name</Label>
                                        <Field as={Input} id="testimonial-name" name="name" placeholder="Enter name" />
                                        <ErrorMessage className="text-xs text-rose-600" name="name" component="small" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="testimonial-designation">Designation</Label>
                                        <Field as={Input} id="testimonial-designation" name="designation" placeholder="e.g. Home owner / Electrician" />
                                        <ErrorMessage className="text-xs text-rose-600" name="designation" component="small" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="testimonial-image">Image</Label>
                                    <InputFile
                                        id="testimonial-image"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.currentTarget.files?.[0] || null;
                                            setFieldValue("image", file);
                                        }}
                                    />
                                    <ErrorMessage className="text-xs text-rose-600" name="image" component="small" />
                                </div>
                                {typeof values.image === "string" && values.image ? (
                                    <div className="h-16 w-16 overflow-hidden rounded-md border border-slate-200 dark:border-slate-700">
                                        <Image src={resolveFileUrl(values.image) || ""} alt="Current" className="h-full w-full object-cover" />
                                    </div>
                                ) : null}
                                <div className="space-y-2">
                                    <Label htmlFor="testimonial-review">Review</Label>
                                    <Field as={Textarea} id="testimonial-review" name="review" className="min-h-28" placeholder="Enter review" />
                                    <ErrorMessage className="text-xs text-rose-600" name="review" component="small" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="testimonial-status">Status</Label>
                                    <Field as={Select} id="testimonial-status" name="status">
                                        <Option value={1}>Active</Option>
                                        <Option value={0}>Inactive</Option>
                                    </Field>
                                    <ErrorMessage className="text-xs text-rose-600" name="status" component="small" />
                                </div>
                                <div className="pt-1">
                                    <Button type="submit" variant="primary" size="md" fullWidth disabled={isSubmitting}>
                                        {isSubmitting ? "Saving..." : open === "add" ? "Create Testimonial" : "Update Testimonial"}
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
