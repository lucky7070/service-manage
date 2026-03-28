"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "@/components/ui/Image";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { debounce } from "lodash";
import * as Yup from "yup";
import moment from "moment";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { ImageIcon, Pencil, Plus, Trash2 } from "lucide-react";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AxiosHelperAdmin from "@/helpers/AxiosHelperAdmin";
import { Badge, Button } from "@/components/ui";
import AdminPagination from "@/components/admin/AdminPagination";
import { getSweetAlertConfig, resolveFileUrl } from "@/helpers/utils";
import AdminTableHeader from "@/components/admin/AdminTableHeader";
import PermissionBlock from "@/components/admin/PermissionBlock";
import { PHONE_ERROR_MESSAGE, PHONE_REGEXP } from "@/config";

type Customer = {
    _id: string;
    userId?: string | null;
    name: string;
    mobile: string;
    email: string;
    dateOfBirth: string;
    image?: string | null;
    status: number;
    createdAt?: string;
};

type CustomerRecord = {
    count: number;
    record: Customer[];
    totalPages: number;
    pagination: number[];
};

type SortBy = "userId" | "name" | "mobile" | "email" | "dateOfBirth" | "status" | "createdAt";
type SortOrder = "asc" | "desc";

const validationSchema = Yup.object().shape({
    name: Yup.string().min(2, "Too Short!").max(100, "Too Long!").required("Name is required.").trim(),
    mobile: Yup.string().matches(PHONE_REGEXP, PHONE_ERROR_MESSAGE).length(10, 'Mobile number must be exactly 10 digits.').required("Mobile is required."),
    email: Yup.string().email("Invalid email.").required("Email is required."),
    dateOfBirth: Yup.string().required("Date of birth is required."),
    status: Yup.number().required("Status is required.")
});

function buildFormData(values: Customer, imageFile: File | null) {
    const fd = new FormData();
    fd.append("name", values.name.trim());
    fd.append("mobile", values.mobile.trim());
    fd.append("email", values.email.trim());
    fd.append("dateOfBirth", values.dateOfBirth);
    fd.append("status", String(values.status));
    if (imageFile) fd.append("image", imageFile);
    return fd;
}

export default function AdminCustomersPage() {
    const debouncedFetchRef = useRef(debounce(() => { }, 0));
    const [open, setOpen] = useState<null | "add" | "edit">(null);
    const [data, setData] = useState<CustomerRecord>({ count: 0, record: [], totalPages: 0, pagination: [] });
    const [param, setParam] = useState<{ limit: number; pageNo: number; query: string; sortBy: SortBy; sortOrder: SortOrder; status: "" | 0 | 1 }>({
        limit: 10,
        pageNo: 1,
        query: "",
        sortBy: "createdAt",
        sortOrder: "desc",
        status: ""
    });
    const [initialValues, setInitialValues] = useState<Customer>({
        _id: "",
        userId: "",
        name: "",
        mobile: "",
        email: "",
        dateOfBirth: "",
        image: null,
        status: 1
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const fetchCustomers = useCallback(async () => {
        const { data } = await AxiosHelperAdmin.getData("/customers", param);
        if (data.status && data.data) {
            const { count, totalPages, record, pagination } = data.data;
            setData({ count, totalPages, record, pagination });
        } else {
            setData({ count: 0, totalPages: 0, record: [], pagination: [] });
        }
    }, [param]);

    useEffect(() => {
        debouncedFetchRef.current = debounce(() => { fetchCustomers(); }, 500);
    }, [fetchCustomers]);

    useEffect(() => {
        debouncedFetchRef.current();
        return () => { debouncedFetchRef.current.cancel(); };
    }, [param]);

    const resetImageState = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    const handleDelete = async (id: string) => {
        const { isConfirmed } = await Swal.fire(getSweetAlertConfig({}));
        if (isConfirmed) {
            const { data } = await AxiosHelperAdmin.deleteData(`/customers/${id}`);
            if (data.status) {
                toast.success(data.message);
                fetchCustomers();
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
        resetImageState();
        setInitialValues({ _id: "", userId: "", name: "", mobile: "", email: "", dateOfBirth: "", image: null, status: 1 });
        setOpen("add");
    };

    const openEdit = async (id: string) => {
        resetImageState();
        const { data } = await AxiosHelperAdmin.getData(`/customers/${id}`);
        if (data?.status && data?.data) {
            const c = data.data as Customer;
            setInitialValues({
                _id: c._id,
                userId: c.userId ?? "",
                name: c.name,
                mobile: c.mobile,
                email: c.email ?? "",
                dateOfBirth: c.dateOfBirth || "",
                image: c.image ?? null,
                status: c.status,
                createdAt: c.createdAt
            });
            setImagePreview(resolveFileUrl(c.image) || null);
            setOpen("edit");
        } else {
            toast.error(data?.message || "Could not load customer.");
        }
    };

    return (
        <section className="space-y-4">
            <AdminPageHeader
                title="Customers"
                subtitle="Manage customer records: name, contact, date of birth, and profile image."
                action={
                    <PermissionBlock permission_id={331}>
                        <Button type="button" variant="primary" size="md" onClick={openAdd}>
                            <Plus className="h-3.5 w-3.5" />
                            Create Customer
                        </Button>
                    </PermissionBlock>
                }
            />

            <div className="rounded-2xl border border-indigo-100 bg-white p-4 dark:border-indigo-100 dark:bg-slate-900">
                <div className="mb-3 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                    <input
                        value={param.query}
                        onChange={(e) => setParam((prev) => ({ ...prev, pageNo: 1, query: e.target.value }))}
                        data-slot="input"
                        className="h-9 w-full max-w-xs min-w-0 rounded-md border border-indigo-100 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs outline-none transition-[color,box-shadow] placeholder:text-slate-400 focus-visible:border-indigo-400 focus-visible:ring-[3px] focus-visible:ring-indigo-200 dark:border-indigo-100 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400"
                        placeholder="Search name, mobile, email, user ID..."
                    />
                    <div className="flex items-center gap-2">
                        <select
                            value={param.status}
                            onChange={(e) => {
                                const v = e.target.value;
                                setParam((prev) => ({ ...prev, pageNo: 1, status: v === "" ? "" : (Number(v) as 0 | 1) }));
                            }}
                            className="h-9 rounded-md border border-indigo-100 bg-white px-3 text-sm text-slate-900 shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-indigo-400 focus-visible:ring-[3px] focus-visible:ring-indigo-200 dark:border-indigo-100 dark:bg-slate-800 dark:text-slate-100"
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
                                <th className="px-3 py-2 w-14"> </th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("userId")} name="User ID" active={param.sortBy === "userId"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("name")} name="Name" active={param.sortBy === "name"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("mobile")} name="Mobile" active={param.sortBy === "mobile"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("email")} name="Email" active={param.sortBy === "email"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("dateOfBirth")} name="DOB" active={param.sortBy === "dateOfBirth"} sortOrder={param.sortOrder} />
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
                                        <td className="px-3 py-2 align-middle">
                                            <div className="relative h-9 w-9 overflow-hidden rounded-full border border-indigo-100 bg-slate-100 dark:border-slate-600 dark:bg-slate-800">
                                                {thumb ? (
                                                    <Image src={thumb} alt="" className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-slate-400">
                                                        <ImageIcon className="h-4 w-4" />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.userId || "—"}</td>
                                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.name}</td>
                                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.mobile}</td>
                                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.email || "—"}</td>
                                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                            {row.dateOfBirth ? moment(row.dateOfBirth).format("DD-MM-YYYY") : "—"}
                                        </td>
                                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                            <Badge variant={row.status === 1 ? "success" : "secondary"} size="sm">
                                                {row.status === 1 ? "Active" : "Inactive"}
                                            </Badge>
                                        </td>
                                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                            {row.createdAt ? moment(row.createdAt).format("DD-MM-YYYY") : "—"}
                                        </td>
                                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                            <div className="flex justify-end gap-1.5 sm:gap-2">
                                                <PermissionBlock permission_id={332}>
                                                    <Button size="sm" variant="secondary" onClick={() => openEdit(row._id)} title="Edit customer" aria-label="Edit customer">
                                                        <Pencil className="h-4 w-4 shrink-0" strokeWidth={2} />
                                                    </Button>
                                                </PermissionBlock>
                                                <PermissionBlock permission_id={333}>
                                                    <Button size="sm" variant="danger" onClick={() => handleDelete(row._id)} title="Delete customer" aria-label="Delete customer">
                                                        <Trash2 className="h-4 w-4 shrink-0" strokeWidth={2} />
                                                    </Button>
                                                </PermissionBlock>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}

                            {!data.record.length ? (
                                <tr>
                                    <td colSpan={9} className="px-3 py-6 text-center text-slate-500 dark:text-slate-400">
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
                    <div data-slot="card" className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-indigo-100 bg-white text-slate-900 shadow-xl transition-shadow duration-200 dark:border-indigo-100 dark:bg-slate-900 dark:text-slate-100">
                        <div data-slot="card-header" className="flex flex-col space-y-1.5 p-6">
                            <h3 className="font-semibold leading-none tracking-tight">{open === "add" ? "Create Customer" : "Update Customer"}</h3>
                            <p className="text-sm text-muted-foreground">Name, mobile, email, and date of birth are required. Image is optional.</p>
                        </div>
                        <div data-slot="card-content" className="space-y-4 p-6 pt-0">
                            <Formik
                                initialValues={initialValues}
                                enableReinitialize
                                validationSchema={validationSchema}
                                onSubmit={async (values, { setSubmitting, resetForm, setErrors }) => {
                                    const fd = buildFormData(values, imageFile);
                                    if (open === "add") {
                                        const { data } = await AxiosHelperAdmin.postData("/customers", fd, true);
                                        if (data?.status) {
                                            toast.success(data.message);
                                            setOpen(null);
                                            resetImageState();
                                            fetchCustomers();
                                            resetForm();
                                        } else {
                                            toast.error(data.message);
                                            setErrors(data.data);
                                        }
                                    } else {
                                        const { data } = await AxiosHelperAdmin.putData(`/customers/${values._id}`, fd, true);
                                        if (data?.status) {
                                            toast.success(data.message);
                                            setOpen(null);
                                            resetImageState();
                                            fetchCustomers();
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
                                            <label htmlFor="customer-image" className="flex items-center gap-2 text-sm font-medium leading-none select-none">
                                                Profile image <span className="font-normal text-slate-500">(optional)</span>
                                            </label>
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-indigo-100 bg-slate-100 dark:border-slate-600 dark:bg-slate-800">
                                                    {(imagePreview || resolveFileUrl(initialValues.image)) ? (
                                                        <Image
                                                            src={imagePreview || resolveFileUrl(initialValues.image) || ""}
                                                            alt=""
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-slate-400">
                                                            <ImageIcon className="h-8 w-8" />
                                                        </div>
                                                    )}
                                                </div>
                                                <input
                                                    id="customer-image"
                                                    name="image"
                                                    type="file"
                                                    accept="image/*"
                                                    className="text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-indigo-700 dark:text-slate-300 dark:file:bg-indigo-500/15 dark:file:text-indigo-200"
                                                    onChange={(e) => {
                                                        const f = e.target.files?.[0];
                                                        setImageFile(f ?? null);
                                                        if (imagePreview && imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
                                                        if (f) setImagePreview(URL.createObjectURL(f));
                                                        else setImagePreview(resolveFileUrl(initialValues.image));
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="customer-name" className="flex items-center gap-2 text-sm font-medium leading-none select-none">Name</label>
                                            <Field
                                                id="customer-name"
                                                name="name"
                                                data-slot="input"
                                                className="h-9 w-full min-w-0 rounded-md border border-indigo-100 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs outline-none transition-[color,box-shadow] placeholder:text-slate-400 focus-visible:border-indigo-400 focus-visible:ring-[3px] focus-visible:ring-indigo-200 dark:border-indigo-100 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400"
                                                placeholder="Full name"
                                            />
                                            <ErrorMessage className="text-xs text-rose-600" name="name" component="small" />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="customer-mobile" className="flex items-center gap-2 text-sm font-medium leading-none select-none">Mobile</label>
                                            <Field
                                                id="customer-mobile"
                                                name="mobile"
                                                data-slot="input"
                                                className="h-9 w-full min-w-0 rounded-md border border-indigo-100 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs outline-none transition-[color,box-shadow] placeholder:text-slate-400 focus-visible:border-indigo-400 focus-visible:ring-[3px] focus-visible:ring-indigo-200 dark:border-indigo-100 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400"
                                                placeholder="10–15 digits"
                                            />
                                            <ErrorMessage className="text-xs text-rose-600" name="mobile" component="small" />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="customer-email" className="flex items-center gap-2 text-sm font-medium leading-none select-none">Email</label>
                                            <Field
                                                id="customer-email"
                                                name="email"
                                                type="email"
                                                data-slot="input"
                                                className="h-9 w-full min-w-0 rounded-md border border-indigo-100 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs outline-none transition-[color,box-shadow] placeholder:text-slate-400 focus-visible:border-indigo-400 focus-visible:ring-[3px] focus-visible:ring-indigo-200 dark:border-indigo-100 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400"
                                                placeholder="email@example.com"
                                            />
                                            <ErrorMessage className="text-xs text-rose-600" name="email" component="small" />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="customer-dob" className="flex items-center gap-2 text-sm font-medium leading-none select-none">Date of birth</label>
                                            <Field
                                                id="customer-dob"
                                                name="dateOfBirth"
                                                type="date"
                                                data-slot="input"
                                                className="h-9 w-full min-w-0 rounded-md border border-indigo-100 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-indigo-400 focus-visible:ring-[3px] focus-visible:ring-indigo-200 dark:border-indigo-100 dark:bg-slate-800 dark:text-slate-100"
                                            />
                                            <ErrorMessage className="text-xs text-rose-600" name="dateOfBirth" component="small" />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="customer-status" className="flex items-center gap-2 text-sm font-medium leading-none select-none">Status</label>
                                            <Field
                                                as="select"
                                                id="customer-status"
                                                name="status"
                                                data-slot="input"
                                                className="h-9 w-full min-w-0 rounded-md border border-indigo-100 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-indigo-400 focus-visible:ring-[3px] focus-visible:ring-indigo-200 dark:border-indigo-100 dark:bg-slate-800 dark:text-slate-100"
                                            >
                                                <option value={1}>Active</option>
                                                <option value={0}>Inactive</option>
                                            </Field>
                                            <ErrorMessage className="text-xs text-rose-600" name="status" component="small" />
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="md"
                                                className="border border-indigo-100 dark:border-indigo-100"
                                                onClick={() => {
                                                    setOpen(null);
                                                    resetImageState();
                                                }}
                                            >
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
