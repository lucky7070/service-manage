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
import AsyncFormSelect, { type AsyncSelectOption } from "@/components/ui/AsyncFormSelect";
import AdminNoTableRecords from "@/components/admin/AdminNoTableRecords";

type CountryOption = AsyncSelectOption;

type StateType = {
    _id: string;
    countryId: string;
    countryName?: string;
    name: string;
    status: number;
    createdAt?: string;
};

type StateRecord = {
    count: number;
    record: StateType[];
    totalPages: number;
    pagination: number[];
};

type SortBy = "name" | "countryName" | "status" | "createdAt";
type SortOrder = "asc" | "desc";

const validationSchema = Yup.object().shape({
    countryId: Yup.string().required("Country required."),
    name: Yup.string().min(2, "Too Short!").max(100, "Too Long!").required("State name required.").trim(),
    status: Yup.number().required("Status required")
});

export default function AdminStatesPage() {
    const debouncedFetchRef = useRef(debounce(() => { }, 0));
    const [open, setOpen] = useState<null | "add" | "edit">(null);
    const [selectedCountry, setSelectedCountry] = useState<CountryOption | null>(null);
    const [data, setData] = useState<StateRecord>({ count: 0, record: [], totalPages: 0, pagination: [] });
    const [param, setParam] = useState<{ limit: number; pageNo: number; query: string; sortBy: SortBy; sortOrder: SortOrder; status: "" | 0 | 1 }>({
        limit: 10,
        pageNo: 1,
        query: "",
        sortBy: "createdAt",
        sortOrder: "desc",
        status: ""
    });
    const [initialValues, setInitialValues] = useState<StateType>({ _id: "", countryId: "", name: "", status: 1 });

    const fetchStates = useCallback(async () => {
        const { data } = await AxiosHelperAdmin.getData("/states", param);
        if (data.status && data.data) {
            const { count, totalPages, record, pagination } = data.data;
            setData({ count, totalPages, record, pagination });
        } else {
            setData({ count: 0, totalPages: 0, record: [], pagination: [] });
        }
    }, [param]);

    const loadCountryOptions = useCallback(async (inputValue: string) => {
        const { data } = await AxiosHelperAdmin.getData("/countries", {
            limit: 20,
            status: 1,
            query: inputValue || "",
            sortBy: "name",
            sortOrder: "asc"
        });

        if (data?.status && data?.data?.record && Array.isArray(data.data.record)) {
            return data.data.record.map((country: { _id: string; name: string }) => ({
                value: country._id,
                label: country.name
            }));
        }

        return [];
    }, []);

    useEffect(() => {
        debouncedFetchRef.current = debounce(() => { fetchStates() }, 500);
    }, [fetchStates]);

    useEffect(() => {
        debouncedFetchRef.current();
        return () => { debouncedFetchRef.current.cancel() };
    }, [param]);

    const handleDelete = async (id: string) => {
        const { isConfirmed } = await Swal.fire(getSweetAlertConfig({}));
        if (isConfirmed) {
            const { data } = await AxiosHelperAdmin.deleteData(`/states/${id}`);
            if (data.status) {
                toast.success(data.message);
                fetchStates();
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
                title="States"
                subtitle="Manage states linked to countries."
                action={
                    <PermissionBlock permission_id={311}>
                        <Button type="button" variant="primary" size="md" onClick={() => {
                            setInitialValues({ _id: "", countryId: "", name: "", status: 1 });
                            setSelectedCountry(null);
                            setOpen("add");
                        }}>
                            <Plus className="h-3.5 w-3.5" />
                            Create State
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
                        placeholder="Search State..."
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
                                    <AdminTableHeader onClick={() => onSort("countryName")} name="Country" active={param.sortBy === "countryName"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("name")} name="State" active={param.sortBy === "name"} sortOrder={param.sortOrder} />
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
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.countryName || "-"}</td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.name}</td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                        <Badge variant={row.status === 1 ? "success" : "secondary"} size="sm">
                                            {row.status === 1 ? "Active" : "Inactive"}
                                        </Badge>
                                    </td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.createdAt ? moment(row.createdAt).format("DD-MM-YYYY") : "-"}</td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                        <div className="flex justify-end gap-1.5 sm:gap-2">
                                            <PermissionBlock permission_id={312}>
                                                <Button size="sm" variant="secondary"
                                                    onClick={() => {
                                                        setInitialValues(row);
                                                        setSelectedCountry(row.countryId ? { value: row.countryId, label: row.countryName || "Selected Country" } : null);
                                                        setOpen("edit");
                                                    }}
                                                    title="Edit state"
                                                    aria-label="Edit state"
                                                >
                                                    <Pencil className="h-4 w-4 shrink-0" strokeWidth={2} />
                                                </Button>
                                            </PermissionBlock>
                                            <PermissionBlock permission_id={313}>
                                                <Button size="sm" variant="danger" onClick={() => handleDelete(row._id)} title="Delete state" aria-label="Delete state">
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
                title={open === "add" ? "Create State" : "Update State"}
                subTitle="Select country, then add state name and status."
                size="md"
            >
                <div className="space-y-4">
                    <Formik
                        initialValues={initialValues}
                        enableReinitialize
                        validationSchema={validationSchema}
                        onSubmit={async (values, { setSubmitting, resetForm, setErrors }) => {
                            if (open === "add") {
                                const { data } = await AxiosHelperAdmin.postData("/states", values);
                                if (data?.status) {
                                    toast.success(data.message);
                                    setOpen(null);
                                    fetchStates();
                                    resetForm();
                                } else {
                                    toast.error(data.message);
                                    setErrors(data.data || {});
                                }
                            } else {
                                const { data } = await AxiosHelperAdmin.putData(`/states/${values._id}`, values);
                                if (data?.status) {
                                    toast.success(data.message);
                                    setOpen(null);
                                    fetchStates();
                                    resetForm();
                                } else {
                                    toast.error(data.message);
                                    setErrors(data.data || {});
                                }
                            }
                            setSubmitting(false);
                        }}
                    >
                        {({ isSubmitting, setFieldValue }) => (
                            <Form className="space-y-3">
                                <div className="space-y-2">
                                    <Label htmlFor="state-country">Country</Label>
                                    <AsyncFormSelect
                                        inputId="state-country"
                                        loadOptions={loadCountryOptions}
                                        value={selectedCountry}
                                        onChange={(option) => {
                                            setSelectedCountry(option);
                                            setFieldValue("countryId", option?.value || "");
                                        }}
                                        placeholder="Search Country..."
                                    />
                                    <ErrorMessage className="text-xs text-rose-600" name="countryId" component="small" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="state-name">State Name</Label>
                                    <Field as={Input} id="state-name" name="name" placeholder="e.g. Uttar Pradesh" />
                                    <ErrorMessage className="text-xs text-rose-600" name="name" component="small" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="state-status">Status</Label>
                                    <Field as={Select}
                                        id="state-status"
                                        name="status"
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
            </Modal>
        </section>
    );
}

