"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { debounce } from "lodash";
import * as Yup from "yup";
import moment from "moment";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import Link from "next/link";
import { Fingerprint, Pencil, Plus, Trash2 } from "lucide-react";

import AdminPageHeader from "../../../components/admin/AdminPageHeader";
import AxiosHelperAdmin from "@/helpers/AxiosHelperAdmin";
import { Badge, Button } from "@/components/ui";
import AdminPagination from "@/components/admin/AdminPagination";
import { Role } from "../roles/page";
import { getSweetAlertConfig } from "@/helpers/utils";
import AdminTableHeader from "@/components/admin/AdminTableHeader";
import PermissionBlock from "@/components/admin/PermissionBlock";

type AdminRecord = {
    _id: string;
    userId?: string;
    name: string;
    mobile: string;
    email?: string | null;
    roleId: string;
    roleName?: string | null;
    permissionsCount?: number;
    status: number;
    createdAt?: string;
};

type AdminRecordResponse = {
    count: number;
    record: AdminRecord[];
    totalPages: number;
    pagination: number[];
};

type SortBy = "name" | "roleName" | "status" | "mobile" | "email" | "createdAt";
type SortOrder = "asc" | "desc";

const validationSchema = Yup.object().shape({
    name: Yup.string().min(2, "Too Short!").max(100, "Too Long!").required("Name Required.").trim(),
    mobile: Yup.string().matches(/^\d{7,15}$/, "Mobile must be digits (7-15 chars)").required("Mobile Required."),
    email: Yup.string().email("Invalid email").required("Email Required."),
    roleId: Yup.string().required("Role is required"),
    status: Yup.number().required("Status required"),
    password: Yup.string()
        .optional()
        .nullable()
        .transform((v) => (v === "" ? null : v))
        .test("password-required-on-add", "Password is required", function (value) {
            const { _id } = this.parent as { _id: string };
            if (!_id) return Boolean(value);

            return true;
        })
        .test("password-length", "Password must be between 5 and 50 chars", function (value) {
            if (!value) return true;
            return value.length >= 5 && value.length <= 50;
        })
});

export default function AdminUsersPage() {
    const debouncedFetchRef = useRef(debounce(() => { }, 0));
    const [open, setOpen] = useState<null | "add" | "edit">(null);
    const [data, setData] = useState<AdminRecordResponse>({ count: 0, record: [], totalPages: 0, pagination: [] });

    const [roles, setRoles] = useState<Role[]>([]);
    const [param, setParam] = useState<{ limit: number; pageNo: number; query: string; sortBy: SortBy; sortOrder: SortOrder; status: "" | 0 | 1; }>({ limit: 10, pageNo: 1, query: "", sortBy: "createdAt", sortOrder: "desc", status: "" });
    const [initialValues, setInitialValues] = useState<AdminRecord & { password?: string }>({ _id: "", name: "", mobile: "", email: "", roleId: "", roleName: null, status: 1, createdAt: "", permissionsCount: 0, password: "" });

    const fetchAdmins = useCallback(async () => {
        const { data } = await AxiosHelperAdmin.getData("/admins", param);
        if (data?.status && data?.data?.record) {
            setData(data.data);
        } else {
            setData({ count: 0, record: [], totalPages: 0, pagination: [] });
        }
    }, [param]);

    useEffect(() => {
        (async () => {
            const { data } = await AxiosHelperAdmin.getData("/roles", { limit: 100 });
            if (data?.status && data?.data?.record && Array.isArray(data?.data?.record)) {
                setRoles(data.data.record);
            } else {
                setRoles([]);
            }
        })()
    }, []);

    useEffect(() => {
        debouncedFetchRef.current = debounce(() => { fetchAdmins() }, 500);
        debouncedFetchRef.current();
        return () => {
            debouncedFetchRef.current.cancel();
        };
    }, [fetchAdmins]);

    const handleDelete = async (id: string) => {
        const { isConfirmed } = await Swal.fire(getSweetAlertConfig({}));
        if (isConfirmed) {
            const { data } = await AxiosHelperAdmin.deleteData(`/admins/${id}`);
            if (data?.status) {
                toast.success(data.message);
                fetchAdmins();
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
                title="Sub Admins"
                subtitle="Create/update sub admins and assign role permissions."
                action={
                    <PermissionBlock permission_id={201}>
                        <Button
                            type="button"
                            variant="primary"
                            size="md"
                            onClick={() => {
                                setInitialValues({ _id: "", name: "", mobile: "", email: "", roleId: "", roleName: null, permissionsCount: 0, status: 1, createdAt: "", password: "" });
                                setOpen("add");
                            }}
                        >
                            <Plus className="h-3.5 w-3.5" />
                            Create Admin
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
                        placeholder="Search Admin..."
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
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("name")} name="Name" active={param.sortBy === "name"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("roleName")} name="Role" active={param.sortBy === "roleName"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("mobile")} name="Mobile" active={param.sortBy === "mobile"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("email")} name="Email" active={param.sortBy === "email"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("status")} name="Status" active={param.sortBy === "status"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("createdAt")} name="Created Date" active={param.sortBy === "createdAt"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.record.map((row) => (
                                <tr key={row._id} className="border-t border-indigo-100 dark:border-slate-700">
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.name}</td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.roleName || "-"}</td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.mobile}</td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.email || "-"}</td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                        <Badge variant={row.status === 1 ? "success" : "secondary"} size="sm">
                                            {row.status === 1 ? "Active" : "Inactive"}
                                        </Badge>
                                    </td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.createdAt ? moment(row.createdAt).format("DD-MM-YYYY") : "-"}</td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                        <div className="flex justify-end gap-1.5 sm:gap-2">
                                            <PermissionBlock permission_id={205}>
                                                <Link href={`/admin/admins/permissions/${row._id}`}>
                                                    <Button size="sm" variant="primary" title="Assign permissions" aria-label="Assign permissions">
                                                        <Fingerprint className="h-4 w-4 shrink-0" strokeWidth={2} />
                                                    </Button>
                                                </Link>
                                            </PermissionBlock>
                                            <PermissionBlock permission_id={202}>
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => {
                                                        setInitialValues({
                                                            ...row,
                                                            email: row.email || "",
                                                            roleId: row.roleId || "",
                                                            password: ""
                                                        });
                                                        setOpen("edit");
                                                    }}
                                                    title="Edit sub admin"
                                                    aria-label="Edit sub admin"
                                                >
                                                    <Pencil className="h-4 w-4 shrink-0" strokeWidth={2} />
                                                </Button>
                                            </PermissionBlock>
                                            <PermissionBlock permission_id={203}>
                                                <Button size="sm" variant="danger" onClick={() => handleDelete(row._id)} title="Delete sub admin" aria-label="Delete sub admin">
                                                    <Trash2 className="h-4 w-4 shrink-0" strokeWidth={2} />
                                                </Button>
                                            </PermissionBlock>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {!data.record.length ? (
                                <tr>
                                    <td colSpan={7} className="px-3 py-6 text-center text-slate-500 dark:text-slate-400">
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
                    <div
                        data-slot="card"
                        className="w-full max-w-md rounded-xl border border-indigo-100 bg-white text-slate-900 shadow-xl transition-shadow duration-200 dark:border-indigo-100 dark:bg-slate-900 dark:text-slate-100"
                    >
                        <div data-slot="card-header" className="flex flex-col space-y-1.5 p-6">
                            <h3 className="font-semibold leading-none tracking-tight">{open === "add" ? "Create Sub Admin" : "Update Sub Admin"}</h3>
                            <p className="text-sm text-muted-foreground">Pick a role; permissions will be assigned automatically.</p>
                        </div>

                        <div data-slot="card-content" className="space-y-4 p-6 pt-0">
                            <Formik
                                initialValues={initialValues}
                                enableReinitialize
                                validationSchema={validationSchema}
                                onSubmit={async (values, { setSubmitting, resetForm, setErrors }) => {
                                    if (open === "add") {
                                        const { data } = await AxiosHelperAdmin.postData("/admins", values);
                                        if (data.status) {
                                            toast.success(data.message);
                                            setOpen(null);
                                            fetchAdmins();
                                            resetForm();
                                        } else {
                                            toast.error(data.message);
                                            setErrors(data.data || {});
                                        }
                                    } else {
                                        const { data: data } = await AxiosHelperAdmin.putData(`/admins/${values._id}`, values);
                                        if (data.status) {
                                            toast.success(data.message);
                                            setOpen(null);
                                            fetchAdmins();
                                            resetForm();
                                        } else {
                                            toast.error(data.message);
                                            setErrors(data.data || {});
                                        }
                                    }

                                    setSubmitting(false);
                                }}
                            >
                                {({ isSubmitting }) => (
                                    <Form className="space-y-3">
                                        <div className="space-y-2">
                                            <label htmlFor="admin-role" data-slot="label" className="flex items-center gap-2 text-sm font-medium leading-none select-none">
                                                Role
                                            </label>
                                            <Field
                                                as="select"
                                                id="admin-role"
                                                name="roleId"
                                                data-slot="input"
                                                className="h-9 w-full min-w-0 rounded-md border border-indigo-100 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-indigo-400 focus-visible:ring-[3px] focus-visible:ring-indigo-200 dark:border-indigo-100 dark:bg-slate-800 dark:text-slate-100"
                                            >
                                                <option value="">Select Role</option>
                                                {roles.map((r) => (
                                                    <option key={r._id} value={r._id}>
                                                        {r.name}
                                                    </option>
                                                ))}
                                            </Field>
                                            <ErrorMessage className="text-xs text-rose-600" name="roleId" component="small" />
                                        </div>
                                        <div className="space-y-2">
                                            <label
                                                htmlFor="admin-name"
                                                data-slot="label"
                                                className="flex items-center gap-2 text-sm font-medium leading-none select-none"
                                            >
                                                Name
                                            </label>
                                            <Field
                                                id="admin-name"
                                                name="name"
                                                data-slot="input"
                                                className="h-9 w-full min-w-0 rounded-md border border-indigo-100 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs outline-none transition-[color,box-shadow] placeholder:text-slate-400 focus-visible:border-indigo-400 focus-visible:ring-[3px] focus-visible:ring-indigo-200 dark:border-indigo-100 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400"
                                                placeholder="e.g. Sub Admin"
                                            />
                                            <ErrorMessage className="text-xs text-rose-600" name="name" component="small" />
                                        </div>

                                        <div className="space-y-2">
                                            <label
                                                htmlFor="admin-mobile"
                                                data-slot="label"
                                                className="flex items-center gap-2 text-sm font-medium leading-none select-none"
                                            >
                                                Mobile
                                            </label>
                                            <Field
                                                id="admin-mobile"
                                                name="mobile"
                                                data-slot="input"
                                                className="h-9 w-full min-w-0 rounded-md border border-indigo-100 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs outline-none transition-[color,box-shadow] placeholder:text-slate-400 focus-visible:border-indigo-400 focus-visible:ring-[3px] focus-visible:ring-indigo-200 dark:border-indigo-100 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400"
                                                placeholder="e.g. 9876543210"
                                            />
                                            <ErrorMessage className="text-xs text-rose-600" name="mobile" component="small" />
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="admin-email" data-slot="label" className="flex items-center gap-2 text-sm font-medium leading-none select-none">
                                                Email
                                            </label>
                                            <Field
                                                id="admin-email"
                                                name="email"
                                                type="email"
                                                autoFill="off"
                                                data-slot="input"
                                                className="h-9 w-full min-w-0 rounded-md border border-indigo-100 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs outline-none transition-[color,box-shadow] placeholder:text-slate-400 focus-visible:border-indigo-400 focus-visible:ring-[3px] focus-visible:ring-indigo-200 dark:border-indigo-100 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400"
                                                placeholder="e.g. subadmin@email.com"
                                            />
                                            <ErrorMessage className="text-xs text-rose-600" name="email" component="small" />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="admin-password" data-slot="label" className="flex items-center gap-2 text-sm font-medium leading-none select-none">
                                                Password
                                            </label>
                                            <Field
                                                id="admin-password"
                                                name="password"
                                                type="password"
                                                data-slot="input"
                                                autoFill="off"
                                                className="h-9 w-full min-w-0 rounded-md border border-indigo-100 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs outline-none transition-[color,box-shadow] placeholder:text-slate-400 focus-visible:border-indigo-400 focus-visible:ring-[3px] focus-visible:ring-indigo-200 dark:border-indigo-100 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400"
                                                placeholder="Create password"
                                            />
                                            <ErrorMessage className="text-xs text-rose-600" name="password" component="small" />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="admin-status" data-slot="label" className="flex items-center gap-2 text-sm font-medium leading-none select-none">
                                                Status
                                            </label>
                                            <Field
                                                as="select"
                                                id="admin-status"
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
                                                onClick={() => setOpen(null)}
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