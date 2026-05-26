import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Formik, type FormikErrors } from "formik";
import { Feather } from "@expo/vector-icons";
import { fetchProviderRatingTags, submitBookingFeedback, type BookingFeedback, type RatingTag } from "../../api";
import FormTextareaField from "../form/FormTextareaField";
import Button from "../ui/Button";
import { bookingFeedbackSchema } from "../../validation/schemas";
import { colors, radius, spacing } from "../../theme/colors";

type BookingFeedbackSectionProps = {
    bookingId: string;
    providerName?: string;
    status: string;
    feedback?: BookingFeedback | null;
    onSaved: () => void;
};

type FeedbackFormValues = {
    starRating: number;
    reviewText: string;
    quickTags: string[];
};

export default function BookingFeedbackSection({ bookingId, providerName, status, feedback, onSaved }: BookingFeedbackSectionProps) {
    if (status !== "completed") return null;

    if (feedback) {
        return (
            <View style={styles.savedCard}>
                <Text style={styles.savedTitle}>Your rating for {providerName || "provider"}</Text>
                <View style={styles.starRow}>
                    {[1, 2, 3, 4, 5].map((n) => (
                        <Feather key={n} name="star" size={18} color={n <= feedback.starRating ? colors.primary : colors.border} />
                    ))}
                </View>
                {feedback.reviewText ? <Text style={styles.savedReview}>{feedback.reviewText}</Text> : null}
            </View>
        );
    }

    return (
        <Formik<FeedbackFormValues>
            initialValues={{ starRating: 0, reviewText: "", quickTags: [] }}
            validationSchema={bookingFeedbackSchema}
            onSubmit={async (values, { setSubmitting }) => {
                try {
                    const response = await submitBookingFeedback(bookingId, {
                        starRating: values.starRating,
                        reviewText: values.reviewText.trim() || undefined,
                        quickTags: values.quickTags,
                    });
                    if (response.status) {
                        Alert.alert("Thank you", response.message || "Feedback submitted.");
                        onSaved();
                    } else {
                        Alert.alert("Could not submit", response.message || "Try again.");
                    }
                } finally {
                    setSubmitting(false);
                }
            }}
        >
            {({ values, errors, touched, submitCount, setFieldValue, handleSubmit, isSubmitting }) => (
                <FeedbackFormBody
                    providerName={providerName}
                    values={values}
                    errors={errors}
                    touched={touched}
                    submitCount={submitCount}
                    setFieldValue={setFieldValue}
                    handleSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                />
            )}
        </Formik>
    );
}

type FeedbackFormBodyProps = {
    providerName?: string;
    values: FeedbackFormValues;
    errors: FormikErrors<FeedbackFormValues>;
    touched: Partial<Record<keyof FeedbackFormValues, boolean>>;
    submitCount: number;
    setFieldValue: (field: keyof FeedbackFormValues, value: FeedbackFormValues[keyof FeedbackFormValues]) => void;
    handleSubmit: () => void;
    isSubmitting: boolean;
};

function FeedbackFormBody({ providerName, values, errors, touched, submitCount, setFieldValue, handleSubmit, isSubmitting }: FeedbackFormBodyProps) {
    const [tags, setTags] = useState<RatingTag[]>([]);

    useEffect(() => {
        void fetchProviderRatingTags().then((res) => {
            if (res.status && Array.isArray(res.data)) setTags(res.data);
        });
    }, []);

    const toggleTag = (id: string) => {
        const next = values.quickTags.includes(id)
            ? values.quickTags.filter((t) => t !== id)
            : [...values.quickTags, id];
        void setFieldValue("quickTags", next);
    };

    const starError = (touched.starRating || submitCount > 0) && errors.starRating ? errors.starRating : undefined;

    return (
        <View style={styles.formCard}>
            <Text style={styles.title}>Rate {providerName || "your provider"}</Text>
            <Text style={styles.sub}>How was your service experience?</Text>
            <View style={styles.starRow}>
                {[1, 2, 3, 4, 5].map((n) => (
                    <Pressable key={n} onPress={() => void setFieldValue("starRating", n)} hitSlop={6}>
                        <Feather name="star" size={32} color={n <= values.starRating ? colors.primary : colors.border} />
                    </Pressable>
                ))}
            </View>
            {starError ? <Text style={styles.error}>{starError}</Text> : null}
            {tags.length ? (
                <View style={styles.tagRow}>
                    {tags.map((tag) => {
                        const active = values.quickTags.includes(tag._id);
                        return (
                            <Pressable key={tag._id} onPress={() => toggleTag(tag._id)} style={[styles.tag, active && styles.tagActive]}>
                                <Text style={[styles.tagText, active && styles.tagTextActive]}>{tag.tagName}</Text>
                            </Pressable>
                        );
                    })}
                </View>
            ) : null}
            <FormTextareaField name="reviewText" label="Review (optional)" placeholder="Share your experience…" />
            <Button label={isSubmitting ? "Submitting…" : "Submit feedback"} onPress={() => handleSubmit()} loading={isSubmitting} fullWidth />
        </View>
    );
}

const styles = StyleSheet.create({
    formCard: { gap: spacing.md },
    savedCard: {
        backgroundColor: colors.orange50,
        borderRadius: radius.x2,
        borderWidth: 1,
        borderColor: colors.orange100,
        padding: spacing.lg,
        gap: spacing.sm,
    },
    savedTitle: { fontSize: 16, fontWeight: "700", color: colors.foreground },
    savedReview: { fontSize: 14, color: colors.mutedForeground, lineHeight: 20 },
    title: { fontSize: 18, fontWeight: "800", color: colors.foreground },
    sub: { fontSize: 14, color: colors.mutedForeground },
    starRow: { flexDirection: "row", gap: 6 },
    error: { fontSize: 12, color: colors.rose },
    tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    tag: {
        borderRadius: radius.x2,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.muted,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    tagActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    tagText: { fontSize: 12, fontWeight: "600", color: colors.foreground },
    tagTextActive: { color: colors.white },
});
