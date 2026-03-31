"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { debounce } from 'lodash';
import * as Yup from "yup";
import moment from "moment";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { Fingerprint, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import AdminPageHeader from "../../../components/admin/AdminPageHeader";
import AxiosHelperAdmin from "@/helpers/AxiosHelperAdmin";
import { Badge, Button, Input, Label, Select } from "@/components/ui";
import AdminPagination from "@/components/admin/AdminPagination";
import { getSweetAlertConfig } from "@/helpers/utils";
import AdminTableHeader from "@/components/admin/AdminTableHeader";
import PermissionBlock from "@/components/admin/PermissionBlock";

export type Role = {
    _id: string;
    name: string;
    status: number;
    permissions: number[];
    createdAt?: string;
};

type RoleRecord = {
    count: number;
    record: Role[];
    totalPages: number;
    pagination: number[];
};

const validationSchema = Yup.object().shape({
    name: Yup.string().min(2, "Too Short!").max(50, "Too Long!").required("Name Required.").trim(),
    status: Yup.number().required("Status required")
});

type SortBy = "name" | "status" | "createdAt";
type SortOrder = "asc" | "desc";

export default function AdminRolesPage() {
    const debouncedFetchRef = useRef(debounce(() => { }, 0));
    const [open, setOpen] = useState<null | "add" | "edit">(null);
    const [data, setData] = useState<RoleRecord>({ count: 0, record: [], totalPages: 0, pagination: [] });
    const [param, setParam] = useState<{ limit: number; pageNo: number; query: string; sortBy: SortBy; sortOrder: SortOrder; status: "" | 0 | 1 }>({
        limit: 10,
        pageNo: 1,
        query: "",
        sortBy: "createdAt",
        sortOrder: "desc",
        status: ""
    });
    const [initialValues, setInitialValues] = useState<Role>({ _id: "", name: "", status: 1, permissions: [] });

    const fetchRoles = useCallback(async () => {
        const { data } = await AxiosHelperAdmin.getData("/roles", param);
        if (data.status && data.data) {
            const { count, totalPages, record, pagination } = data.data;
            setData({ count, totalPages, record, pagination });
        } else {
            setData({ count: 0, totalPages: 0, record: [], pagination: [] });
        }
    }, [param]);

    useEffect(() => {
        debouncedFetchRef.current = debounce(() => { fetchRoles() }, 500);
    }, [fetchRoles]);

    useEffect(() => {
        debouncedFetchRef.current();
        return () => { debouncedFetchRef.current.cancel() };
    }, [param]);

    const handleDelete = async (id: string) => {
        const { isConfirmed } = await Swal.fire(getSweetAlertConfig({}));
        if (isConfirmed) {
            const { data } = await AxiosHelperAdmin.deleteData(`/roles/${id}`);
            if (data.status) {
                toast.success(data.message);
                fetchRoles();
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
                title="Roles"
                subtitle="Define role structure and assign permissions."
                action={
                    <PermissionBlock permission_id={101}>
                        <Button type="button" variant="primary" size="md" onClick={() => {
                            setInitialValues({ _id: "", name: "", status: 1, permissions: [] });
                            setOpen("add");
                        }} >
                            <Plus className="h-3.5 w-3.5" />
                            Create Role
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
                        placeholder="Search Role..."
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
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("name")} name="Name" active={param.sortBy === "name"} sortOrder={param.sortOrder} />
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
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                        <Badge variant={row.status === 1 ? "success" : "secondary"} size="sm">
                                            {row.status === 1 ? "Active" : "Inactive"}
                                        </Badge>
                                    </td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.createdAt ? moment(row.createdAt).format("DD-MM-YYYY") : "-"}</td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                        <div className="flex justify-end gap-1.5 sm:gap-2">
                                            <PermissionBlock permission_id={105}>
                                                <Link href={`/admin/roles/permissions/${row._id}`}>
                                                    <Button size="sm" variant="primary" title="Assign permissions" aria-label="Assign permissions">
                                                        <Fingerprint className="h-4 w-4 shrink-0" strokeWidth={2} />
                                                    </Button>
                                                </Link>
                                            </PermissionBlock>
                                            <PermissionBlock permission_id={102}>
                                                <Button size="sm" variant="secondary"
                                                    onClick={() => {
                                                        setInitialValues(row);
                                                        setOpen("edit");
                                                    }}
                                                    title="Edit role"
                                                    aria-label="Edit role"
                                                >
                                                    <Pencil className="h-4 w-4 shrink-0" strokeWidth={2} />
                                                </Button>
                                            </PermissionBlock>
                                            <PermissionBlock permission_id={103}>
                                                <Button size="sm" variant="danger" onClick={() => handleDelete(row._id)} title="Delete role" aria-label="Delete role">
                                                    <Trash2 className="h-4 w-4 shrink-0" strokeWidth={2} />
                                                </Button>
                                            </PermissionBlock>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {!data.record.length ? <tr>
                                <td colSpan={4} className="px-3 py-6 text-center text-slate-500 dark:text-slate-400">
                                    No Records Available.
                                </td>
                            </tr> : null}
                        </tbody>
                    </table>
                </div>
                <AdminPagination data={data} param={param} setParam={setParam} />
            </div>

            {open ? (
                <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]">
                    <div data-slot="card" className="w-full max-w-md rounded-xl border border-indigo-100 bg-white text-slate-900 shadow-xl transition-shadow duration-200 dark:border-indigo-100 dark:bg-slate-900 dark:text-slate-100">
                        <div data-slot="card-header" className="flex flex-col space-y-1.5 p-6">
                            <h3 className="font-semibold leading-none tracking-tight">{open === "add" ? "Create Role" : "Update Role"}</h3>
                            <p className="text-sm text-muted-foreground">Define role name and role status.</p>
                        </div>
                        <div data-slot="card-content" className="space-y-4 p-6 pt-0">
                            <Formik
                                initialValues={initialValues}
                                enableReinitialize
                                validationSchema={validationSchema}
                                onSubmit={async (values, { setSubmitting, resetForm, setErrors }) => {
                                    if (open === "add") {
                                        const { data } = await AxiosHelperAdmin.postData("/roles", values);
                                        if (data?.status) {
                                            toast.success(data.message);
                                            setOpen(null);
                                            fetchRoles();
                                            resetForm();
                                        } else {
                                            toast.error(data.message);
                                            setErrors(data.data);
                                        }
                                    } else {
                                        const { data } = await AxiosHelperAdmin.putData(`/roles/${values._id}`, values);
                                        if (data?.status) {
                                            toast.success(data.message);
                                            setOpen(null);
                                            fetchRoles();
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
                                            <Label htmlFor="role-name">Role Name</Label>
                                            <Field as={Input} id="role-name" name="name" placeholder="e.g. Support Manager" />
                                            <ErrorMessage className="text-xs text-rose-600" name="name" component="small" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="role-status">Role Status</Label>
                                            <Field as={Select} id="role-status" name="status">
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