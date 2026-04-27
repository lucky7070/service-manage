"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeftIcon, Pencil, Plus, Trash2 } from "lucide-react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2/dist/sweetalert2.js";
import { toast } from "react-toastify";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AddressLocationPicker from "@/components/admin/AddressLocationPicker";
import PermissionBlock from "@/components/admin/PermissionBlock";
import AxiosHelperAdmin from "@/helpers/AxiosHelperAdmin";
import { Badge, Button, Input, Label, Modal, Option, Select } from "@/components/ui";
import AsyncSelect, { type SelectOption } from "@/components/ui/AsyncSelect";
import { getSweetAlertConfig } from "@/helpers/utils";

interface AddressFormValues {
    _id: string;
    addressLine1: string;
    addressLine2: string;
    landmark: string;
    state: string;
    city: string;
    pincode: string;
    latitude: string;
    longitude: string;
    isDefault: 0 | 1;
    locationType: "home" | "office" | "other";
    stateName?: string;
    cityName?: string;
};

const emptyInitialValues: AddressFormValues = {
    _id: "",
    addressLine1: "",
    addressLine2: "",
    landmark: "",
    state: "",
    city: "",
    pincode: "",
    latitude: "",
    longitude: "",
    isDefault: 0,
    locationType: "home"
};

const validationSchema = Yup.object().shape({
    addressLine1: Yup.string().trim().required("Address line 1 is required."),
    addressLine2: Yup.string().trim().required("Address line 2 is required."),
    landmark: Yup.string().trim().optional(),
    state: Yup.string().required("State is required."),
    city: Yup.string().required("City is required."),
    pincode: Yup.string().trim().required("Pincode is required.").matches(/^\d{6}$/, { message: "Pincode must be 6 digits." }),
    latitude: Yup.number().transform((value, originalValue) => originalValue === "" ? null : value).typeError("Latitude must be numeric.").nullable().notRequired(),
    longitude: Yup.number().transform((value, originalValue) => originalValue === "" ? null : value).typeError("Longitude must be numeric.").nullable().notRequired(),
    isDefault: Yup.number().oneOf([0, 1]).required("Default status is required.").default(0),
    locationType: Yup.string().oneOf(["home", "office", "other"]).required("Location type is required.").default("home")
});

export default function CustomerAddressesPage() {
    const { id: customerId } = useParams();
    const router = useRouter();

    const [customerName, setCustomerName] = useState("");
    const [rows, setRows] = useState<AddressFormValues[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState<null | "add" | "edit">(null);
    const [initialValues, setInitialValues] = useState<AddressFormValues>(emptyInitialValues);
    const [selectedState, setSelectedState] = useState<SelectOption | null>(null);
    const [selectedCity, setSelectedCity] = useState<SelectOption | null>(null);

    const getData = useCallback(async (isLoading = true) => {
        if (!customerId) return;

        setLoading(isLoading);
        const { data } = await AxiosHelperAdmin.getData(`/customers/${customerId}/addresses`);
        if (data.status && data.data) {
            setCustomerName(String(data.data.customer?.name || ""));
            setRows(Array.isArray(data.data.record) ? data.data.record : []);
            setLoading(false);
        } else {
            setLoading(false);
            toast.error(data.message || "Could not load customer addresses.");
            router.push("/admin/customers");
        }
    }, [customerId, router]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            void getData();
        }, 0);
        return () => window.clearTimeout(timer);
    }, [getData]);

    const loadStateOptions = useCallback(async (inputValue: string): Promise<SelectOption[]> => {
        const { data } = await AxiosHelperAdmin.getData("/states", { limit: 20, pageNo: 1, status: 1, query: inputValue || "", sortBy: "name", sortOrder: "asc" });
        if (data.status && Array.isArray(data?.data?.record)) {
            return data.data.record.map((row: { _id: string; name: string }) => ({ value: row._id, label: row.name }));
        }
        return [];
    }, []);

    const loadCityOptions = useCallback(async (inputValue: string): Promise<SelectOption[]> => {
        if (!selectedState?.value) return [];

        const { data } = await AxiosHelperAdmin.getData("/cities", { limit: 20, pageNo: 1, status: 1, stateId: selectedState.value, query: inputValue || "", sortBy: "name", sortOrder: "asc" });
        if (data.status && Array.isArray(data?.data?.record)) {
            return data.data.record.map((row: { _id: string; name: string }) => ({ value: row._id, label: row.name }));
        }
        return [];
    }, [selectedState]);

    const openAdd = () => {
        setInitialValues(emptyInitialValues);
        setSelectedState(null);
        setSelectedCity(null);
        setOpen("add");
    };

    const openEdit = (row: AddressFormValues) => {
        setInitialValues({
            _id: row._id,
            addressLine1: row.addressLine1 || "",
            addressLine2: row.addressLine2 || "",
            landmark: row.landmark || "",
            state: row.state,
            city: row.city,
            pincode: row.pincode || "",
            latitude: row.latitude == null ? "" : String(row.latitude),
            longitude: row.longitude == null ? "" : String(row.longitude),
            isDefault: row.isDefault ? 1 : 0,
            locationType: row.locationType || "home"
        });
        setSelectedState(row.state ? { value: row.state, label: row.stateName || "Selected State" } : null);
        setSelectedCity(row.city ? { value: row.city, label: row.cityName || "Selected City" } : null);
        setOpen("edit");
    };

    const remove = async (row: AddressFormValues) => {
        const { isConfirmed } = await Swal.fire(getSweetAlertConfig({}));
        if (!isConfirmed) return;

        const { data } = await AxiosHelperAdmin.deleteData(`/customers/${customerId}/addresses/${row._id}`);
        if (data.status) {
            toast.success(data.message || "Address removed.");
            setRows((prev) => prev.filter((item) => item._id !== row._id));
        } else {
            toast.error(data.message || "Could not remove address.");
        }
    };

    return (
        <section className="space-y-4">
            <AdminPageHeader
                title="Customer Addresses"
                subtitle={loading ? "Loading..." : customerName ? <>Manage saved addresses for <span className="font-semibold">{customerName}</span>.</> : "Manage customer addresses."}
                action={
                    <div className="flex gap-2">
                        <Link href="/admin/customers">
                            <Button type="button" variant="secondary" size="md">
                                <ArrowLeftIcon className="h-4 w-4" /> Go Back
                            </Button>
                        </Link>
                        <PermissionBlock permission_id={335}>
                            <Button type="button" variant="primary" size="md" onClick={openAdd}>
                                <Plus className="h-4 w-4" /> Add Address
                            </Button>
                        </PermissionBlock>
                    </div>
                }
            />

            <div className="rounded-2xl border border-indigo-100 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/80">
                {loading ? (
                    <p className="py-8 text-center text-slate-500">Loading addresses...</p>
                ) : rows.length === 0 ? (
                    <p className="py-8 text-center text-slate-500 dark:text-slate-400">No addresses added for this customer yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-[#edf3ff] text-left text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                <tr>
                                    <th className="px-3 py-2">Address</th>
                                    <th className="px-3 py-2">City</th>
                                    <th className="px-3 py-2">State</th>
                                    <th className="px-3 py-2">Pincode</th>
                                    <th className="px-3 py-2">Type</th>
                                    <th className="px-3 py-2">Default</th>
                                    <th className="px-3 py-2 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row) => (
                                    <tr key={row._id} className="border-t border-indigo-100 dark:border-slate-700">
                                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                            <div className="font-medium">{row.addressLine1}</div>
                                            {(row.addressLine2 || row.landmark) ? <div className="text-xs text-slate-500">{[row.addressLine2, row.landmark].filter(Boolean).join(", ")}</div> : null}
                                        </td>
                                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.cityName || "—"}</td>
                                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.stateName || "—"}</td>
                                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.pincode || "—"}</td>
                                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                            <Badge variant={row.locationType === "home" ? "success" : row.locationType === "office" ? "info" : "secondary"} size="sm" className="capitalize">
                                                {row.locationType}
                                            </Badge>
                                        </td>
                                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                            <Badge variant={row.isDefault ? "success" : "secondary"} size="sm">
                                                {row.isDefault ? "Yes" : "No"}
                                            </Badge>
                                        </td>
                                        <td className="px-3 py-2">
                                            <div className="flex justify-end gap-2">
                                                <PermissionBlock permission_id={336}>
                                                    <Button type="button" size="sm" variant="secondary" onClick={() => openEdit(row)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </PermissionBlock>
                                                <PermissionBlock permission_id={337}>
                                                    <Button type="button" size="sm" variant="danger" onClick={() => void remove(row)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </PermissionBlock>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Modal show={!!open} onClose={() => setOpen(null)} title={open === "edit" ? "Update Address" : "Add Address"} size="xxl" scrollable>
                <Formik initialValues={initialValues} enableReinitialize validationSchema={validationSchema} onSubmit={async (values, { setSubmitting, setErrors }) => {
                    const payload = {
                        ...values,
                        latitude: values.latitude === "" ? null : Number(values.latitude),
                        longitude: values.longitude === "" ? null : Number(values.longitude),
                        isDefault: values.isDefault
                    };
                    const { data } = open === "edit" ? await AxiosHelperAdmin.putData(`/customers/${customerId}/addresses/${values._id}`, payload) : await AxiosHelperAdmin.postData(`/customers/${customerId}/addresses`, payload);
                    if (data.status) {
                        toast.success(data.message || "Address saved.");
                        setOpen(null);
                        setSubmitting(false);
                        await getData(false);
                    } else {
                        toast.error(data.message || "Could not save address.");
                        setSubmitting(false);
                        setErrors(data.data || {});
                    }
                }}>
                    {({ values, setFieldValue, isSubmitting }) => (
                        <Form className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="address-line-1">Address Line 1</Label>
                                <Field as={Input} id="address-line-1" name="addressLine1" placeholder="House number, street, area" />
                                <ErrorMessage className="text-xs text-rose-600" name="addressLine1" component="small" />
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="address-line-2">Address Line 2</Label>
                                    <Field as={Input} id="address-line-2" name="addressLine2" placeholder="Apartment, floor, etc." />
                                    <ErrorMessage className="text-xs text-rose-600" name="addressLine2" component="small" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address-landmark">Landmark</Label>
                                    <Field as={Input} id="address-landmark" name="landmark" placeholder="Nearby landmark" />
                                    <ErrorMessage className="text-xs text-rose-600" name="landmark" component="small" />
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="address-state">State</Label>
                                    <AsyncSelect
                                        inputId="address-state"
                                        loadOptions={loadStateOptions}
                                        value={selectedState}
                                        onChange={(option) => {
                                            setSelectedState(option);
                                            setSelectedCity(null);
                                            setFieldValue("state", option?.value || "");
                                            setFieldValue("city", "");
                                        }}
                                        placeholder="Search state..."
                                    />
                                    <ErrorMessage className="text-xs text-rose-600" name="state" component="small" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address-city">City</Label>
                                    <AsyncSelect
                                        inputId="address-city"
                                        loadOptions={loadCityOptions}
                                        value={selectedCity}
                                        isDisabled={!selectedState?.value}
                                        onChange={(option) => {
                                            setSelectedCity(option);
                                            setFieldValue("city", option?.value || "");
                                        }}
                                        placeholder={selectedState?.value ? "Search city..." : "Select state first"}
                                    />
                                    <ErrorMessage className="text-xs text-rose-600" name="city" component="small" />
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="address-pincode">Pincode</Label>
                                    <Field as={Input} id="address-pincode" name="pincode" placeholder="342001" />
                                    <ErrorMessage className="text-xs text-rose-600" name="pincode" component="small" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address-location-type">Location Type</Label>
                                    <Field as={Select} id="address-location-type" name="locationType">
                                        <Option value="home">Home</Option>
                                        <Option value="office">Office</Option>
                                        <Option value="other">Other</Option>
                                    </Field>
                                    <ErrorMessage className="text-xs text-rose-600" name="locationType" component="small" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address-is-default">Default Address</Label>
                                    <Field as={Select} id="address-is-default" name="isDefault">
                                        <Option value={0}>No</Option>
                                        <Option value={1}>Yes</Option>
                                    </Field>
                                    <ErrorMessage className="text-xs text-rose-600" name="isDefault" component="small" />
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="address-latitude">Latitude</Label>
                                    <Field as={Input} id="address-latitude" name="latitude" type="text" step="any" placeholder="Optional" />
                                    <ErrorMessage className="text-xs text-rose-600" name="latitude" component="small" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address-longitude">Longitude</Label>
                                    <Field as={Input} id="address-longitude" name="longitude" type="text" step="any" placeholder="Optional" />
                                    <ErrorMessage className="text-xs text-rose-600" name="longitude" component="small" />
                                </div>
                            </div>

                            <AddressLocationPicker
                                latitude={values.latitude}
                                longitude={values.longitude}
                                searchHint={[values.addressLine1, values.addressLine2, values.landmark, selectedCity?.label, selectedState?.label, values.pincode].filter(Boolean).join(", ")}
                                onChange={(latitude, longitude) => {
                                    setFieldValue("latitude", latitude);
                                    setFieldValue("longitude", longitude);
                                }}
                            />

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="ghost" onClick={() => setOpen(null)}>Cancel</Button>
                                <Button type="submit" variant="primary" disabled={isSubmitting}>
                                    {isSubmitting ? "Saving..." : "Save"}
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </Modal>
        </section>
    );
}
