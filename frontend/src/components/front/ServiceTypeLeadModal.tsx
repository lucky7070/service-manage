"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import moment from "moment";
import { Home, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, Input, Label, Textarea } from "@/components/front/ui";
import AxiosHelper from "@/helpers/AxiosHelper";
import { cn } from "@/helpers/utils";
import type { ServiceTypeByCategory } from "@/lib/api.server";

type AddressRow = {
    _id: string;
    addressLine1: string;
    addressLine2?: string;
    landmark?: string;
    city?: string;
    cityName?: string;
    stateName?: string;
    pincode?: string;
    locationType?: string;
    isDefault?: boolean;
};

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category: { _id: string; slug: string; name: string };
    serviceTypes: ServiceTypeByCategory[];
    onSubmitted?: () => void;
};

function formatAddressMeta(address: AddressRow) {
    return [address.addressLine2, address.cityName, address.stateName, address.pincode].filter(Boolean).join(", ");
}

const validationSchema = Yup.object({
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

export default function ServiceTypeLeadModal({ open, onOpenChange, category, serviceTypes, onSubmitted }: Props) {
    const router = useRouter();
    const [addresses, setAddresses] = useState<AddressRow[]>([]);
    const [loadingMeta, setLoadingMeta] = useState(false);

    const defaultAddressId = useMemo(() => addresses.find((a) => a.isDefault)?._id || addresses[0]?._id || "", [addresses]);

    const loadAddresses = useCallback(async () => {
        setLoadingMeta(true);
        const { data } = await AxiosHelper.getData("/customer/addresses");
        if (data.status && Array.isArray(data.data)) {
            setAddresses(data.data as AddressRow[]);
        } else {
            setAddresses([]);
            toast.error(data.message || "Could not load addresses.");
        }
        setLoadingMeta(false);
    }, []);

    useEffect(() => {
        if (open) (async () => await loadAddresses())();
    }, [open, loadAddresses]);

    const selectedIdsKey = serviceTypes.map((t) => t._id).join(",");
    const formKey = `${selectedIdsKey}|${defaultAddressId}|${open ? "1" : "0"}`;
    const titleLabel = serviceTypes.length === 1
        ? serviceTypes[0].name
        : serviceTypes.length > 1
            ? `${serviceTypes.length} services`
            : category.name;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Request — {titleLabel}</DialogTitle>
                    <DialogDescription>
                        Confirm your address and preferred time. A verified professional for {category.name} will be assigned.
                    </DialogDescription>
                </DialogHeader>

                {serviceTypes.length ? (
                    <div className="rounded-2xl border border-orange-100 bg-orange-50/60 px-4 py-3">
                        <p className="font-semibold uppercase tracking-wide text-orange-700/80">
                            Selected service{serviceTypes.length > 1 ? "s" : ""}
                        </p>
                        <ul className="mt-1.5 space-y-1">
                            {serviceTypes.map((type) => (
                                <li key={type._id} className="flex items-start justify-between gap-3 text-sm">
                                    <span className="font-semibold text-gray-900">{type.name}</span>
                                    {type.basePrice != null ? (
                                        <span className="shrink-0 font-medium text-primary">
                                            ₹{Number(type.basePrice).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                                        </span>
                                    ) : null}
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : null}

                <Formik
                    key={formKey}
                    enableReinitialize
                    initialValues={{
                        scheduledTime: "",
                        addressId: defaultAddressId,
                        issueDescription: "",
                    }}
                    validationSchema={validationSchema}
                    onSubmit={async (values, { setSubmitting, setErrors, resetForm }) => {
                        if (!serviceTypes.length) {
                            toast.error("Please select at least one service type.");
                            setSubmitting(false);
                            return;
                        }

                        const selectedAddress = addresses.find((a) => a._id === values.addressId);
                        const cityId = selectedAddress?.city ? String(selectedAddress.city) : "";
                        if (!cityId) {
                            toast.error("Please select an address with a city, or add one from My Account.");
                            setSubmitting(false);
                            return;
                        }

                        const { data } = await AxiosHelper.postData("/customer/service-leads", {
                            cityId,
                            serviceCategoryId: category._id,
                            serviceTypeId: serviceTypes.map((type) => type._id),
                            addressId: values.addressId,
                            scheduledTime: values.scheduledTime,
                            issueDescription: values.issueDescription?.trim() || undefined,
                        });

                        if (data.status) {
                            toast.success(data.message || "Request submitted.");
                            resetForm();
                            onOpenChange(false);
                            onSubmitted?.();
                            localStorage.removeItem("selectedServiceTypeIds");
                            localStorage.removeItem("selectedServiceTypeRedirectPath");
                            router.push("/user/service-leads");
                        } else {
                            toast.error(data.message || "Could not submit request.");
                            if (Array.isArray(data.data) && data.data.length) {
                                const map: Record<string, string> = {};
                                for (const row of data.data as { field?: string; message?: string }[]) {
                                    if (!row.field) continue;
                                    map[row.field] = row.message || "";
                                }
                                setErrors(map);
                            }
                        }
                        setSubmitting(false);
                    }}
                >
                    {({ values, isSubmitting, setFieldValue }) => (
                        <Form className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="st-lead-schedule">Scheduled date &amp; time</Label>
                                <Field
                                    as={Input}
                                    id="st-lead-schedule"
                                    name="scheduledTime"
                                    type="datetime-local"
                                    min={moment().seconds(0).milliseconds(0).format("YYYY-MM-DDTHH:mm")}
                                />
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
                                                                    {address.isDefault ? " · Default" : ""}
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
                                <Label htmlFor="st-lead-issue">Issue description <span className="font-normal text-muted-foreground">(optional)</span></Label>
                                <Field as={Textarea} id="st-lead-issue" name="issueDescription" placeholder="Describe the issue or special instructions…" rows={3} />
                                <ErrorMessage name="issueDescription" component="small" className="mt-1 block text-xs text-rose-600" />
                            </div>

                            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting || loadingMeta || !serviceTypes.length}>
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
    );
}
