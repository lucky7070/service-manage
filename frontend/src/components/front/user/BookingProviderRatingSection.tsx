"use client";

import { useEffect, useState } from "react";
import { ErrorMessage, Field, Form, Formik, useField } from "formik";
import * as Yup from "yup";
import { Star } from "lucide-react";
import { toast } from "react-toastify";
import { Button, Label, Textarea } from "@/components/front/ui";
import AxiosHelper from "@/helpers/AxiosHelper";
import { cn } from "@/helpers/utils";

export type CustomerBookingFeedback = {
    _id: string;
    starRating: number;
    reviewText?: string | null;
    quickTags?: Array<{ _id: string; tagName: string; tagType?: string }>;
    createdAt?: string;
};

type PredefinedTag = { _id: string; tagName: string; tagType?: string; tagFor?: string };

type BookingProviderRatingSectionProps = {
    bookingId: string;
    providerName: string;
    status: string;
    customerFeedback: CustomerBookingFeedback | null | undefined;
    onFeedbackSaved: () => void;
};

const validationSchema = Yup.object({
    starRating: Yup.number().min(1, "Please choose a rating from 1 to 5 stars.").max(5).required("Rating is required."),
    reviewText: Yup.string().trim().max(2000, "Review must be at most 2000 characters."),
    quickTags: Yup.array().of(Yup.string()),
});

type RatingFormValues = {
    starRating: number;
    reviewText: string;
    quickTags: string[];
};

function StarRatingField({ name }: { name: string }) {
    const [field, , helpers] = useField(name);
    const value = Number(field.value) || 0;
    return (
        <div className="flex flex-wrap items-center gap-1" role="radiogroup" aria-label="Star rating">
            {[1, 2, 3, 4, 5].map((n) => (
                <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={value === n}
                    className="rounded-md p-1 transition hover:bg-muted/80 focus-visible:outline focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={() => helpers.setValue(n)}
                >
                    <Star
                        className={cn(
                            "h-9 w-9 transition-colors",
                            n <= value ? "fill-primary text-primary" : "text-muted-foreground/40",
                        )}
                        strokeWidth={n <= value ? 0 : 1.5}
                    />
                </button>
            ))}
        </div>
    );
}

function tagChipClass(tagType?: string) {
    if (tagType === "positive") return "border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200";
    if (tagType === "negative") return "border-rose-500/40 bg-rose-500/10 text-rose-800 dark:text-rose-200";
    return "border-border bg-muted/60 text-foreground";
}

export default function BookingProviderRatingSection({
    bookingId,
    providerName,
    status,
    customerFeedback,
    onFeedbackSaved,
}: BookingProviderRatingSectionProps) {
    const [tagOptions, setTagOptions] = useState<PredefinedTag[] | null>(null);

    const showForm = status === "completed" && !customerFeedback;
    const showSubmitted = status === "completed" && Boolean(customerFeedback);

    useEffect(() => {
        if (!showForm) return;
        let cancelled = false;
        (async () => {
            const { data } = await AxiosHelper.getData("/feedback-rating-tags", { tagFor: "provider" });
            if (cancelled) return;
            if (data.status && Array.isArray(data.data)) {
                setTagOptions(data.data as PredefinedTag[]);
            } else {
                toast.error(data.message || "Could not load rating tags.");
                setTagOptions([]);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [showForm, bookingId]);

    if (status !== "completed") return null;

    if (showSubmitted && customerFeedback) {
        const r = customerFeedback;
        return (
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                <h2 className="text-xl font-bold">Your rating</h2>
                <p className="mt-1 text-sm text-muted-foreground">You rated {providerName} for this booking.</p>
                <div className="mt-4 flex items-center gap-0.5" aria-hidden>
                    {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                            key={n}
                            className={cn(
                                "h-6 w-6",
                                n <= r.starRating ? "fill-primary text-primary" : "text-muted-foreground/35",
                            )}
                            strokeWidth={n <= r.starRating ? 0 : 1.5}
                        />
                    ))}
                </div>
                {r.reviewText ? <p className="mt-3 text-sm leading-relaxed text-foreground">{r.reviewText}</p> : null}
                {r.quickTags && r.quickTags.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {r.quickTags.map((t) => (
                            <span
                                key={t._id}
                                className={cn("rounded-full border px-3 py-1 text-xs font-medium", tagChipClass(t.tagType))}
                            >
                                {t.tagName}
                            </span>
                        ))}
                    </div>
                ) : null}
            </div>
        );
    }

    const initialValues: RatingFormValues = {
        starRating: 0,
        reviewText: "",
        quickTags: [],
    };

    return (
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-bold">Rate your experience</h2>
            <p className="mt-1 text-sm text-muted-foreground">
                Service is marked complete. Share how {providerName} did — optional review and quick tags.
            </p>

            <Formik<RatingFormValues>
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={async (values, { setSubmitting, resetForm }) => {
                    const { data } = await AxiosHelper.postData(`/customer/bookings/${bookingId}/feedback`, {
                        starRating: values.starRating,
                        reviewText: values.reviewText.trim() || undefined,
                        quickTags: values.quickTags.length ? values.quickTags : undefined,
                    });
                    if (data.status) {
                        toast.success(data.message || "Thanks for your feedback.");
                        resetForm();
                        onFeedbackSaved();
                    } else {
                        toast.error(data.message || "Could not submit rating.");
                    }
                    setSubmitting(false);
                }}
            >
                {({ values, setFieldValue, isSubmitting }) => (
                    <Form className="mt-5 space-y-4">
                        <div>
                            <Label required>Overall rating</Label>
                            <StarRatingField name="starRating" />
                            <ErrorMessage name="starRating" component="small" className="mt-1 block text-xs text-rose-600" />
                        </div>

                        <div>
                            <Label htmlFor="booking-review">Written review (optional)</Label>
                            <Field
                                id="booking-review"
                                name="reviewText"
                                as={Textarea}
                                rows={4}
                                className="min-h-24 resize-y md:text-sm"
                                placeholder="What went well or what could improve?"
                            />
                            <ErrorMessage name="reviewText" component="small" className="mt-1 block text-xs text-rose-600" />
                        </div>

                        <div>
                            <Label>Quick tags (optional)</Label>
                            {tagOptions === null ? (
                                <p className="text-sm text-muted-foreground">Loading tags…</p>
                            ) : tagOptions.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No tags configured. You can still submit your star rating.</p>
                            ) : (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {tagOptions.map((opt) => {
                                        const selected = values.quickTags.includes(opt._id);
                                        return (
                                            <button
                                                key={opt._id}
                                                type="button"
                                                className={cn(
                                                    "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                                                    selected
                                                        ? "border-primary bg-primary/15 text-primary"
                                                        : cn("hover:bg-muted/80", tagChipClass(opt.tagType)),
                                                )}
                                                onClick={() => {
                                                    const next = selected
                                                        ? values.quickTags.filter((id) => id !== opt._id)
                                                        : [...values.quickTags, opt._id];
                                                    void setFieldValue("quickTags", next);
                                                }}
                                            >
                                                {opt.tagName}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <Button type="submit" disabled={isSubmitting} className="min-w-[140px]">
                            {isSubmitting ? "Submitting…" : "Submit rating"}
                        </Button>
                    </Form>
                )}
            </Formik>
        </div>
    );
}
