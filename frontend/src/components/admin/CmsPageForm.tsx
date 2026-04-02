"use client";

import { ChangeEvent } from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { Button, Input, Label, Textarea } from "@/components/ui";

export type CmsPageFormValues = {
    _id?: string;
    pageSlug: string;
    pageTitle: string;
    pageTitleHi?: string;
    metaDescription?: string;
    metaKeywords?: string;
    content?: string;
    contentHi?: string;
    viewCount: number;
};

export const cmsPageValidationSchema = Yup.object().shape({
    pageSlug: Yup.string().min(2, "Too short.").max(150, "Too long.").matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only.").required("Page slug is required.").trim(),
    pageTitle: Yup.string().min(2, "Too short.").max(255, "Too long.").required("Page title is required.").trim(),
    pageTitleHi: Yup.string().max(255, "Too long.").nullable(),
    metaDescription: Yup.string().max(5000, "Too long.").nullable(),
    metaKeywords: Yup.string().max(5000, "Too long.").nullable(),
    content: Yup.string().max(200000, "Too long.").nullable(),
    contentHi: Yup.string().max(200000, "Too long.").nullable(),
    viewCount: Yup.number().min(0, "Cannot be negative.").required("View count is required.")
});

type Props = {
    isEdit?: boolean;
    initialValues: CmsPageFormValues;
    submitLabel: string;
    isLoading?: boolean;
    onSubmit: (values: CmsPageFormValues, helpers: { setSubmitting: (flag: boolean) => void; setErrors: (errors: Record<string, string>) => void; resetForm: () => void; }) => Promise<void>;   
};

export default function CmsPageForm({ isEdit = false, initialValues, submitLabel, onSubmit, isLoading = false }: Props) {
    return (
        <Formik initialValues={initialValues} enableReinitialize validationSchema={cmsPageValidationSchema} onSubmit={onSubmit}>
            {({ isSubmitting, setFieldValue, values }) => (
                <Form className="space-y-3">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="cms-page-title">Page title</Label>
                            <Field as={Input} id="cms-page-title" name="pageTitle" placeholder="About Us" disabled={isLoading} />
                            <ErrorMessage className="text-xs text-rose-600" name="pageTitle" component="small" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cms-page-slug">Page slug</Label>
                            <Field
                                as={Input}
                                id="cms-page-slug"
                                name="pageSlug"
                                placeholder="about-us"
                                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                    const next = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-{2,}/g, "-");
                                    setFieldValue("pageSlug", next);
                                }}
                                value={values.pageSlug}
                                disabled={isLoading}
                                readOnly={isEdit}
                            />
                            <ErrorMessage className="text-xs text-rose-600" name="pageSlug" component="small" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="cms-page-title-hi">Page title (Hindi)</Label>
                            <Field as={Input} id="cms-page-title-hi" name="pageTitleHi" placeholder="हमारे बारे में" disabled={isLoading} />
                            <ErrorMessage className="text-xs text-rose-600" name="pageTitleHi" component="small" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cms-page-views">View count</Label>
                            <Field as={Input} id="cms-page-views" name="viewCount" type="number" min={0} disabled={isLoading} />
                            <ErrorMessage className="text-xs text-rose-600" name="viewCount" component="small" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="cms-page-meta-description">Meta description</Label>
                        <Field as={Textarea} id="cms-page-meta-description" name="metaDescription" className="min-h-20" placeholder="SEO description..." disabled={isLoading} />
                        <ErrorMessage className="text-xs text-rose-600" name="metaDescription" component="small" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cms-page-meta-keywords">Meta keywords</Label>
                        <Field as={Textarea} id="cms-page-meta-keywords" name="metaKeywords" className="min-h-20" placeholder="keyword1, keyword2, keyword3" disabled={isLoading} />
                        <ErrorMessage className="text-xs text-rose-600" name="metaKeywords" component="small" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cms-page-content">Content</Label>
                        <Field as={Textarea} id="cms-page-content" name="content" className="min-h-40" placeholder="Page content..." disabled={isLoading} />
                        <ErrorMessage className="text-xs text-rose-600" name="content" component="small" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cms-page-content-hi">Content (Hindi)</Label>
                        <Field as={Textarea} id="cms-page-content-hi" name="contentHi" className="min-h-40" placeholder="पेज कंटेंट..." disabled={isLoading} />
                        <ErrorMessage className="text-xs text-rose-600" name="contentHi" component="small" />
                    </div>

                    <div className="pt-1">
                        <Button type="submit" variant="primary" size="md" fullWidth disabled={isSubmitting || isLoading}>
                            {isSubmitting ? "Saving..." : submitLabel}
                        </Button>
                    </div>
                </Form>
            )}
        </Formik>
    );
}

