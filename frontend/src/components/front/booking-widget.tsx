"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, Home, IndianRupee, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, Input, Label, Select, Textarea } from "@/components/front/ui";
import AxiosHelper from "@/helpers/AxiosHelper";
import type { PublicServiceProvider } from "@/lib/api.server";
import { useAppSelector } from "@/store/hooks";

type AddressRow = {
    _id: string;
    addressLine1: string;
    addressLine2?: string;
    landmark?: string;
    cityName?: string;
    stateName?: string;
    pincode?: string;
    locationType?: string;
};

type BookingWidgetProps = {
    provider: PublicServiceProvider;
};

export default function BookingWidget({ provider }: BookingWidgetProps) {
    const router = useRouter();
    const user = useAppSelector((state) => state.user);
    const [open, setOpen] = useState(false);
    const [addresses, setAddresses] = useState<AddressRow[]>([]);
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [addressId, setAddressId] = useState("");
    const [scheduledTime, setScheduledTime] = useState("");
    const [issueDescription, setIssueDescription] = useState("");
    const [loadingAddresses, setLoadingAddresses] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const isLoggedIn = Boolean(user._id);

    const selectedServiceRows = useMemo(() => provider.providerServices.filter((row) => selectedServices.includes(row.serviceTypeId)), [provider.providerServices, selectedServices]);
    const estimatedTotal = selectedServiceRows.reduce((sum, row) => sum + Number(row.price ?? row.basePrice ?? 0), 0);
    const estimatedMinutes = selectedServiceRows.reduce((sum, row) => sum + Number(row.estimatedTimeMinutes || 0), 0);

    const loadAddresses = useCallback(async () => {
        setLoadingAddresses(true);
        const { data } = await AxiosHelper.getData("/customer/addresses");
        if (data.status && Array.isArray(data.data)) {
            setAddresses(data.data as AddressRow[]);
            const defaultAddress = (data.data as Array<AddressRow & { isDefault?: boolean }>).find((row) => row.isDefault);
            setAddressId(defaultAddress?._id || data.data[0]?._id || "");
        } else {
            setAddresses([]);
            toast.error(data.message || "Could not load addresses.");
        }
        setLoadingAddresses(false);
    }, []);

    const handleCta = async () => {
        if (!isLoggedIn) {
            router.push(`/login?redirect=${encodeURIComponent(`/book/${provider.slug}`)}`);
            return;
        }

        setOpen(true);
        if (!addresses.length) await loadAddresses();
    };

    const toggleService = (serviceTypeId: string) => {
        setSelectedServices((prev) => prev.includes(serviceTypeId) ? prev.filter((id) => id !== serviceTypeId) : [...prev, serviceTypeId]);
    };

    const submitBooking = async () => {
        if (!selectedServices.length) return toast.error("Please select at least one service.");
        if (!scheduledTime) return toast.error("Please select scheduled date and time.");
        if (!addressId) return toast.error("Please select service address.");

        setSubmitting(true);
        const { data } = await AxiosHelper.postData("/customer/bookings", {
            providerId: provider._id,
            serviceTypeId: selectedServices,
            addressId,
            scheduledTime,
            issueDescription
        });

        if (data.status) {
            toast.success(data.message || "Booking created.");
            const bookingId = data.data?._id;
            setOpen(false);
            router.push(bookingId ? `/user/bookings/${bookingId}` : "/user/bookings");
        } else {
            toast.error(data.message || "Could not create booking.");
        }
        setSubmitting(false);
    };

    return (
        <>
            <Button type="button" className="mt-6 w-full rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600" onClick={handleCta}>
                {isLoggedIn ? "Book Now" : "Login to Book"}
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Book {provider.name}</DialogTitle>
                        <DialogDescription>Select issue type, schedule, and address for your service request.</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-5">
                        <div>
                            <Label>Issue Type / Services</Label>
                            <div className="mt-2 grid gap-2">
                                {provider.providerServices.length ? provider.providerServices.map((service) => {
                                    const checked = selectedServices.includes(service.serviceTypeId);
                                    return (
                                        <button key={service.serviceTypeId} type="button" onClick={() => toggleService(service.serviceTypeId)} className={`rounded-2xl border p-3 text-left transition ${checked ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="font-semibold">{service.name}</p>
                                                    {service.description ? <p className="mt-1 text-xs text-muted-foreground truncate">{service.description}</p> : null}
                                                </div>
                                                <span className="font-semibold text-primary">₹{Number(service.price ?? service.basePrice ?? 0).toFixed(2)}</span>
                                            </div>
                                        </button>
                                    );
                                }) : <p className="rounded-xl border border-border p-4 text-sm text-muted-foreground">No services configured for this provider.</p>}
                            </div>
                        </div>

                        <div className="grid gap-3 rounded-2xl bg-muted/60 p-4 sm:grid-cols-2">
                            <div className="flex items-center gap-2">
                                <IndianRupee className="h-4 w-4 text-primary" />
                                <span className="text-sm">Estimated base price: <b>₹{estimatedTotal.toFixed(2)}</b></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CalendarClock className="h-4 w-4 text-primary" />
                                <span className="text-sm">Estimated time: <b>{estimatedMinutes || 0} min</b></span>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="booking-schedule">Scheduled Date & Time</Label>
                                <Input id="booking-schedule" type="datetime-local" value={scheduledTime} onChange={(event) => setScheduledTime(event.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="booking-address">Service Address</Label>
                                <Select id="booking-address" value={addressId} onChange={(event) => setAddressId(event.target.value)} disabled={loadingAddresses}>
                                    <option value="">{loadingAddresses ? "Loading addresses..." : "Select address"}</option>
                                    {addresses.map((address) => (
                                        <option key={address._id} value={address._id}>
                                            {address.addressLine1}, {address.cityName || ""} {address.pincode || ""}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                        </div>

                        {!addresses.length && !loadingAddresses ? (
                            <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                                <Home className="h-4 w-4" />
                                Add an address from My Account before booking.
                            </div>
                        ) : null}

                        <div className="space-y-2">
                            <Label htmlFor="booking-issue">Issue Description</Label>
                            <Textarea id="booking-issue" value={issueDescription} onChange={(event) => setIssueDescription(event.target.value)} placeholder="Describe the issue or special instructions..." />
                        </div>

                        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>Cancel</Button>
                            <Button type="button" onClick={submitBooking} disabled={submitting || loadingAddresses}>
                                {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</> : "Confirm Booking"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
