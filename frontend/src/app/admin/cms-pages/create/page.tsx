"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { ArrowLeft } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import PermissionBlock from "@/components/admin/PermissionBlock";
import { Button } from "@/components/ui";
import AxiosHelperAdmin from "@/helpers/AxiosHelperAdmin";
import CmsPageForm, { CmsPageFormValues } from "@/components/admin/CmsPageForm";

const initialValues: CmsPageFormValues = {
    pageSlug: "",
    pageTitle: "",
    pageTitleHi: "",
    metaDescription: "",
    metaKeywords: "",
    content: "",
    contentHi: "",
    viewCount: 0
};

export default function CreateCmsPage() {
    const router = useRouter();

    return (
        <section className="space-y-4">
            <AdminPageHeader
                title="Create CMS Page"
                subtitle="Create a new static page and SEO content."
                action={
                    <Link href="/admin/cms-pages">
                        <Button variant="secondary" size="md">
                            <ArrowLeft className="h-4 w-4" />
                            Back to list
                        </Button>
                    </Link>
                }
            />

            <PermissionBlock permission_id={411}>
                <div className="rounded-2xl border border-indigo-100 bg-white p-4 dark:border-indigo-100 dark:bg-slate-900">
                    <CmsPageForm
                        initialValues={initialValues}
                        submitLabel="Create CMS Page"
                        onSubmit={async (values, { setSubmitting, setErrors }) => {
                            const { data } = await AxiosHelperAdmin.postData("/cms-pages", values);
                            if (data?.status) {
                                toast.success(data.message || "CMS page created.");
                                router.push("/admin/cms-pages");
                            } else {
                                toast.error(data?.message || "Could not create CMS page.");
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

