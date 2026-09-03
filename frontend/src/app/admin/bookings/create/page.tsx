"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import moment from "moment";
import { ArrowLeftIcon, Search } from "lucide-react";
import { toast } from "react-toastify";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AddressLocationPicker from "@/components/admin/AddressLocationPicker";
import AxiosHelperAdmin from "@/helpers/AxiosHelperAdmin";
import AxiosHelper from "@/helpers/AxiosHelper";
import { Badge, Button, Input, Label, Option, Select, Textarea } from "@/components/ui";
import AsyncSelect, { type SelectOption } from "@/components/ui/AsyncSelect";
import { PERSON_NAME_ERROR_MESSAGE, PERSON_NAME_REGEXP, PHONE_ERROR_MESSAGE, PHONE_REGEXP } from "@/config";

type ProviderServiceRow = {
    _id: string;
    serviceTypeId: string;
    serviceTypeName: string;
    categoryName?: string;
    price?: number | null;
    status: 0 | 1;
};

type SavedAddress = {
    _id: string;
    addressLine1: string;
    addressLine2?: string;
    landmark?: string;
    state: string;
    city: string;
    stateName?: string;
    cityName?: string;
    pincode?: string;
    latitude?: number | null;
    longitude?: number | null;
    locationType?: "home" | "office" | "other";
    isDefault?: boolean;
};

type FormValues = {
    name: string;
    mobile: string;
    email: string;
    dateOfBirth: string;
    addressMode: "existing" | "new";
    addressId: string;
    addressLine1: string;
    addressLine2: string;
    landmark: string;
    state: string;
    city: string;
    pincode: string;
    latitude: string;
    longitude: string;
    locationType: "home" | "office" | "other";
    isDefault: 0 | 1;
    providerId: string;
    serviceTypeId: string[];
    scheduledTime: string;
    issueDescription: string;
};

const emptyValues: FormValues = {
    name: "",
    mobile: "",
    email: "",
    dateOfBirth: "",
    addressMode: "new",
    addressId: "",
    addressLine1: "",
    addressLine2: "",
    landmark: "",
    state: "",
    city: "",
    pincode: "",
    latitude: "",
    longitude: "",
    locationType: "home",
    isDefault: 1,
    providerId: "",
    serviceTypeId: [],
    scheduledTime: "",
    issueDescription: ""
};

const validationSchema = Yup.object().shape({
    name: Yup.string().trim().min(2, "Too Short!").max(100, "Too Long!").matches(PERSON_NAME_REGEXP, PERSON_NAME_ERROR_MESSAGE).required("Name is required."),
    mobile: Yup.string().matches(PHONE_REGEXP, PHONE_ERROR_MESSAGE).length(10, "Mobile number must be exactly 10 digits.").required("Mobile is required."),
    email: Yup.string().trim().email("Invalid email.").transform((v) => v || undefined).optional(),
    dateOfBirth: Yup.string().trim().transform((v) => v || undefined).optional(),
    addressMode: Yup.string().oneOf(["existing", "new"]).required(),
    addressId: Yup.string().when("addressMode", {
        is: "existing",
        then: (schema) => schema.required("Select a saved address."),
        otherwise: (schema) => schema.optional()
    }),
    addressLine1: Yup.string().trim().when("addressMode", {
        is: "new",
        then: (schema) => schema.required("Address line 1 is required."),
        otherwise: (schema) => schema.optional()
    }),
    addressLine2: Yup.string().trim().when("addressMode", {
        is: "new",
        then: (schema) => schema.required("Address line 2 is required."),
        otherwise: (schema) => schema.optional()
    }),
    landmark: Yup.string().trim().optional(),
    state: Yup.string().when("addressMode", {
        is: "new",
        then: (schema) => schema.required("State is required."),
        otherwise: (schema) => schema.optional()
    }),
    city: Yup.string().when("addressMode", {
        is: "new",
        then: (schema) => schema.required("City is required."),
        otherwise: (schema) => schema.optional()
    }),
    pincode: Yup.string().trim().when("addressMode", {
        is: "new",
        then: (schema) => schema.required("Pincode is required.").matches(/^\d{6}$/, "Pincode must be 6 digits."),
        otherwise: (schema) => schema.optional()
    }),
    latitude: Yup.number().transform((value, originalValue) => (originalValue === "" ? null : value)).typeError("Latitude must be numeric.").nullable().notRequired(),
    longitude: Yup.number().transform((value, originalValue) => (originalValue === "" ? null : value)).typeError("Longitude must be numeric.").nullable().notRequired(),
    locationType: Yup.string().oneOf(["home", "office", "other"]).when("addressMode", {
        is: "new",
        then: (schema) => schema.required("Location type is required."),
        otherwise: (schema) => schema.optional()
    }),
    isDefault: Yup.number().oneOf([0, 1]).required(),
    providerId: Yup.string().required("Service provider is required."),
    serviceTypeId: Yup.array().of(Yup.string().required()).min(1, "Select at least one service type."),
    scheduledTime: Yup.string().required("Scheduled date and time is required.").test("future", "Date and time must be in the future", (value) => {
        if (!value) return false;
        return moment(value).isAfter(moment());
    }),
    issueDescription: Yup.string().trim().max(5000, "Too long.").optional()
});

const formatSavedAddress = (row: SavedAddress) =>
    [row.addressLine1, row.addressLine2, row.landmark, row.cityName, row.stateName, row.pincode].filter(Boolean).join(", ");

export default function AdminCreateBookingPage() {
    const router = useRouter();
    const [initialValues] = useState<FormValues>(emptyValues);
    const [customerExists, setCustomerExists] = useState<boolean | null>(null);
    const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
    const [lookingUp, setLookingUp] = useState(false);
    const [selectedState, setSelectedState] = useState<SelectOption | null>(null);
    const [selectedCity, setSelectedCity] = useState<SelectOption | null>(null);
    const [selectedProvider, setSelectedProvider] = useState<SelectOption | null>(null);
    const [providerServices, setProviderServices] = useState<ProviderServiceRow[]>([]);
    const [loadingServices, setLoadingServices] = useState(false);

    const menuPortalTarget = useMemo(() => (typeof document !== "undefined" ? document.body : null), []);

    const loadStateOptions = useCallback(async (inputValue: string): Promise<SelectOption[]> => {
        const { data } = await AxiosHelper.getData("/states-list", { limit: 20, query: inputValue || "" });
        return data.status && Array.isArray(data.data) ? data.data : [];
    }, []);

    const loadCityOptions = useCallback(async (inputValue: string, stateId: string): Promise<SelectOption[]> => {
        if (!stateId) return [];
        const { data } = await AxiosHelper.getData("/cities-list", { limit: 20, query: inputValue || "", stateId });
        return data.status && Array.isArray(data.data) ? data.data : [];
    }, []);

    const loadProviderOptions = useCallback(async (inputValue: string): Promise<SelectOption[]> => {
        const { data } = await AxiosHelperAdmin.getData("/service-providers", { query: inputValue || "", profileStatus: "approved", limit: 20, pageNo: 1, sortBy: "name", sortOrder: "asc" });
        if (!data.status || !Array.isArray(data.data?.record)) return [];
        return data.data.record.filter((row: { isVerified?: boolean }) => row.isVerified !== false).map((row: { _id: string; name: string; mobile?: string; userId?: string }) => ({
            value: row._id,
            label: `${row.name}${row.userId ? ` (${row.userId})` : ""}${row.mobile ? ` · ${row.mobile}` : ""}`
        }));
    }, []);

    const loadProviderServices = useCallback(async (providerId: string) => {
        if (!providerId) {
            setProviderServices([]);
            return;
        }
        setLoadingServices(true);
        const { data } = await AxiosHelperAdmin.getData(`/service-providers/${providerId}/services`);
        if (data.status && Array.isArray(data.data?.record)) {
            setProviderServices((data.data.record as ProviderServiceRow[]).filter((row) => Number(row.status) === 1));
        } else {
            setProviderServices([]);
            toast.error(data.message || "Could not load provider services.");
        }
        setLoadingServices(false);
    }, []);

    const clearCustomerLookup = (setFieldValue: (field: string, value: unknown) => void) => {
        setCustomerExists(null);
        setSavedAddresses([]);
        setFieldValue("addressMode", "new");
        setFieldValue("addressId", "");
    };

    const lookupCustomer = async (mobile: string, setFieldValue: (field: string, value: unknown) => void) => {
        const normalized = String(mobile || "").trim();
        if (!PHONE_REGEXP.test(normalized)) {
            toast.error(PHONE_ERROR_MESSAGE);
            return;
        }
        setLookingUp(true);
        const { data } = await AxiosHelperAdmin.getData("/bookings/lookup-customer", { mobile: normalized });
        setLookingUp(false);
        if (!data.status) {
            toast.error(data.message || "Lookup failed.");
            return;
        }
        if (data.data?.exists && data.data.customer) {
            const c = data.data.customer;
            const addresses = Array.isArray(data.data.addresses) ? (data.data.addresses as SavedAddress[]) : [];
            setCustomerExists(true);
            setSavedAddresses(addresses);
            setFieldValue("name", c.name || "");
            setFieldValue("email", c.email || "");
            setFieldValue("dateOfBirth", c.dateOfBirth || "");

            if (addresses.length) {
                const preferred = addresses.find((row) => row.isDefault) || addresses[0];
                setFieldValue("addressMode", "existing");
                setFieldValue("addressId", preferred._id);
            } else {
                setFieldValue("addressMode", "new");
                setFieldValue("addressId", "");
            }
            toast.success(`Existing customer found${c.userId ? ` (${c.userId})` : ""}.`);
        } else {
            setCustomerExists(false);
            setSavedAddresses([]);
            setFieldValue("addressMode", "new");
            setFieldValue("addressId", "");
            toast.info("No customer with this mobile. A new customer will be registered.");
        }
    };

    return (
        <section className="space-y-4">
            <AdminPageHeader
                title="Create booking"
                subtitle="Register a customer if needed, pick or add an address, and create a booking in one step."
                action={
                    <Link href="/admin/bookings">
                        <Button type="button" variant="secondary" size="md">
                            <ArrowLeftIcon className="h-4 w-4" /> Go Back
                        </Button>
                    </Link>
                }
            />

            <div className="rounded-2xl border border-indigo-100 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 sm:p-6">
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={async (values, { setSubmitting, setErrors }) => {
                        const usingExisting = values.addressMode === "existing" && values.addressId;
                        const payload = usingExisting
                            ? {
                                name: values.name,
                                mobile: values.mobile,
                                email: values.email.trim() || undefined,
                                dateOfBirth: values.dateOfBirth || undefined,
                                addressId: values.addressId,
                                providerId: values.providerId,
                                serviceTypeId: values.serviceTypeId,
                                scheduledTime: moment(values.scheduledTime).toISOString(),
                                issueDescription: values.issueDescription.trim() || undefined
                            }
                            : {
                                name: values.name,
                                mobile: values.mobile,
                                email: values.email.trim() || undefined,
                                dateOfBirth: values.dateOfBirth || undefined,
                                addressLine1: values.addressLine1,
                                addressLine2: values.addressLine2,
                                landmark: values.landmark.trim() || undefined,
                                state: values.state,
                                city: values.city,
                                pincode: values.pincode,
                                latitude: values.latitude === "" ? undefined : Number(values.latitude),
                                longitude: values.longitude === "" ? undefined : Number(values.longitude),
                                locationType: values.locationType,
                                isDefault: values.isDefault,
                                providerId: values.providerId,
                                serviceTypeId: values.serviceTypeId,
                                scheduledTime: moment(values.scheduledTime).toISOString(),
                                issueDescription: values.issueDescription.trim() || undefined
                            };

                        const { data } = await AxiosHelperAdmin.postData("/bookings/create-with-customer", payload);
                        if (data.status) {
                            toast.success(data.message || "Booking created.");
                            const bookingId = data.data?.booking?._id;
                            if (bookingId) router.push(`/admin/bookings/${bookingId}`);
                            else router.push("/admin/bookings");
                        } else {
                            toast.error(data.message || "Could not create booking.");
                            if (data.data && typeof data.data === "object") setErrors(data.data);
                        }
                        setSubmitting(false);
                    }}
                >
                    {({ values, setFieldValue, isSubmitting }) => (
                        <Form className="space-y-8">
                            <section className="space-y-4">
                                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Customer</h2>
                                {customerExists === true ? (
                                    <p className="text-xs text-emerald-600">Existing customer — booking will be linked to this account.</p>
                                ) : customerExists === false ? (
                                    <p className="text-xs text-amber-600">New customer will be registered with this booking.</p>
                                ) : null}

                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                    <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                                        <Label htmlFor="booking-mobile">Mobile</Label>
                                        <div className="flex gap-2">
                                            <Field
                                                as={Input}
                                                id="booking-mobile"
                                                name="mobile"
                                                placeholder="10-digit mobile"
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                    clearCustomerLookup(setFieldValue);
                                                    setFieldValue("mobile", e.target.value);
                                                }}
                                            />
                                            <Button type="button" variant="secondary" size="md" disabled={lookingUp} onClick={() => void lookupCustomer(values.mobile, setFieldValue)} title="Lookup customer">
                                                <Search className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <ErrorMessage className="text-xs text-rose-600" name="mobile" component="small" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="booking-name">Name</Label>
                                        <Field as={Input} id="booking-name" name="name" placeholder="Customer name" />
                                        <ErrorMessage className="text-xs text-rose-600" name="name" component="small" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="booking-email">Email (optional)</Label>
                                        <Field as={Input} id="booking-email" name="email" type="email" placeholder="email@example.com" />
                                        <ErrorMessage className="text-xs text-rose-600" name="email" component="small" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="booking-dob">Date of birth (optional)</Label>
                                        <Field as={Input} id="booking-dob" name="dateOfBirth" type="date" />
                                        <ErrorMessage className="text-xs text-rose-600" name="dateOfBirth" component="small" />
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-4 border-t border-indigo-50 pt-6 dark:border-slate-700">
                                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Service address</h2>

                                {savedAddresses.length > 0 ? (
                                    <div className="space-y-3">
                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant={values.addressMode === "existing" ? "primary" : "secondary"}
                                                onClick={() => {
                                                    const preferred = savedAddresses.find((row) => row.isDefault) || savedAddresses[0];
                                                    setFieldValue("addressMode", "existing");
                                                    setFieldValue("addressId", preferred?._id || "");
                                                }}
                                            >
                                                Use saved address
                                            </Button>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant={values.addressMode === "new" ? "primary" : "secondary"}
                                                onClick={() => {
                                                    setFieldValue("addressMode", "new");
                                                    setFieldValue("addressId", "");
                                                }}
                                            >
                                                Add new address
                                            </Button>
                                        </div>

                                        {values.addressMode === "existing" ? (
                                            <div className="grid gap-2">
                                                {savedAddresses.map((row) => {
                                                    const checked = values.addressId === row._id;
                                                    return (
                                                        <label
                                                            key={row._id}
                                                            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition ${checked ? "border-indigo-400 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-950/40" : "border-indigo-100 hover:border-indigo-300 dark:border-slate-700"}`}
                                                        >
                                                            <input
                                                                type="radio"
                                                                className="mt-1"
                                                                name="saved-address"
                                                                checked={checked}
                                                                onChange={() => setFieldValue("addressId", row._id)}
                                                            />
                                                            <span className="min-w-0 flex-1">
                                                                <span className="flex flex-wrap items-center gap-2">
                                                                    <span className="font-medium capitalize text-slate-800 dark:text-slate-100">{row.locationType || "address"}</span>
                                                                    {row.isDefault ? <Badge variant="success" size="sm">Default</Badge> : null}
                                                                </span>
                                                                <span className="mt-1 block text-slate-600 dark:text-slate-300">{formatSavedAddress(row)}</span>
                                                            </span>
                                                        </label>
                                                    );
                                                })}
                                                <ErrorMessage className="text-xs text-rose-600" name="addressId" component="small" />
                                            </div>
                                        ) : null}
                                    </div>
                                ) : null}

                                {values.addressMode === "new" || savedAddresses.length === 0 ? (
                                    <>
                                        {savedAddresses.length === 0 && customerExists === true ? (
                                            <p className="text-xs text-slate-500">This customer has no saved addresses. Add one below.</p>
                                        ) : null}
                                        <div className="space-y-2">
                                            <Label htmlFor="booking-address-1">Address line 1</Label>
                                            <Field as={Input} id="booking-address-1" name="addressLine1" placeholder="House number, street, area" />
                                            <ErrorMessage className="text-xs text-rose-600" name="addressLine1" component="small" />
                                        </div>
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="booking-address-2">Address line 2</Label>
                                                <Field as={Input} id="booking-address-2" name="addressLine2" placeholder="Apartment, floor, etc." />
                                                <ErrorMessage className="text-xs text-rose-600" name="addressLine2" component="small" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="booking-landmark">Landmark</Label>
                                                <Field as={Input} id="booking-landmark" name="landmark" placeholder="Nearby landmark" />
                                                <ErrorMessage className="text-xs text-rose-600" name="landmark" component="small" />
                                            </div>
                                        </div>
                                        <div className="relative z-20 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                            <div className="space-y-2">
                                                <Label>State</Label>
                                                <AsyncSelect
                                                    inputId="booking-state"
                                                    value={selectedState}
                                                    loadOptions={loadStateOptions}
                                                    onChange={(opt) => {
                                                        setSelectedState(opt);
                                                        setSelectedCity(null);
                                                        setFieldValue("state", opt?.value || "");
                                                        setFieldValue("city", "");
                                                    }}
                                                    placeholder="Select state"
                                                    menuPortalTarget={menuPortalTarget}
                                                    menuPosition="fixed"
                                                />
                                                <ErrorMessage className="text-xs text-rose-600" name="state" component="small" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>City</Label>
                                                <AsyncSelect
                                                    inputId="booking-city"
                                                    key={values.state || "no-state"}
                                                    value={selectedCity}
                                                    loadOptions={(q) => loadCityOptions(q, values.state)}
                                                    onChange={(opt) => {
                                                        setSelectedCity(opt);
                                                        setFieldValue("city", opt?.value || "");
                                                    }}
                                                    placeholder={values.state ? "Select city" : "Select state first"}
                                                    isDisabled={!values.state}
                                                    menuPortalTarget={menuPortalTarget}
                                                    menuPosition="fixed"
                                                />
                                                <ErrorMessage className="text-xs text-rose-600" name="city" component="small" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="booking-pincode">Pincode</Label>
                                                <Field as={Input} id="booking-pincode" name="pincode" placeholder="6-digit pincode" />
                                                <ErrorMessage className="text-xs text-rose-600" name="pincode" component="small" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="booking-location-type">Location type</Label>
                                                <Field as={Select} id="booking-location-type" name="locationType">
                                                    <Option value="home">Home</Option>
                                                    <Option value="office">Office</Option>
                                                    <Option value="other">Other</Option>
                                                </Field>
                                                <ErrorMessage className="text-xs text-rose-600" name="locationType" component="small" />
                                            </div>
                                        </div>
                                        <div className="relative z-0">
                                            <AddressLocationPicker
                                                latitude={values.latitude}
                                                longitude={values.longitude}
                                                searchHint={[values.addressLine1, values.addressLine2, selectedCity?.label, selectedState?.label, values.pincode].filter(Boolean).join(", ")}
                                                onChange={(lat, lng) => {
                                                    setFieldValue("latitude", lat);
                                                    setFieldValue("longitude", lng);
                                                }}
                                            />
                                        </div>
                                    </>
                                ) : null}
                            </section>

                            <section className="space-y-4 border-t border-indigo-50 pt-6 dark:border-slate-700">
                                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Booking</h2>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Service provider</Label>
                                        <AsyncSelect
                                            inputId="booking-provider"
                                            value={selectedProvider}
                                            loadOptions={loadProviderOptions}
                                            onChange={(opt) => {
                                                setSelectedProvider(opt);
                                                setFieldValue("providerId", opt?.value || "");
                                                setFieldValue("serviceTypeId", []);
                                                void loadProviderServices(opt?.value || "");
                                            }}
                                            placeholder="Search approved providers..."
                                            menuPortalTarget={menuPortalTarget}
                                            menuPosition="fixed"
                                        />
                                        <ErrorMessage className="text-xs text-rose-600" name="providerId" component="small" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="booking-scheduled">Scheduled date & time</Label>
                                        <Field as={Input} id="booking-scheduled" name="scheduledTime" type="datetime-local" />
                                        <ErrorMessage className="text-xs text-rose-600" name="scheduledTime" component="small" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Service types</Label>
                                    {!values.providerId ? (
                                        <p className="text-sm text-slate-500">Select a provider to load services.</p>
                                    ) : loadingServices ? (
                                        <p className="text-sm text-slate-500">Loading services...</p>
                                    ) : !providerServices.length ? (
                                        <p className="text-sm text-rose-600">No active services for this provider.</p>
                                    ) : (
                                        <div className="grid gap-2 sm:grid-cols-2">
                                            {providerServices.map((service) => {
                                                const checked = values.serviceTypeId.includes(service.serviceTypeId);
                                                return (
                                                    <label
                                                        key={service._id}
                                                        className={`flex cursor-pointer items-start gap-2 rounded-xl border p-3 text-sm transition ${checked ? "border-indigo-400 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-950/40" : "border-indigo-100 hover:border-indigo-300 dark:border-slate-700"}`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            className="mt-0.5 h-4 w-4 rounded border-slate-300"
                                                            checked={checked}
                                                            onChange={() => {
                                                                const next = checked
                                                                    ? values.serviceTypeId.filter((id) => id !== service.serviceTypeId)
                                                                    : [...values.serviceTypeId, service.serviceTypeId];
                                                                setFieldValue("serviceTypeId", next);
                                                            }}
                                                        />
                                                        <span>
                                                            <span className="font-medium text-slate-800 dark:text-slate-100">{service.serviceTypeName}</span>
                                                            {service.categoryName ? <span className="mt-0.5 block text-xs text-slate-500">{service.categoryName}</span> : null}
                                                            {service.price != null ? <span className="mt-0.5 block text-xs text-slate-500">₹{service.price}</span> : null}
                                                        </span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    )}
                                    <ErrorMessage className="text-xs text-rose-600" name="serviceTypeId" component="small" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="booking-issue">Issue description (optional)</Label>
                                    <Field as={Textarea} id="booking-issue" name="issueDescription" rows={3} placeholder="Notes for the provider..." />
                                    <ErrorMessage className="text-xs text-rose-600" name="issueDescription" component="small" />
                                </div>
                            </section>

                            <div className="flex flex-wrap justify-end gap-2 border-t border-indigo-50 pt-4 dark:border-slate-700">
                                <Link href="/admin/bookings">
                                    <Button type="button" variant="secondary" size="md">Cancel</Button>
                                </Link>
                                <Button type="submit" variant="primary" size="md" disabled={isSubmitting}>
                                    {isSubmitting ? "Creating..." : "Create booking"}
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </section>
    );
}
