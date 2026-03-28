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
import { Badge, Button } from "@/components/ui";
import AdminPagination from "@/components/admin/AdminPagination";
import { getSweetAlertConfig, serviceTypeFormToPayload, type ServiceTypeFormValues } from "@/helpers/utils";
import AdminTableHeader from "@/components/admin/AdminTableHeader";
import PermissionBlock from "@/components/admin/PermissionBlock";

type ServiceCategoryOption = { _id: string; name: string; slug?: string };

type ServiceTypeRow = {
    _id: string;
    categoryId: string;
    categoryName: string;
    name: string;
    nameHi?: string | null;
    estimatedTimeMinutes?: number | null;
    basePrice?: number | null;
    description?: string | null;
    status: number;
    createdAt?: string;
};

type ServiceTypeRecord = {
    count: number;
    record: ServiceTypeRow[];
    totalPages: number;
    pagination: number[];
};

type SortBy = "name" | "categoryName" | "status" | "createdAt" | "estimatedTimeMinutes" | "basePrice";
type SortOrder = "asc" | "desc";

const validationSchema = Yup.object().shape({
    categoryId: Yup.string().required("Category is required."),
    name: Yup.string().min(2, "Too short.").max(150, "Too long.").required("Name is required.").trim(),
    nameHi: Yup.string().max(200, "Too long.").nullable(),
    estimatedTimeMinutes: Yup.mixed().test("est", "Must be ≥ 0", (v) => {
        if (v === "" || v === undefined || v === null) return true;
        const n = Number(v);
        return !Number.isNaN(n) && n >= 0;
    }),
    basePrice: Yup.mixed().test("price", "Must be ≥ 0", (v) => {
        if (v === "" || v === undefined || v === null) return true;
        const n = Number(v);
        return !Number.isNaN(n) && n >= 0;
    }),
    description: Yup.string().max(2000, "Too long.").nullable(),
    status: Yup.number().required("Status required")
});

export default function AdminServiceTypesPage() {
    const debouncedFetchRef = useRef(debounce(() => { }, 0));
    const [categories, setCategories] = useState<ServiceCategoryOption[]>([]);
    const [open, setOpen] = useState<null | "add" | "edit">(null);
    const [data, setData] = useState<ServiceTypeRecord>({ count: 0, record: [], totalPages: 0, pagination: [] });
    const [param, setParam] = useState<{
        limit: number;
        pageNo: number;
        query: string;
        sortBy: SortBy;
        sortOrder: SortOrder;
        status: "" | 0 | 1;
        categoryId: string;
    }>({
        limit: 10,
        pageNo: 1,
        query: "",
        sortBy: "createdAt",
        sortOrder: "desc",
        status: "",
        categoryId: ""
    });
    const [initialValues, setInitialValues] = useState<ServiceTypeFormValues>({
        _id: "",
        categoryId: "",
        name: "",
        nameHi: "",
        estimatedTimeMinutes: "",
        basePrice: "",
        description: "",
        status: 1
    });

    useEffect(() => {
        (async () => {
            const { data } = await AxiosHelperAdmin.getData("/service-categories/options");
            if (data?.status && data?.data?.record && Array.isArray(data.data.record)) {
                setCategories(data.data.record);
            } else {
                setCategories([]);
            }
        })();
    }, []);

    const fetchRows = useCallback(async () => {
        const { data } = await AxiosHelperAdmin.getData("/service-types", param);
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

    const handleDelete = async (id: string) => {
        const { isConfirmed } = await Swal.fire(getSweetAlertConfig({}));
        if (isConfirmed) {
            const { data } = await AxiosHelperAdmin.deleteData(`/service-types/${id}`);
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
        setInitialValues({
            _id: "",
            categoryId: categories[0]?._id ?? "",
            name: "",
            nameHi: "",
            estimatedTimeMinutes: "",
            basePrice: "",
            description: "",
            status: 1
        });
        setOpen("add");
    };

    const openEdit = async (id: string) => {
        const { data } = await AxiosHelperAdmin.getData(`/service-types/${id}`);
        if (data?.status && data?.data) {
            const r = data.data;
            setInitialValues({
                _id: r._id,
                categoryId: String(r.categoryId),
                name: r.name,
                nameHi: r.nameHi ?? "",
                estimatedTimeMinutes: r.estimatedTimeMinutes === "" || r.estimatedTimeMinutes == null ? "" : Number(r.estimatedTimeMinutes),
                basePrice: r.basePrice === "" || r.basePrice == null ? "" : Number(r.basePrice),
                description: r.description ?? "",
                status: r.status
            });
            setOpen("edit");
        } else {
            toast.error(data?.message || "Could not load service type.");
        }
    };

    return (
        <section className="space-y-4">
            <AdminPageHeader
                title="Service types"
                subtitle="Concrete jobs (e.g. Tap repair, Split AC repair) under a category such as Plumber or Air Conditioner Repair."
                action={
                    <PermissionBlock permission_id={361}>
                        <Button type="button" variant="primary" size="md" onClick={openAdd} disabled={!categories.length}>
                            <Plus className="h-3.5 w-3.5" />
                            Create service type
                        </Button>
                    </PermissionBlock>
                }
            />

            {!categories.length ? (
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
                    Add at least one <strong>service category</strong> under Master → Service Categories before creating service types.
                </p>
            ) : null}

            <div className="rounded-2xl border border-indigo-100 bg-white p-4 dark:border-indigo-100 dark:bg-slate-900">
                <div className="mb-3 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                    <input
                        value={param.query}
                        onChange={(e) => setParam((prev) => ({ ...prev, pageNo: 1, query: e.target.value }))}
                        data-slot="input"
                        className="h-9 w-full max-w-xs min-w-0 rounded-md border border-indigo-100 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs outline-none transition-[color,box-shadow] placeholder:text-slate-400 focus-visible:border-indigo-400 focus-visible:ring-[3px] focus-visible:ring-indigo-200 dark:border-indigo-100 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400"
                        placeholder="Search by name..."
                    />
                    <div className="flex flex-wrap items-center gap-2">
                        <select
                            value={param.categoryId}
                            onChange={(e) => setParam((prev) => ({ ...prev, pageNo: 1, categoryId: e.target.value }))}
                            className="h-9 max-w-[200px] rounded-md border border-indigo-100 bg-white px-3 text-sm text-slate-900 shadow-xs outline-none dark:border-indigo-100 dark:bg-slate-800 dark:text-slate-100"
                        >
                            <option value="">All categories</option>
                            {categories.map((c) => (
                                <option key={c._id} value={c._id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                        <select
                            value={param.status}
                            onChange={(e) => {
                                const v = e.target.value;
                                setParam((prev) => ({ ...prev, pageNo: 1, status: v === "" ? "" : (Number(v) as 0 | 1) }));
                            }}
                            className="h-9 rounded-md border border-indigo-100 bg-white px-3 text-sm text-slate-900 shadow-xs outline-none dark:border-indigo-100 dark:bg-slate-800 dark:text-slate-100"
                        >
                            <option value="">All</option>
                            <option value={1}>Active</option>
                            <option value={0}>Inactive</option>
                        </select>
                        <div className="text-sm text-slate-500 dark:text-slate-400">Total: {data.count}</div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-[#edf3ff] text-left text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            <tr>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("name")} name="Name" active={param.sortBy === "name"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("categoryName")} name="Category" active={param.sortBy === "categoryName"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2">Name (HI)</th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("estimatedTimeMinutes")} name="Est. min" active={param.sortBy === "estimatedTimeMinutes"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("basePrice")} name="Base price" active={param.sortBy === "basePrice"} sortOrder={param.sortOrder} />
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
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.name}</td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.categoryName || "—"}</td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.nameHi || "—"}</td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.estimatedTimeMinutes != null ? row.estimatedTimeMinutes : "—"}</td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.basePrice != null ? row.basePrice : "—"}</td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                        <Badge variant={row.status === 1 ? "success" : "secondary"} size="sm">
                                            {row.status === 1 ? "Active" : "Inactive"}
                                        </Badge>
                                    </td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.createdAt ? moment(row.createdAt).format("DD-MM-YYYY") : "—"}</td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                        <div className="flex justify-end gap-1.5 sm:gap-2">
                                            <PermissionBlock permission_id={362}>
                                                <Button size="sm" variant="secondary" onClick={() => openEdit(row._id)} title="Edit" aria-label="Edit">
                                                    <Pencil className="h-4 w-4 shrink-0" strokeWidth={2} />
                                                </Button>
                                            </PermissionBlock>
                                            <PermissionBlock permission_id={363}>
                                                <Button size="sm" variant="danger" onClick={() => handleDelete(row._id)} title="Delete" aria-label="Delete">
                                                    <Trash2 className="h-4 w-4 shrink-0" strokeWidth={2} />
                                                </Button>
                                            </PermissionBlock>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {!data.record.length ? (
                                <tr>
                                    <td colSpan={8} className="px-3 py-6 text-center text-slate-500 dark:text-slate-400">
                                        No Records Available.
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>
                <AdminPagination data={data} param={param} setParam={setParam} />
            </div>

            {open ? (
                <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]">
                    <div data-slot="card" className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-indigo-100 bg-white text-slate-900 shadow-xl dark:border-indigo-100 dark:bg-slate-900 dark:text-slate-100">
                        <div data-slot="card-header" className="flex flex-col space-y-1.5 p-6">
                            <h3 className="font-semibold leading-none tracking-tight">{open === "add" ? "Create service type" : "Update service type"}</h3>
                            <p className="text-sm text-muted-foreground">Link to a category and set name, optional Hindi label, time and price hints.</p>
                        </div>
                        <div data-slot="card-content" className="space-y-4 p-6 pt-0">
                            <Formik
                                initialValues={initialValues}
                                enableReinitialize
                                validationSchema={validationSchema}
                                onSubmit={async (values, { setSubmitting, resetForm, setErrors }) => {
                                    const payload = serviceTypeFormToPayload(values);
                                    if (open === "add") {
                                        const { data } = await AxiosHelperAdmin.postData("/service-types", payload);
                                        if (data?.status) {
                                            toast.success(data.message);
                                            setOpen(null);
                                            fetchRows();
                                            resetForm();
                                        } else {
                                            toast.error(data.message);
                                            setErrors(data.data);
                                        }
                                    } else {
                                        const { data } = await AxiosHelperAdmin.putData(`/service-types/${values._id}`, payload);
                                        if (data?.status) {
                                            toast.success(data.message);
                                            setOpen(null);
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
                                {({ isSubmitting }) => (
                                    <Form className="space-y-3">
                                        <div className="space-y-2">
                                            <label htmlFor="st-category" className="flex items-center gap-2 text-sm font-medium leading-none select-none">
                                                Category
                                            </label>
                                            <Field
                                                as="select"
                                                id="st-category"
                                                name="categoryId"
                                                className="h-9 w-full min-w-0 rounded-md border border-indigo-100 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs outline-none dark:border-indigo-100 dark:bg-slate-800 dark:text-slate-100"
                                            >
                                                <option value="">Select category</option>
                                                {categories.map((c) => (
                                                    <option key={c._id} value={c._id}>
                                                        {c.name}
                                                    </option>
                                                ))}
                                            </Field>
                                            <ErrorMessage className="text-xs text-rose-600" name="categoryId" component="small" />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="st-name" className="flex items-center gap-2 text-sm font-medium leading-none select-none">
                                                Name (English)
                                            </label>
                                            <Field
                                                id="st-name"
                                                name="name"
                                                className="h-9 w-full min-w-0 rounded-md border border-indigo-100 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs outline-none dark:border-indigo-100 dark:bg-slate-800 dark:text-slate-100"
                                                placeholder="e.g. Tap Repair"
                                            />
                                            <ErrorMessage className="text-xs text-rose-600" name="name" component="small" />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="st-nameHi" className="flex items-center gap-2 text-sm font-medium leading-none select-none">
                                                Name (Hindi) <span className="font-normal text-slate-500">optional</span>
                                            </label>
                                            <Field
                                                id="st-nameHi"
                                                name="nameHi"
                                                className="h-9 w-full min-w-0 rounded-md border border-indigo-100 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs outline-none dark:border-indigo-100 dark:bg-slate-800 dark:text-slate-100"
                                            />
                                            <ErrorMessage className="text-xs text-rose-600" name="nameHi" component="small" />
                                        </div>
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <label htmlFor="st-est" className="flex items-center gap-2 text-sm font-medium leading-none select-none">
                                                    Est. time (min)
                                                </label>
                                                <Field
                                                    id="st-est"
                                                    name="estimatedTimeMinutes"
                                                    type="number"
                                                    min={0}
                                                    className="h-9 w-full min-w-0 rounded-md border border-indigo-100 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs outline-none dark:border-indigo-100 dark:bg-slate-800 dark:text-slate-100"
                                                    placeholder="Optional"
                                                />
                                                <ErrorMessage className="text-xs text-rose-600" name="estimatedTimeMinutes" component="small" />
                                            </div>
                                            <div className="space-y-2">
                                                <label htmlFor="st-price" className="flex items-center gap-2 text-sm font-medium leading-none select-none">
                                                    Base price
                                                </label>
                                                <Field
                                                    id="st-price"
                                                    name="basePrice"
                                                    type="number"
                                                    min={0}
                                                    step="0.01"
                                                    className="h-9 w-full min-w-0 rounded-md border border-indigo-100 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs outline-none dark:border-indigo-100 dark:bg-slate-800 dark:text-slate-100"
                                                    placeholder="Optional"
                                                />
                                                <ErrorMessage className="text-xs text-rose-600" name="basePrice" component="small" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="st-desc" className="flex items-center gap-2 text-sm font-medium leading-none select-none">
                                                Description <span className="font-normal text-slate-500">optional</span>
                                            </label>
                                            <Field
                                                as="textarea"
                                                id="st-desc"
                                                name="description"
                                                rows={3}
                                                className="w-full min-w-0 rounded-md border border-indigo-100 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs outline-none dark:border-indigo-100 dark:bg-slate-800 dark:text-slate-100"
                                            />
                                            <ErrorMessage className="text-xs text-rose-600" name="description" component="small" />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="st-status" className="flex items-center gap-2 text-sm font-medium leading-none select-none">
                                                Status
                                            </label>
                                            <Field
                                                as="select"
                                                id="st-status"
                                                name="status"
                                                className="h-9 w-full min-w-0 rounded-md border border-indigo-100 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs outline-none dark:border-indigo-100 dark:bg-slate-800 dark:text-slate-100"
                                            >
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
                    </div>
                </div>
            ) : null}
        </section>
    );
}
