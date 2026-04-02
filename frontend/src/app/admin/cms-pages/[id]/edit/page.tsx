"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { ArrowLeft } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import PermissionBlock from "@/components/admin/PermissionBlock";
import { Button } from "@/components/ui";
import AxiosHelperAdmin from "@/helpers/AxiosHelperAdmin";
import CmsPageForm, { CmsPageFormValues } from "@/components/admin/CmsPageForm";

const emptyValues: CmsPageFormValues = {
    _id: "",
    pageSlug: "",
    pageTitle: "",
    pageTitleHi: "",
    metaDescription: "",
    metaKeywords: "",
    content: "",
    contentHi: "",
    viewCount: 0
};

export default function EditCmsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [values, setValues] = useState<CmsPageFormValues>(emptyValues);

    const getData = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        const { data } = await AxiosHelperAdmin.getData(`/cms-pages/${id}`);
        if (data?.status && data?.data) {
            setValues(data.data as CmsPageFormValues);
        } else {
            toast.error(data?.message || "CMS page not found.");
            router.push("/admin/cms-pages");
        }
        setLoading(false);
    }, [id, router]);

    useEffect(() => { (() => { getData(); })(); }, [getData]);

    return (
        <section className="space-y-4">
            <AdminPageHeader
                title="Update CMS Page"
                subtitle={loading ? "Loading..." : "Edit page content and SEO fields."}
                action={
                    <Link href="/admin/cms-pages">
                        <Button variant="secondary" size="md">
                            <ArrowLeft className="h-4 w-4" />
                            Back to list
                        </Button>
                    </Link>
                }
            />

            <PermissionBlock permission_id={412}>
                <div className="rounded-2xl border border-indigo-100 bg-white p-4 dark:border-indigo-100 dark:bg-slate-900">
                    <CmsPageForm
                        isEdit={true}
                        initialValues={values}
                        isLoading={loading}
                        submitLabel="Update CMS Page"
                        onSubmit={async (formValues, { setSubmitting, setErrors }) => {
                            const { data } = await AxiosHelperAdmin.putData(`/cms-pages/${formValues._id}`, formValues);
                            if (data?.status) {
                                toast.success(data.message || "CMS page updated.");
                                router.push("/admin/cms-pages");
                            } else {
                                toast.error(data?.message || "Could not update CMS page.");
                                setErrors((data?.data || {}) as Record<string, string>);
                            }
                            setSubmitting(false);
                        }}
                    />
                </div>
            </PermissionBlock>
        </section>
    );
}

