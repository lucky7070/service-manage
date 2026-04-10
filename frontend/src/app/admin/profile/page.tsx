"use client";

import { useEffect, useState } from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import AxiosHelperAdmin from "@/helpers/AxiosHelperAdmin";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Button, Input, InputFile, Label, PasswordInput } from "@/components/ui";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { PHONE_ERROR_MESSAGE, PHONE_REGEXP } from "@/config";
import { resolveFileUrl } from "@/helpers/utils";
import Image from "@/components/ui/Image";
import { Edit2Icon } from "lucide-react";

type AdminProfile = {
    name: string;
    email?: string | null;
    mobile: string;
    userId?: string;
    image?: string | null;
};

const profileValidationSchema = Yup.object().shape({
    name: Yup.string().min(2, "Too Short!").max(100, "Too Long!").required("Name Required.").trim(),
    mobile: Yup.string().matches(PHONE_REGEXP, PHONE_ERROR_MESSAGE).length(10, 'Mobile number must be exactly 10 digits.').required("Mobile Required."),
    email: Yup.string().email("Invalid email").required("Email Required.")
});

const passwordValidationSchema = Yup.object().shape({
    current_password: Yup.string()
        .required("Current password is required.")
        .min(8, "Current password must be at least 8 characters.")
        .max(50, "Current password must be at most 50 characters."),
    new_password: Yup.string()
        .required("New password is required.")
        .min(8, "New password must be at least 8 characters.")
        .max(50, "New password must be at most 50 characters.")
        .notOneOf([Yup.ref("current_password")], "New password must be different from your current password."),
    confirm_password: Yup.string()
        .required("Please confirm your new password.")
        .oneOf([Yup.ref("new_password")], "New password and confirmation do not match."),
});

export default function AdminProfilePage() {

    const router = useRouter();
    const [profile, setProfile] = useState<AdminProfile>({ name: "", mobile: "", email: "" });
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const avatarLetter = (profile.name?.charAt(0) || "A").toUpperCase();

    useEffect(() => {
        (async () => {
            const { data } = await AxiosHelperAdmin.getData("/profile");
            if (data.status) {
                setProfile(data.data);
                setImagePreview(resolveFileUrl(data.data?.image ?? null));
            } else {
                toast.error(data.message || "Unable to load profile.");
                router.push("/admin/dashboard");
            }
        })();
    }, [router]);

    useEffect(() => {
        let cancelled = false;
        let urlToRevoke: string | null = null;

        (async () => {
            if (cancelled) return;

            if (selectedImage) {
                urlToRevoke = URL.createObjectURL(selectedImage);
                if (!cancelled) setImagePreview(urlToRevoke);
            } else {
                if (!cancelled) setImagePreview(resolveFileUrl(profile.image ?? null));
            }
        })();

        return () => {
            cancelled = true;
            if (urlToRevoke) URL.revokeObjectURL(urlToRevoke);
        };
    }, [selectedImage, profile.image]);

    const updateProfileImage = async () => {
        if (!selectedImage) {
            toast.error("Please select an image.");
            return;
        }

        const formData = new FormData();
        formData.append("image", selectedImage);
        const { data } = await AxiosHelperAdmin.putData("/profile/image", formData, true);
        if (data.status) {
            toast.success(data.message);
            setProfile(data.data || null);
            setImagePreview(resolveFileUrl(data.data?.image ?? null));
            setSelectedImage(null);
        } else {
            toast.error(data.message);
        }
    };

    return (
        <section className="space-y-4">
            <AdminPageHeader title="Profile" subtitle="Manage account profile and admin identity details." />
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-5">
                <div className="lg:col-span-1">
                    <div className="flex h-full flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-700 dark:bg-slate-900">
                        <InputFile id="profile-image" accept="image/*" onChange={(e) => setSelectedImage(e.target.files?.[0] || null)} className="hidden" />
                        <Label
                            htmlFor="profile-image"
                            className="mb-0! group relative flex h-24 w-24 cursor-pointer items-center justify-center rounded-full transition-all hover:scale-[1.02]"
                        >
                            <span className="absolute -right-1 -top-1 z-10 inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition-colors group-hover:bg-indigo-50 dark:border-slate-600 dark:bg-slate-800 dark:group-hover:bg-slate-700">
                                <Edit2Icon className="h-3.5 w-3.5 text-slate-700 dark:text-slate-100" />
                            </span>
                            <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-900 text-3xl font-semibold text-white ring-1 ring-slate-700/60 dark:border-slate-700">
                                {imagePreview ? (
                                    <Image src={imagePreview} alt="Profile preview" className="h-full w-full object-cover" />
                                ) : (
                                    <span className="select-none">{avatarLetter}</span>
                                )}
                            </div>
                        </Label>
                        <p className="text-center text-xs text-slate-500 dark:text-slate-300">Click avatar to choose image</p>
                        <div className="space-y-2 text-center">
                            <Button type="button" variant="secondary" size="sm" onClick={updateProfileImage}>
                                Update Image
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-2">
                    <Formik
                        initialValues={{
                            name: profile.name || "",
                            email: profile.email || "",
                            mobile: profile.mobile || ""
                        }}
                        enableReinitialize
                        validationSchema={profileValidationSchema}
                        onSubmit={async (values, { setSubmitting, setErrors }) => {
                            const { data } = await AxiosHelperAdmin.putData("/profile", values);
                            if (data.status) {
                                toast.success(data.message);
                                setProfile(data.data);
                            } else {
                                toast.error(data.message);
                                setErrors(data.data);
                            }
                            setSubmitting(false);
                        }}
                    >
                        {({ isSubmitting }) => (
                            <Form className="space-y-4 rounded-2xl border border-slate-200 p-4 text-sm dark:border-slate-700 dark:bg-slate-900">
                                <div className="grid gap-3 md:grid-cols-1">
                                    <div className="space-y-1">
                                        <Label htmlFor="profile-name">Name</Label>
                                        <Field as={Input} id="profile-name" name="name" placeholder="Enter name" />
                                        <ErrorMessage className="text-xs text-rose-600" name="name" component="small" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="profile-mobile">Mobile</Label>
                                        <Field as={Input} id="profile-mobile" name="mobile" placeholder="Enter mobile" />
                                        <ErrorMessage className="text-xs text-rose-600" name="mobile" component="small" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="profile-email">Email</Label>
                                        <Field as={Input} id="profile-email" name="email" type="email" placeholder="Enter email" />
                                        <ErrorMessage className="text-xs text-rose-600" name="email" component="small" />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between gap-3 pt-1">
                                    <Button type="submit" variant="primary" size="md" disabled={isSubmitting}>
                                        {isSubmitting ? "Updating..." : "Update Profile"}
                                    </Button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
                <div className="lg:col-span-2">
                    <Formik
                        initialValues={{
                            current_password: '',
                            new_password: '',
                            confirm_password: '',
                        }}
                        enableReinitialize
                        validationSchema={passwordValidationSchema}
                        onSubmit={async (values, { setSubmitting, setErrors, resetForm }) => {
                            const { data } = await AxiosHelperAdmin.putData("/profile/password", values);
                            if (data.status) {
                                toast.success(data.message);
                                resetForm();
                            } else {
                                toast.error(data.message);
                                setErrors(data.data);
                            }
                            setSubmitting(false);
                        }}
                    >
                        {({ isSubmitting }) => (
                            <Form className="space-y-4 rounded-2xl border border-slate-200 p-4 text-sm dark:border-slate-700 dark:bg-slate-900">
                                <div className="grid gap-3 md:grid-cols-1">
                                    <div className="space-y-1">
                                        <Label htmlFor="current_password">Current Password</Label>
                                        <Field as={PasswordInput} id="current_password" name="current_password" placeholder="Enter Current Password" />
                                        <ErrorMessage className="text-xs text-rose-600" name="current_password" component="small" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="new_password">New Password</Label>
                                        <Field as={PasswordInput} id="new_password" name="new_password" placeholder="Enter New Password" />
                                        <ErrorMessage className="text-xs text-rose-600" name="new_password" component="small" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="confirm_password">Confirm Password</Label>
                                        <Field as={PasswordInput} id="confirm_password" name="confirm_password" placeholder="Enter Confirm Password" />
                                        <ErrorMessage className="text-xs text-rose-600" name="confirm_password" component="small" />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between gap-3 pt-1">
                                    <Button type="submit" variant="primary" size="md" disabled={isSubmitting}>
                                        {isSubmitting ? "Updating..." : "Update Password"}
                                    </Button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </section>
    );
}
