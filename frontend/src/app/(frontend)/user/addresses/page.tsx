"use client";

import { useCallback, useEffect, useState } from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2/dist/sweetalert2.js";
import { toast } from "react-toastify";
import { Home, Pencil, Plus, Star, Trash2 } from "lucide-react";
import AccountNav from "@/components/front/user/AccountNav";
import AddressLocationPicker from "@/components/front/AddressLocationPicker";
import { Button, FrontAsyncSelect, Input, Label, Select, type FrontSelectOption } from "@/components/front/ui";
import AxiosHelper from "@/helpers/AxiosHelper";
import { getSweetAlertConfig } from "@/helpers/utils";

type AddressValues = {
    _id: string;
    addressLine1: string;
    addressLine2: string;
    landmark: string;
    state: string;
    city: string;
    stateName?: string;
    cityName?: string;
    pincode: string;
    latitude: string;
    longitude: string;
    isDefault: 0 | 1;
    locationType: "home" | "office" | "other";
};

const emptyValues: AddressValues = {
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
    addressLine1: Yup.string().trim().min(2).max(100).required("Address line 1 is required."),
    addressLine2: Yup.string().trim().min(2).max(100).required("Address line 2 is required."),
    landmark: Yup.string().trim().max(200),
    state: Yup.string().required("State is required."),
    city: Yup.string().required("City is required."),
    pincode: Yup.string().trim().matches(/^\d{6}$/, "Pincode must be 6 digits.").required("Pincode is required."),
    latitude: Yup.number().transform((value, originalValue) => originalValue === "" ? null : value).typeError("Latitude must be numeric.").min(-90).max(90).nullable(),
    longitude: Yup.number().transform((value, originalValue) => originalValue === "" ? null : value).typeError("Longitude must be numeric.").min(-180).max(180).nullable(),
    isDefault: Yup.number().oneOf([0, 1]).required(),
    locationType: Yup.string().oneOf(["home", "office", "other"]).required()
});

export default function CustomerAddressesPage() {
    const [rows, setRows] = useState<AddressValues[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState<null | "add" | "edit">(null);
    const [initialValues, setInitialValues] = useState<AddressValues>(emptyValues);
    const [selectedState, setSelectedState] = useState<FrontSelectOption | null>(null);
    const [selectedCity, setSelectedCity] = useState<FrontSelectOption | null>(null);

    const getData = useCallback(async () => {
        const { data } = await AxiosHelper.getData("/customer/addresses");
        if (data.status) setRows(Array.isArray(data.data) ? data.data : []);
        else toast.error(data.message || "Could not load addresses.");
        setLoading(false);
    }, []);

    useEffect(() => {
        const timer = window.setTimeout(() => { void getData(); }, 0);
        return () => window.clearTimeout(timer);
    }, [getData]);

    const loadStateOptions = useCallback(async (inputValue: string): Promise<FrontSelectOption[]> => {
        const { data } = await AxiosHelper.getData("/states-list", { query: inputValue || "", limit: 20 });
        return data.status && Array.isArray(data.data) ? data.data : [];
    }, []);

    const loadCityOptions = useCallback(async (inputValue: string): Promise<FrontSelectOption[]> => {
        if (!selectedState?.value) return [];
        const { data } = await AxiosHelper.getData("/cities-list", { stateId: selectedState.value, query: inputValue || "", limit: 20 });
        return data.status && Array.isArray(data.data) ? data.data : [];
    }, [selectedState]);

    const openAdd = () => {
        setInitialValues(emptyValues);
        setSelectedState(null);
        setSelectedCity(null);
        setOpen("add");
    };

    const openEdit = (row: AddressValues) => {
        setInitialValues({
            ...row,
            latitude: row.latitude == null ? "" : String(row.latitude),
            longitude: row.longitude == null ? "" : String(row.longitude),
            isDefault: row.isDefault ? 1 : 0
        });
        setSelectedState(row.state ? { value: row.state, label: row.stateName || "Selected State" } : null);
        setSelectedCity(row.city ? { value: row.city, label: row.cityName || "Selected City" } : null);
        setOpen("edit");
    };

    const remove = async (row: AddressValues) => {
        const { isConfirmed } = await Swal.fire(getSweetAlertConfig({}));
        if (!isConfirmed) return;

        const { data } = await AxiosHelper.deleteData(`/customer/addresses/${row._id}`);
        if (data.status) {
            toast.success(data.message || "Address deleted.");
            setRows((prev) => prev.filter((item) => item._id !== row._id));
        } else {
            toast.error(data.message || "Could not delete address.");
        }
    };

    return (
        <section className="bg-muted/30 py-10">
            <div className="container mx-auto px-4">
                <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
                    <AccountNav />
                    <div className="min-w-0">
                        <div className="mb-6 flex flex-col justify-between gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center">
                            <div>
                                <h1 className="text-2xl font-bold">My Addresses</h1>
                                <p className="mt-1 text-sm text-muted-foreground">Manage saved service addresses and map coordinates.</p>
                            </div>
                            <Button type="button" onClick={openAdd}>
                                <Plus className="h-4 w-4" /> Add Address
                            </Button>
                        </div>

                        {open ? (
                            <div className="mb-6 rounded-3xl border border-border bg-card p-6 shadow-sm">
                                <h2 className="mb-4 text-lg font-semibold">{open === "add" ? "Add Address" : "Update Address"}</h2>
                                <Formik<AddressValues>
                                    initialValues={initialValues}
                                    enableReinitialize
                                    validationSchema={validationSchema}
                                    onSubmit={async (values, { setSubmitting, setErrors }) => {
                                        const payload = { ...values, latitude: values.latitude === "" ? null : Number(values.latitude), longitude: values.longitude === "" ? null : Number(values.longitude) };
                                        const { data } = open === "edit" ? await AxiosHelper.putData(`/customer/addresses/${values._id}`, payload) : await AxiosHelper.postData("/customer/addresses", payload);
                                        if (data.status) {
                                            toast.success(data.message || "Address saved.");
                                            setOpen(null);
                                            await getData();
                                        } else {
                                            toast.error(data.message || "Could not save address.");
                                            setErrors(data.data || {});
                                        }

                                        setSubmitting(false);
                                    }}
                                >
                                    {({ values, setFieldValue, isSubmitting }) => (
                                        <Form className="space-y-4">
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label htmlFor="address-line-1" required>Address Line 1</Label>
                                                    <Field as={Input} id="address-line-1" name="addressLine1" placeholder="House number, street" />
                                                    <ErrorMessage className="text-xs text-rose-600" name="addressLine1" component="small" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="address-line-2" required>Address Line 2</Label>
                                                    <Field as={Input} id="address-line-2" name="addressLine2" placeholder="Area, apartment, floor" />
                                                    <ErrorMessage className="text-xs text-rose-600" name="addressLine2" component="small" />
                                                </div>
                                            </div>

                                            <div className="grid gap-4 sm:grid-cols-3">
                                                <div className="space-y-2">
                                                    <Label htmlFor="address-landmark">Landmark</Label>
                                                    <Field as={Input} id="address-landmark" name="landmark" placeholder="Nearby landmark" />
                                                    <ErrorMessage className="text-xs text-rose-600" name="landmark" component="small" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="address-state" required>State</Label>
                                                    <FrontAsyncSelect
                                                        inputId="address-state"
                                                        isSearchable
                                                        cacheOptions
                                                        defaultOptions
                                                        value={selectedState}
                                                        loadOptions={loadStateOptions}
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
                                                    <Label htmlFor="address-city" required>City</Label>
                                                    <FrontAsyncSelect
                                                        inputId="address-city"
                                                        isSearchable
                                                        cacheOptions
                                                        defaultOptions
                                                        value={selectedCity}
                                                        loadOptions={loadCityOptions}
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

                                            <div className="grid gap-4 sm:grid-cols-3">
                                                <div className="space-y-2">
                                                    <Label htmlFor="address-pincode" required>Pincode</Label>
                                                    <Field as={Input} id="address-pincode" name="pincode" placeholder="342001" maxLength={6} />
                                                    <ErrorMessage className="text-xs text-rose-600" name="pincode" component="small" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="address-location-type">Location Type</Label>
                                                    <Field as={Select} id="address-location-type" name="locationType">
                                                        <option value="home">Home</option>
                                                        <option value="office">Office</option>
                                                        <option value="other">Other</option>
                                                    </Field>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="address-default">Default Address</Label>
                                                    <Field as={Select} id="address-default" name="isDefault">
                                                        <option value={0}>No</option>
                                                        <option value={1}>Yes</option>
                                                    </Field>
                                                </div>
                                            </div>

                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label htmlFor="address-latitude">Latitude</Label>
                                                    <Field as={Input} id="address-latitude" name="latitude" placeholder="Optional" />
                                                    <ErrorMessage className="text-xs text-rose-600" name="latitude" component="small" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="address-longitude">Longitude</Label>
                                                    <Field as={Input} id="address-longitude" name="longitude" placeholder="Optional" />
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
                                                <Button type="button" variant="outline" onClick={() => setOpen(null)}>Cancel</Button>
                                                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Address"}</Button>
                                            </div>
                                        </Form>
                                    )}
                                </Formik>
                            </div>
                        ) : null}

                        <div className="grid gap-4 md:grid-cols-2">
                            {loading ? <p className="rounded-2xl bg-card p-8 text-center text-muted-foreground md:col-span-2">Loading addresses...</p> : null}
                            {!loading && rows.length === 0 ? <p className="rounded-2xl bg-card p-8 text-center text-muted-foreground md:col-span-2">No addresses saved yet.</p> : null}
                            {rows.map((row) => (
                                <div key={row._id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                                    <div className="mb-3 flex items-start justify-between gap-3">
                                        <div className="flex gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                <Home className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="font-semibold capitalize">{row.locationType}</p>
                                                    {row.isDefault ? <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"><Star className="h-3 w-3" /> Default</span> : null}
                                                </div>
                                                <p className="mt-1 text-sm text-muted-foreground">{row.addressLine1}, {row.addressLine2}</p>
                                                <p className="text-sm text-muted-foreground">{[row.landmark, row.cityName, row.stateName, row.pincode].filter(Boolean).join(", ")}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button type="button" size="icon-sm" variant="outline" onClick={() => openEdit(row)}><Pencil className="h-4 w-4" /></Button>
                                            <Button type="button" size="icon-sm" variant="destructive" onClick={() => void remove(row)}><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
