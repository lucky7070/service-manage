"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ErrorMessage, Field, Form, Formik, type FieldProps } from "formik";
import { debounce } from "lodash";
import * as Yup from "yup";
import moment from "moment";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { ImageIcon, Pencil, Plus, Trash2 } from "lucide-react";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AxiosHelperAdmin from "@/helpers/AxiosHelperAdmin";
import { Badge, Button, Input, InputFile, Label, Modal, Select, Textarea } from "@/components/ui";
import Image from "@/components/ui/Image";
import AdminPagination from "@/components/admin/AdminPagination";
import { getSweetAlertConfig, resolveFileUrl, slugify } from "@/helpers/utils";
import AdminTableHeader from "@/components/admin/AdminTableHeader";
import PermissionBlock from "@/components/admin/PermissionBlock";
import AdminNoTableRecords from "@/components/admin/AdminNoTableRecords";
type CategoryRow = {
    _id: string;
    slug: string;
    name: string;
    nameHi?: string | null;
    image?: string | null;
    description?: string | null;
    displayOrder: number;
    status: number;
    createdAt?: string;
};

type ServiceCategoryFormValues = {
    _id: string;
    slug: string;
    name: string;
    nameHi: string;
    description: string;
    displayOrder: number | "";
    status: number;
    image: string | null;
};

type CategoryRecord = {
    count: number;
    record: CategoryRow[];
    totalPages: number;
    pagination: number[];
};

type SortBy = "name" | "slug" | "status" | "displayOrder" | "createdAt";
type SortOrder = "asc" | "desc";

const validationSchema = Yup.object().shape({
    name: Yup.string().min(2, "Too short.").max(100, "Too long.").required("Name is required.").trim(),
    slug: Yup.string()
        .max(100, "Too long.")
        .test("slug", "Lowercase letters, numbers, hyphens only.", (v) => !v || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v)),
    nameHi: Yup.string().max(200, "Too long.").nullable(),
    description: Yup.string().max(5000, "Too long.").nullable(),
    displayOrder: Yup.mixed().test("ord", "Must be ≥ 0", (v) => {
        if (v === "" || v === undefined || v === null) return true;
        const n = Number(v);
        return !Number.isNaN(n) && n >= 0;
    }),
    status: Yup.number().required("Status required")
});

export default function AdminServiceCategoriesPage() {
    const debouncedFetchRef = useRef(debounce(() => { }, 0));
    const [open, setOpen] = useState<null | "add" | "edit">(null);
    const [data, setData] = useState<CategoryRecord>({ count: 0, record: [], totalPages: 0, pagination: [] });
    const [param, setParam] = useState<{ limit: number; pageNo: number; query: string; sortBy: SortBy; sortOrder: SortOrder; status: "" | 0 | 1; }>({ limit: 10, pageNo: 1, query: "", sortBy: "displayOrder", sortOrder: "asc", status: "" });
    const [initialValues, setInitialValues] = useState<ServiceCategoryFormValues>({ _id: "", slug: "", name: "", nameHi: "", description: "", displayOrder: 0, status: 1, image: null });
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const fetchRows = useCallback(async () => {
        const { data } = await AxiosHelperAdmin.getData("/service-categories", param);
        if (data.status && data.data) {
            const { count, totalPages, record, pagination } = data.data;
            setData({ count, totalPages, record, pagination });
        } else {
            setData({ count: 0, totalPages: 0, record: [], pagination: [] });
        }
    }, [param]);

    useEffect(() => {
        debouncedFetchRef.current = debounce(() => { fetchRows(); }, 500);
    }, [fetchRows]);

    useEffect(() => {
        debouncedFetchRef.current();
        return () => { debouncedFetchRef.current.cancel(); };
    }, [param]);

    const resetImage = () => { setImagePreview(null) };

    const handleDelete = async (id: string) => {
        const { isConfirmed } = await Swal.fire(getSweetAlertConfig({}));
        if (isConfirmed) {
            const { data } = await AxiosHelperAdmin.deleteData(`/service-categories/${id}`);
            if (data.status) {
                toast.success(data.message);
                fetchRows();
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

    const openAdd = () => {
        resetImage();
        setInitialValues({ _id: "", slug: "", name: "", nameHi: "", description: "", displayOrder: 0, status: 1, image: null });
        setOpen("add");
    };

    const openEdit = async (id: string) => {
        resetImage();
        const { data } = await AxiosHelperAdmin.getData(`/service-categories/${id}`);
        if (data.status && data.data) {
            const r = data.data;
            setInitialValues({ _id: r._id, slug: r.slug, name: r.name, nameHi: r.nameHi ?? "", description: r.description ?? "", displayOrder: r.displayOrder ?? 0, status: r.status, image: r.image ?? null });
            setImagePreview(resolveFileUrl(r.image) || null);
            setOpen("edit");
        } else {
            toast.error(data?.message || "Could not load category.");
        }
    };

    return (
        <section className="space-y-4">
            <AdminPageHeader
                title="Service Categories"
                subtitle="Trade groups such as Plumber, Electrician, Cleaning, or AC repair. Add specific jobs (tap repair, AC service, …) under Service types."
                action={
                    <PermissionBlock permission_id={351}>
                        <Button type="button" variant="primary" size="md" onClick={openAdd}>
                            <Plus className="h-3.5 w-3.5" />
                            Create category
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
                        placeholder="Search name or slug..."
                    />
                    <div className="flex items-center gap-2">
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
                                <th className="px-3 py-2 w-12" />
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("name")} name="Name" active={param.sortBy === "name"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("slug")} name="Slug" active={param.sortBy === "slug"} sortOrder={param.sortOrder} />
                                </th>
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
                            {data.record.map((row) => {
                                const thumb = resolveFileUrl(row.image);
                                return (
                                    <tr key={row._id} className="border-t border-indigo-100 dark:border-slate-700">
                                        <td className="px-3 py-2">
                                            <div className="relative h-9 w-9 overflow-hidden rounded-lg border border-indigo-100 bg-slate-100 dark:border-slate-600 dark:bg-slate-800">
                                                {thumb ? (
                                                    <Image src={thumb} alt="" className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-slate-400">
                                                        <ImageIcon className="h-4 w-4" />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.name}</td>
                                        <td className="px-3 py-2 font-mono text-xs text-slate-600 dark:text-slate-300">{row.slug}</td>
                                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.displayOrder}</td>
                                        <td className="px-3 py-2">
                                            <Badge variant={row.status === 1 ? "success" : "secondary"} size="sm">
                                                {row.status === 1 ? "Active" : "Inactive"}
                                            </Badge>
                                        </td>
                                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.createdAt ? moment(row.createdAt).format("DD-MM-YYYY") : "—"}</td>
                                        <td className="px-3 py-2">
                                            <div className="flex justify-end gap-1.5 sm:gap-2">
                                                <PermissionBlock permission_id={352}>
                                                    <Button size="sm" variant="secondary" onClick={() => openEdit(row._id)} title="Edit" aria-label="Edit">
                                                        <Pencil className="h-4 w-4 shrink-0" strokeWidth={2} />
                                                    </Button>
                                                </PermissionBlock>
                                                <PermissionBlock permission_id={353}>
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
                onClose={() => {
                    setOpen(null);
                    resetImage();
                }}
                title={open === "add" ? "Create category" : "Update category"}
                subTitle="URL slug, labels, sort order, and optional image."
                size="lg"
                scrollable
            >
                <div className="space-y-4">
                    <Formik
                        initialValues={initialValues}
                        enableReinitialize
                        validationSchema={validationSchema}
                        onSubmit={async (values, { setSubmitting, resetForm, setErrors }) => {
                            if (open === "add") {
                                const { data } = await AxiosHelperAdmin.postData("/service-categories", values, true);
                                if (data?.status) {
                                    toast.success(data.message);
                                    setOpen(null);
                                    resetImage();
                                    fetchRows();
                                    resetForm();
                                } else {
                                    toast.error(data.message);
                                    setErrors(data.data);
                                }
                            } else {
                                const { data } = await AxiosHelperAdmin.putData(`/service-categories/${values._id}`, values, true);
                                if (data?.status) {
                                    toast.success(data.message);
                                    setOpen(null);
                                    resetImage();
                                    fetchRows();
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
                                <div className="space-y-2">
                                    <Label>Image <span className="font-normal text-slate-500">(optional)</span></Label>
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-indigo-100 bg-slate-100 dark:border-slate-600 dark:bg-slate-800">
                                            {(imagePreview || resolveFileUrl(values.image)) ? <Image
                                                src={imagePreview || resolveFileUrl(values.image) || ""}
                                                alt=""
                                                className="h-full w-full object-cover"
                                            /> : <div className="flex h-full w-full items-center justify-center text-slate-400">
                                                <ImageIcon className="h-8 w-8" />
                                            </div>}
                                        </div>
                                        <InputFile accept="image/*"
                                            onChange={(e) => {
                                                const f = e.target.files?.[0] ?? null;
                                                setFieldValue('image', f);
                                                if (imagePreview && imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
                                                if (f) {
                                                    setImagePreview(URL.createObjectURL(f));
                                                } else {
                                                    setImagePreview(resolveFileUrl(values.image));
                                                }
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="sc-name">Name (English)</Label>
                                    <Field name="name">
                                        {({ field, form }: FieldProps<string>) => (
                                            <Input
                                                {...field}
                                                id="sc-name"
                                                placeholder="e.g. Home services"
                                                onBlur={(e) => {
                                                    field.onBlur(e);
                                                    if (!form.values._id && !form.values.slug?.trim()) {
                                                        form.setFieldValue("slug", slugify(e.target.value));
                                                    }
                                                }}
                                            />
                                        )}
                                    </Field>
                                    <ErrorMessage className="text-xs text-rose-600" name="name" component="small" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="sc-slug">Slug</Label>
                                    <Field
                                        as={Input}
                                        id="sc-slug"
                                        name="slug"
                                        className="font-mono"
                                        placeholder="Auto-filled from name"
                                    />
                                    <ErrorMessage className="text-xs text-rose-600" name="slug" component="small" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="sc-nameHi">Name (Hindi) <span className="font-normal text-slate-500">optional</span></Label>
                                    <Field as={Input} id="sc-nameHi" name="nameHi" />
                                    <ErrorMessage className="text-xs text-rose-600" name="nameHi" component="small" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="sc-desc">Description <span className="font-normal text-slate-500">optional</span></Label>
                                    <Field as={Textarea} id="sc-desc" name="description" rows={3} />
                                    <ErrorMessage className="text-xs text-rose-600" name="description" component="small" />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="sc-order">Display order</Label>
                                        <Field as={Input} id="sc-order" name="displayOrder" type="number" min={0} />
                                        <ErrorMessage className="text-xs text-rose-600" name="displayOrder" component="small" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="sc-status">Status</Label>
                                        <Field as={Select} id="sc-status" name="status">
                                            <option value={1}>Active</option>
                                            <option value={0}>Inactive</option>
                                        </Field>
                                        <ErrorMessage className="text-xs text-rose-600" name="status" component="small" />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <Button type="button" variant="ghost" size="md" className="border border-indigo-100 dark:border-indigo-100" onClick={() => { setOpen(null); resetImage(); }}>
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
