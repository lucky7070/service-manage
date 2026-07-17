"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import moment from "moment";
import { ClipboardList, Home, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, Input, Label, Textarea, } from "@/components/front/ui";
import AxiosHelper from "@/helpers/AxiosHelper";
import { useAppSelector } from "@/store/hooks";
import { cn } from "@/helpers/utils";

type ServiceTypeRow = {
    _id: string;
    name: string;
    description?: string | null;
    basePrice?: number | null;
    estimatedTimeMinutes?: number | null;
};

type AddressRow = {
    _id: string;
    addressLine1: string;
    addressLine2?: string;
    landmark?: string;
    cityName?: string;
    stateName?: string;
    pincode?: string;
    locationType?: string;
    isDefault?: boolean;
};

function formatAddressMeta(address: AddressRow) {
    return [address.addressLine2, address.cityName, address.stateName, address.pincode].filter(Boolean).join(", ");
}

type Props = {
    cityId: string;
    serviceCategoryId: string;
    categorySlug: string;
    categoryName: string;
};

const validationSchema = Yup.object({
    serviceTypeIds: Yup.array().of(Yup.string().required()).min(1, "Select at least one service / issue type."),
    scheduledTime: Yup.string()
        .required("Scheduled date and time is required.")
        .test("min-now", "Scheduled date and time must be now or later.", (value) => {
            if (!value) return false;
            const scheduled = moment(value);
            if (!scheduled.isValid()) return false;
            return scheduled.isSameOrAfter(moment());
        }),
    addressId: Yup.string().required("Service address is required."),
    issueDescription: Yup.string().max(5000).optional(),
});

export default function ServiceLeadRequestSection({ cityId, serviceCategoryId, categorySlug, categoryName }: Props) {
    const router = useRouter();
    const user = useAppSelector((state) => state.user);
    const [open, setOpen] = useState(false);
    const [serviceTypes, setServiceTypes] = useState<ServiceTypeRow[]>([]);
    const [addresses, setAddresses] = useState<AddressRow[]>([]);
    const [loadingMeta, setLoadingMeta] = useState(false);

    const isLoggedIn = Boolean(user._id);

    const loadModalData = useCallback(async () => {
        setLoadingMeta(true);
        const [typesRes, addrRes] = await Promise.all([
            AxiosHelper.getData(`/service-types-by-category/${encodeURIComponent(categorySlug)}`),
            AxiosHelper.getData("/customer/addresses"),
        ]);

        if (typesRes.data.status && Array.isArray(typesRes.data.data)) {
            setServiceTypes(typesRes.data.data as ServiceTypeRow[]);
        } else {
            setServiceTypes([]);
            toast.error(typesRes.data.message || "Could not load service types.");
        }

        if (addrRes.data.status && Array.isArray(addrRes.data.data)) {
            setAddresses(addrRes.data.data as AddressRow[]);
        } else {
            setAddresses([]);
            if (isLoggedIn) toast.error(addrRes.data.message || "Could not load addresses.");
        }
        setLoadingMeta(false);
    }, [categorySlug, isLoggedIn]);

    useEffect(() => {
        if (open && isLoggedIn) {
            (() => void loadModalData())();
        }
    }, [open, isLoggedIn, loadModalData]);

    const handleOpen = async () => {
        if (!isLoggedIn) {
            const path = typeof window !== "undefined" ? window.location.pathname : "/";
            router.push(`/login?redirect=${encodeURIComponent(path)}`);
            return;
        }
        setOpen(true);
    };

    return (
        <>
            <Button
                type="button"
                variant="outline"
                className="inline-flex items-center gap-2 rounded-full border-primary/40 text-sm font-medium text-primary hover:bg-orange-50 hover:text-orange-600"
                onClick={() => void handleOpen()}
            >
                <ClipboardList className="h-4 w-4" />
                Request without choosing a provider
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Service request — {categoryName}</DialogTitle>
                        <DialogDescription>
                            Submit your job details. We will assign a verified professional in {categoryName} for your area and notify you.
                        </DialogDescription>
                    </DialogHeader>

                    <Formik
                        initialValues={{
                            serviceTypeIds: [] as string[],
                            scheduledTime: "",
                            addressId: "",
                            issueDescription: "",
                        }}
                        validationSchema={validationSchema}
                        onSubmit={async (values, { setSubmitting, setErrors, resetForm }) => {
                            const { data } = await AxiosHelper.postData("/customer/service-leads", {
                                cityId,
                                serviceCategoryId,
                                serviceTypeId: values.serviceTypeIds,
                                addressId: values.addressId,
                                scheduledTime: values.scheduledTime,
                                issueDescription: values.issueDescription?.trim() || undefined,
                            });
                            if (data.status) {
                                toast.success(data.message || "Request submitted.");
                                resetForm();
                                setOpen(false);
                                router.push("/user/bookings");
                            } else {
                                toast.error(data.message || "Could not submit request.");
                                if (Array.isArray(data.data) && data.data.length) {
                                    const map: Record<string, string> = {};
                                    for (const row of data.data as { field?: string; message?: string }[]) {
                                        if (!row.field) continue;
                                        const key = row.field === "serviceTypeId" ? "serviceTypeIds" : row.field;
                                        map[key] = row.message || "";
                                    }
                                    setErrors(map);
                                }
                            }
                            setSubmitting(false);
                        }}
                    >
                        {({ values, isSubmitting, setFieldValue }) => (
                            <Form className="space-y-5">
                                <div>
                                    <Label>Issue type / services</Label>
                                    <div className="mt-2 grid gap-2 max-h-80 overflow-y-auto pr-1">
                                        {loadingMeta ? (
                                            <p className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Loader2 className="h-4 w-4 animate-spin" /> Loading services…
                                            </p>
                                        ) : serviceTypes.length ? (
                                            serviceTypes.map((st) => {
                                                const checked = values.serviceTypeIds.includes(st._id);
                                                return (
                                                    <button
                                                        key={st._id}
                                                        type="button"
                                                        onClick={() => {
                                                            const next = checked ? values.serviceTypeIds.filter((id) => id !== st._id) : [...values.serviceTypeIds, st._id];
                                                            void setFieldValue("serviceTypeIds", next);
                                                        }}
                                                        className={`rounded-2xl border p-3 text-left transition ${checked ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
                                                    >
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div>
                                                                <p className="font-semibold">{st.name}</p>
                                                                {st.description ? <p className="mt-1 truncate text-xs text-muted-foreground">{st.description}</p> : null}
                                                            </div>
                                                            {st.basePrice != null ? <span className="font-semibold text-primary">₹{Number(st.basePrice).toFixed(2)}</span> : null}
                                                        </div>
                                                    </button>
                                                );
                                            })
                                        ) : <p className="rounded-xl border border-border p-4 text-sm text-muted-foreground">No service types for this category.</p>}
                                    </div>
                                    <ErrorMessage name="serviceTypeIds" component="small" className="mt-1 block text-xs text-rose-600" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="lead-schedule">Scheduled date &amp; time</Label>
                                    <Field as={Input} id="lead-schedule" name="scheduledTime" type="datetime-local" min={moment().seconds(0).milliseconds(0).format("YYYY-MM-DDTHH:mm")} />
                                    <ErrorMessage name="scheduledTime" component="small" className="mt-1 block text-xs text-rose-600" />
                                </div>

                                <div className="space-y-2">
                                    <Label>Service address</Label>
                                    {loadingMeta ? (
                                        <div className="flex items-center gap-2 rounded-2xl border border-border p-3 text-sm text-muted-foreground">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Loading addresses...
                                        </div>
                                    ) : addresses.length ? (
                                        <div className="grid max-h-52 gap-2 overflow-y-auto pr-1">
                                            {addresses.map((address) => {
                                                const selected = values.addressId === address._id;
                                                const meta = formatAddressMeta(address);
                                                return (
                                                    <button
                                                        key={address._id}
                                                        type="button"
                                                        onClick={() => void setFieldValue("addressId", address._id)}
                                                        className={cn(
                                                            "min-w-0 rounded-2xl border p-3 text-left transition",
                                                            selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                                                        )}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <span className={cn(
                                                                "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
                                                                selected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                                                            )}>
                                                                <Home className="h-4 w-4" />
                                                            </span>
                                                            <div className="min-w-0 flex-1">
                                                                {address.locationType ? (
                                                                    <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                                        {address.locationType}
                                                                    </p>
                                                                ) : null}
                                                                <p className="wrap-break-word text-sm font-semibold leading-snug text-foreground">
                                                                    {address.addressLine1}
                                                                </p>
                                                                {meta ? (
                                                                    <p className="mt-1 wrap-break-word text-xs capitalize text-muted-foreground">{meta}</p>
                                                                ) : null}
                                                            </div>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                                            <Home className="h-4 w-4 shrink-0" />
                                            Add an address from My Account before submitting a request.
                                        </div>
                                    )}
                                    <ErrorMessage name="addressId" component="small" className="mt-1 block text-xs text-rose-600" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="lead-issue">Issue description</Label>
                                    <Field as={Textarea} id="lead-issue" name="issueDescription" placeholder="Describe the issue or special instructions…" rows={4} />
                                    <ErrorMessage name="issueDescription" component="small" className="mt-1 block text-xs text-rose-600" />
                                </div>

                                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                    <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting || loadingMeta}>
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" /> Submitting…
                                            </>
                                        ) : (
                                            "Submit request"
                                        )}
                                    </Button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </DialogContent>
            </Dialog>
        </>
    );
}
