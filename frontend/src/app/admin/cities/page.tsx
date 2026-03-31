"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ErrorMessage, Field, Form, Formik, type FormikProps } from "formik";
import { debounce } from "lodash";
import * as Yup from "yup";
import moment from "moment";
import Swal from "sweetalert2";
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

type CountryOption = AsyncSelectOption;
type StateOption = AsyncSelectOption;

type CityType = {
    _id: string;
    countryId: string;
    stateId: string;
    countryName?: string;
    stateName?: string;
    name: string;
    status: number;
    createdAt?: string;
};

type CityRecord = {
    count: number;
    record: CityType[];
    totalPages: number;
    pagination: number[];
};

type SortBy = "name" | "countryName" | "stateName" | "status" | "createdAt";
type SortOrder = "asc" | "desc";

const validationSchema = Yup.object().shape({
    countryId: Yup.string().required("Country required."),
    stateId: Yup.string().required("State required."),
    name: Yup.string().min(2, "Too Short!").max(100, "Too Long!").required("City name required.").trim(),
    status: Yup.number().required("Status required")
});

const emptyInitialValues: CityType = { _id: "", countryId: "", stateId: "", name: "", status: 1 };

export default function AdminCitiesPage() {
    const debouncedFetchRef = useRef(debounce(() => { }, 0));
    const [open, setOpen] = useState<null | "add" | "edit">(null);
    const [selectedCountry, setSelectedCountry] = useState<CountryOption | null>(null);
    const [selectedState, setSelectedState] = useState<StateOption | null>(null);
    const [data, setData] = useState<CityRecord>({ count: 0, record: [], totalPages: 0, pagination: [] });
    const [param, setParam] = useState<{ limit: number; pageNo: number; query: string; sortBy: SortBy; sortOrder: SortOrder; status: "" | 0 | 1 }>({
        limit: 10,
        pageNo: 1,
        query: "",
        sortBy: "createdAt",
        sortOrder: "desc",
        status: ""
    });
    const [initialValues, setInitialValues] = useState<CityType>(emptyInitialValues);

    const fetchCities = useCallback(async () => {
        const { data } = await AxiosHelperAdmin.getData("/cities", param);
        if (data.status && data.data) {
            const { count, totalPages, record, pagination } = data.data;
            setData({ count, totalPages, record, pagination });
        } else {
            setData({ count: 0, totalPages: 0, record: [], pagination: [] });
        }
    }, [param]);

    const loadCountryOptions = useCallback(async (inputValue: string) => {
        const { data } = await AxiosHelperAdmin.getData("/countries", { limit: 20, status: 1, query: inputValue || "", sortBy: "name", sortOrder: "asc" });
        if (data?.status && data?.data?.record && Array.isArray(data.data.record)) {
            return data.data.record.map((country: { _id: string; name: string }) => ({
                value: country._id,
                label: country.name
            }));
        }

        return [];
    }, []);

    const loadStateOptions = useCallback(async (inputValue: string) => {
        if (!selectedCountry?.value) return [];

        const { data } = await AxiosHelperAdmin.getData("/states", {
            limit: 20,
            status: 1,
            countryId: selectedCountry.value,
            query: inputValue || "",
            sortBy: "name",
            sortOrder: "asc"
        });

        if (data?.status && data?.data?.record && Array.isArray(data.data.record)) {
            return data.data.record.map((state: { _id: string; name: string }) => ({
                value: state._id,
                label: state.name
            }));
        }

        return [];
    }, [selectedCountry]);

    useEffect(() => {
        debouncedFetchRef.current = debounce(() => { fetchCities() }, 500);
    }, [fetchCities]);

    useEffect(() => {
        debouncedFetchRef.current();
        return () => { debouncedFetchRef.current.cancel() };
    }, [param]);

    const handleDelete = async (id: string) => {
        const { isConfirmed } = await Swal.fire(getSweetAlertConfig({}));
        if (isConfirmed) {
            const { data } = await AxiosHelperAdmin.deleteData(`/cities/${id}`);
            if (data.status) {
                toast.success(data.message);
                fetchCities();
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
                title="Cities"
                subtitle="Manage cities linked to states and countries."
                action={
                    <PermissionBlock permission_id={321}>
                        <Button type="button" variant="primary" size="md" onClick={() => {
                            setInitialValues(emptyInitialValues);
                            setSelectedCountry(null);
                            setSelectedState(null);
                            setOpen("add");
                        }}>
                            <Plus className="h-3.5 w-3.5" />
                            Create City
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
                        placeholder="Search City..."
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
                                    <AdminTableHeader onClick={() => onSort("stateName")} name="State" active={param.sortBy === "stateName"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("name")} name="City" active={param.sortBy === "name"} sortOrder={param.sortOrder} />
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
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.stateName || "-"}</td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.name}</td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                        <Badge variant={row.status === 1 ? "success" : "secondary"} size="sm">
                                            {row.status === 1 ? "Active" : "Inactive"}
                                        </Badge>
                                    </td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.createdAt ? moment(row.createdAt).format("DD-MM-YYYY") : "-"}</td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                        <div className="flex justify-end gap-1.5 sm:gap-2">
                                            <PermissionBlock permission_id={322}>
                                                <Button size="sm" variant="secondary"
                                                    onClick={async () => {
                                                        setInitialValues(row);
                                                        setSelectedCountry(row.countryId ? { value: row.countryId, label: row.countryName || "Selected Country" } : null);
                                                        setSelectedState(row.stateId ? { value: row.stateId, label: row.stateName || "Selected State" } : null);
                                                        setOpen("edit");
                                                    }}
                                                    title="Edit city"
                                                    aria-label="Edit city"
                                                >
                                                    <Pencil className="h-4 w-4 shrink-0" strokeWidth={2} />
                                                </Button>
                                            </PermissionBlock>
                                            <PermissionBlock permission_id={323}>
                                                <Button size="sm" variant="danger" onClick={() => handleDelete(row._id)} title="Delete city" aria-label="Delete city">
                                                    <Trash2 className="h-4 w-4 shrink-0" strokeWidth={2} />
                                                </Button>
                                            </PermissionBlock>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {!data.record.length ? <tr>
                                <td colSpan={6} className="px-3 py-6 text-center text-slate-500 dark:text-slate-400">
                                    No Records Available.
                                </td>
                            </tr> : null}
                        </tbody>
                    </table>
                </div>
                <AdminPagination data={data} param={param} setParam={setParam} />
            </div>

            <Modal
                show={!!open}
                onClose={() => setOpen(null)}
                title={open === "add" ? "Create City" : "Update City"}
                subTitle="Select country and state, then add city name and status."
                size="md"
            >
                <div className="space-y-4">
                            <Formik
                                initialValues={initialValues}
                                enableReinitialize
                                validationSchema={validationSchema}
                                onSubmit={async (values, { setSubmitting, resetForm, setErrors }) => {
                                    if (open === "add") {
                                        const { data } = await AxiosHelperAdmin.postData("/cities", values);
                                        if (data?.status) {
                                            toast.success(data.message);
                                            setOpen(null);
                                            fetchCities();
                                            resetForm();
                                        } else {
                                            toast.error(data.message);
                                            setErrors(data.data || {});
                                        }
                                    } else {
                                        const { data } = await AxiosHelperAdmin.putData(`/cities/${values._id}`, values);
                                        if (data?.status) {
                                            toast.success(data.message);
                                            setOpen(null);
                                            fetchCities();
                                            resetForm();
                                        } else {
                                            toast.error(data.message);
                                            setErrors(data.data || {});
                                        }
                                    }
                                    setSubmitting(false);
                                }}
                            >
                                {(formik: FormikProps<CityType>) => (
                                    <Form className="space-y-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="city-country">Country</Label>
                                            <AsyncFormSelect
                                                inputId="city-country"
                                                loadOptions={loadCountryOptions}
                                                value={selectedCountry}
                                                onChange={(option) => {
                                                    setSelectedCountry(option);
                                                    setSelectedState(null);
                                                    formik.setFieldValue("countryId", option?.value || "");
                                                    formik.setFieldValue("stateId", "");
                                                }}
                                                placeholder="Search Country..."
                                            />
                                            <ErrorMessage className="text-xs text-rose-600" name="countryId" component="small" />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="city-state">State</Label>
                                            <AsyncFormSelect
                                                inputId="city-state"
                                                loadOptions={loadStateOptions}
                                                value={selectedState}
                                                isDisabled={!selectedCountry?.value}
                                                onChange={(option) => {
                                                    setSelectedState(option);
                                                    formik.setFieldValue("stateId", option?.value || "");
                                                }}
                                                placeholder={selectedCountry?.value ? "Search State..." : "Select Country First"}
                                            />
                                            <ErrorMessage className="text-xs text-rose-600" name="stateId" component="small" />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="city-name">City Name</Label>
                                            <Field as={Input} id="city-name" name="name" placeholder="e.g. Lucknow" />
                                            <ErrorMessage className="text-xs text-rose-600" name="name" component="small" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="city-status">Status</Label>
                                            <Field as={Select}
                                                id="city-status"
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
                                            <Button disabled={formik.isSubmitting} type="submit" variant="primary" size="md">
                                                {formik.isSubmitting ? "Saving..." : "Save"}
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

