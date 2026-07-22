"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ErrorMessage, Field, Form, Formik, type FormikProps } from "formik";
import { debounce } from "lodash";
import * as Yup from "yup";
import moment from "moment";
import Swal from "sweetalert2/dist/sweetalert2.js";
import { toast } from "react-toastify";
import { Copy, Pencil, Plus, Trash2 } from "lucide-react";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AxiosHelperAdmin from "@/helpers/AxiosHelperAdmin";
import { Badge, Button, Input, Label, Modal, Select, Option } from "@/components/ui";
import AdminPagination from "@/components/admin/AdminPagination";
import { getSweetAlertConfig } from "@/helpers/utils";
import AdminTableHeader from "@/components/admin/AdminTableHeader";
import PermissionBlock from "@/components/admin/PermissionBlock";
import AsyncSelect, { type SelectOption } from "@/components/ui/AsyncSelect";
import AdminNoTableRecords from "@/components/admin/AdminNoTableRecords";

type CountryOption = SelectOption;
type StateOption = SelectOption;
type CityOption = SelectOption;

type AreaType = {
    _id: string;
    countryId: string;
    stateId: string;
    cityId: string;
    countryName?: string;
    stateName?: string;
    cityName?: string;
    name: string;
    status: number;
    createdAt?: string;
};

type AreaRecord = {
    count: number;
    record: AreaType[];
    totalPages: number;
    pagination: number[];
};

type SortBy = "name" | "countryName" | "stateName" | "cityName" | "status" | "createdAt";
type SortOrder = "asc" | "desc";

const validationSchema = Yup.object().shape({
    countryId: Yup.string().required("Country required."),
    stateId: Yup.string().required("State required."),
    cityId: Yup.string().required("City required."),
    name: Yup.string().min(2, "Too Short!").max(100, "Too Long!").required("Area name required.").trim(),
    status: Yup.number().required("Status required")
});

const emptyInitialValues: AreaType = { _id: "", countryId: "", stateId: "", cityId: "", name: "", status: 1 };

export default function AdminAreasPage() {
    const debouncedFetchRef = useRef(debounce(() => { }, 0));
    const [open, setOpen] = useState<null | "add" | "edit">(null);
    const [selectedCountry, setSelectedCountry] = useState<CountryOption | null>(null);
    const [selectedState, setSelectedState] = useState<StateOption | null>(null);
    const [selectedCity, setSelectedCity] = useState<CityOption | null>(null);
    const [data, setData] = useState<AreaRecord>({ count: 0, record: [], totalPages: 0, pagination: [] });
    const [param, setParam] = useState<{ limit: number; pageNo: number; query: string; sortBy: SortBy; sortOrder: SortOrder; status: "" | 0 | 1 }>({
        limit: 10,
        pageNo: 1,
        query: "",
        sortBy: "createdAt",
        sortOrder: "desc",
        status: ""
    });
    const [initialValues, setInitialValues] = useState<AreaType>(emptyInitialValues);

    const fetchAreas = useCallback(async () => {
        const { data } = await AxiosHelperAdmin.getData("/areas", param);
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
            return data.data.record.map((country: { _id: string; name: string }) => ({ value: country._id, label: country.name }));
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

    const loadCityOptions = useCallback(async (inputValue: string) => {
        if (!selectedCountry?.value || !selectedState?.value) return [];

        const { data } = await AxiosHelperAdmin.getData("/cities", {
            limit: 20,
            status: 1,
            countryId: selectedCountry.value,
            stateId: selectedState.value,
            query: inputValue || "",
            sortBy: "name",
            sortOrder: "asc"
        });

        if (data?.status && data?.data?.record && Array.isArray(data.data.record)) {
            return data.data.record.map((city: { _id: string; name: string }) => ({
                value: city._id,
                label: city.name
            }));
        }

        return [];
    }, [selectedCountry, selectedState]);

    useEffect(() => {
        debouncedFetchRef.current = debounce(() => { fetchAreas() }, 500);
    }, [fetchAreas]);

    useEffect(() => {
        debouncedFetchRef.current();
        return () => { debouncedFetchRef.current.cancel() };
    }, [param]);

    const handleDelete = async (id: string) => {
        const { isConfirmed } = await Swal.fire(getSweetAlertConfig({}));
        if (isConfirmed) {
            const { data } = await AxiosHelperAdmin.deleteData(`/areas/${id}`);
            if (data.status) {
                toast.success(data.message);
                fetchAreas();
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
                title="Areas"
                subtitle="Manage areas linked to cities, states, and countries."
                action={
                    <PermissionBlock permission_id={325}>
                        <Button type="button" variant="primary" size="md" onClick={() => {
                            setInitialValues(emptyInitialValues);
                            setSelectedCountry(null);
                            setSelectedState(null);
                            setSelectedCity(null);
                            setOpen("add");
                        }}>
                            <Plus className="h-3.5 w-3.5" />
                            Create Area
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
                        placeholder="Search Area..."
                    />
                    <div className="flex items-center gap-2">
                        <Select
                            value={param.status}
                            onChange={(e) => {
                                const v = e.target.value;
                                setParam((prev) => ({ ...prev, pageNo: 1, status: v === "" ? "" : (Number(v) as 0 | 1) }));
                            }}
                            className="max-w-45"
                        >
                            <Option value="">All</Option>
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
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("countryName")} name="Country" active={param.sortBy === "countryName"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("stateName")} name="State" active={param.sortBy === "stateName"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("cityName")} name="City" active={param.sortBy === "cityName"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("name")} name="Area" active={param.sortBy === "name"} sortOrder={param.sortOrder} />
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
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.cityName || "-"}</td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.name}</td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                        <Badge variant={row.status === 1 ? "success" : "secondary"} size="sm">
                                            {row.status === 1 ? "Active" : "Inactive"}
                                        </Badge>
                                    </td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.createdAt ? moment(row.createdAt).format("DD-MM-YYYY") : "-"}</td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                        <div className="flex justify-end gap-1.5 sm:gap-2">
                                            <PermissionBlock permission_id={325}>
                                                <Button size="sm" variant="secondary" type="button" title="Copy area" aria-label="Copy area" onClick={() => {
                                                    setInitialValues(row);
                                                    setSelectedCountry(row.countryId ? { value: row.countryId, label: row.countryName || "Selected Country" } : null);
                                                    setSelectedState(row.stateId ? { value: row.stateId, label: row.stateName || "Selected State" } : null);
                                                    setSelectedCity(row.cityId ? { value: row.cityId, label: row.cityName || "Selected City" } : null);
                                                    setOpen("add");
                                                }}>
                                                    <Copy className="h-4 w-4 shrink-0" strokeWidth={2} />
                                                </Button>
                                            </PermissionBlock>
                                            <PermissionBlock permission_id={326}>
                                                <Button size="sm" variant="secondary"
                                                    onClick={async () => {
                                                        setInitialValues(row);
                                                        setSelectedCountry(row.countryId ? { value: row.countryId, label: row.countryName || "Selected Country" } : null);
                                                        setSelectedState(row.stateId ? { value: row.stateId, label: row.stateName || "Selected State" } : null);
                                                        setSelectedCity(row.cityId ? { value: row.cityId, label: row.cityName || "Selected City" } : null);
                                                        setOpen("edit");
                                                    }}
                                                    title="Edit area"
                                                    aria-label="Edit area"
                                                >
                                                    <Pencil className="h-4 w-4 shrink-0" strokeWidth={2} />
                                                </Button>
                                            </PermissionBlock>
                                            <PermissionBlock permission_id={327}>
                                                <Button size="sm" variant="danger" onClick={() => handleDelete(row._id)} title="Delete area" aria-label="Delete area">
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
                title={open === "add" ? "Create Area" : "Update Area"}
                subTitle="Select country, state, and city, then add area name and status."
                size="md"
            >
                <div className="space-y-4">
                    <Formik
                        initialValues={initialValues}
                        enableReinitialize
                        validationSchema={validationSchema}
                        onSubmit={async (values, { setSubmitting, resetForm, setErrors }) => {
                            if (open === "add") {
                                const { data } = await AxiosHelperAdmin.postData("/areas", values);
                                if (data?.status) {
                                    toast.success(data.message);
                                    setOpen(null);
                                    fetchAreas();
                                    resetForm();
                                } else {
                                    toast.error(data.message);
                                    setErrors(data.data || {});
                                }
                            } else {
                                const { data } = await AxiosHelperAdmin.putData(`/areas/${values._id}`, values);
                                if (data?.status) {
                                    toast.success(data.message);
                                    setOpen(null);
                                    fetchAreas();
                                    resetForm();
                                } else {
                                    toast.error(data.message);
                                    setErrors(data.data || {});
                                }
                            }
                            setSubmitting(false);
                        }}
                    >
                        {(formik: FormikProps<AreaType>) => (
                            <Form className="space-y-3">
                                <div className="space-y-2">
                                    <Label htmlFor="area-country">Country</Label>
                                    <AsyncSelect
                                        inputId="area-country"
                                        loadOptions={loadCountryOptions}
                                        value={selectedCountry}
                                        onChange={(option) => {
                                            setSelectedCountry(option);
                                            setSelectedState(null);
                                            setSelectedCity(null);
                                            formik.setFieldValue("countryId", option?.value || "");
                                            formik.setFieldValue("stateId", "");
                                            formik.setFieldValue("cityId", "");
                                        }}
                                        placeholder="Search Country..."
                                    />
                                    <ErrorMessage className="text-xs text-rose-600" name="countryId" component="small" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="area-state">State</Label>
                                    <AsyncSelect
                                        inputId="area-state"
                                        loadOptions={loadStateOptions}
                                        value={selectedState}
                                        isDisabled={!selectedCountry?.value}
                                        onChange={(option) => {
                                            setSelectedState(option);
                                            setSelectedCity(null);
                                            formik.setFieldValue("stateId", option?.value || "");
                                            formik.setFieldValue("cityId", "");
                                        }}
                                        placeholder={selectedCountry?.value ? "Search State..." : "Select Country First"}
                                    />
                                    <ErrorMessage className="text-xs text-rose-600" name="stateId" component="small" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="area-city">City</Label>
                                    <AsyncSelect
                                        inputId="area-city"
                                        loadOptions={loadCityOptions}
                                        value={selectedCity}
                                        isDisabled={!selectedState?.value}
                                        onChange={(option) => {
                                            setSelectedCity(option);
                                            formik.setFieldValue("cityId", option?.value || "");
                                        }}
                                        placeholder={selectedState?.value ? "Search City..." : "Select State First"}
                                    />
                                    <ErrorMessage className="text-xs text-rose-600" name="cityId" component="small" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="area-name">Area Name</Label>
                                    <Field as={Input} id="area-name" name="name" placeholder="e.g. Andheri West" autoComplete="off" />
                                    <ErrorMessage className="text-xs text-rose-600" name="name" component="small" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="area-status">Status</Label>
                                    <Field as={Select}
                                        id="area-status"
                                        name="status"
                                    >
                                        <Option value={1}>Active</Option>
                                        <Option value={0}>Inactive</Option>
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
