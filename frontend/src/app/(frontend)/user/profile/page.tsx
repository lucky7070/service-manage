"use client";

import { useMemo, useState } from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { Edit2 } from "lucide-react";
import { toast } from "react-toastify";
import Image from "@/components/ui/Image";
import AccountNav from "@/components/front/user/AccountNav";
import { Button, Input, Label, Select } from "@/components/front/ui";
import AxiosHelper from "@/helpers/AxiosHelper";
import { resolveFileUrl } from "@/helpers/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateUser, type UserState } from "@/store/slices/userSlice";

const validationSchema = Yup.object().shape({
    name: Yup.string().trim().min(2, "Name must be at least 2 characters.").max(100, "Name is too long.").required("Name is required."),
    email: Yup.string().trim().email("Invalid email.").nullable(),
    dateOfBirth: Yup.string().nullable(),
    preferredLanguage: Yup.string().oneOf(["en", "hi"]).required("Preferred language is required.")
});

export default function CustomerProfilePage() {
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.user);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imageUploading, setImageUploading] = useState(false);

    const imgUrl = useMemo(() => selectedImage ? URL.createObjectURL(selectedImage) : null, [selectedImage])

    const uploadProfileImage = async () => {
        if (!selectedImage) {
            toast.error("Please choose a photo first.");
            return;
        }

        setImageUploading(true);
        const formData = new FormData();
        formData.append("image", selectedImage);
        const { data } = await AxiosHelper.putData("/customer/profile/image", formData, true);
        if (data.status) {
            toast.success(data.message || "Photo updated.");
            dispatch(updateUser(data.data as Partial<UserState>));
            setSelectedImage(null);
        } else {
            toast.error(data.message || "Could not upload photo.");
        }
        setImageUploading(false);
    };

    return (
        <section className="bg-muted/30 py-10">
            <div className="container mx-auto px-4">
                <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
                    <AccountNav />
                    <div className="min-w-0 space-y-6">
                        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                            <h2 className="text-lg font-semibold">Profile photo</h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Upload a picture for your account. This is saved separately from your name and contact details below.
                            </p>
                            <div className="mt-4 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                                <input
                                    id="customer-profile-photo"
                                    type="file"
                                    accept="image/*"
                                    className="sr-only"
                                    onChange={(e) => setSelectedImage(e.target.files?.[0] ?? null)}
                                />
                                <label
                                    htmlFor="customer-profile-photo"
                                    className="group relative flex h-24 w-24 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-muted/40 transition hover:border-primary/40 hover:bg-muted/60"
                                >
                                    <span className="absolute -right-0.5 -top-0.5 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition group-hover:text-primary">
                                        <Edit2 className="h-3.5 w-3.5" aria-hidden />
                                    </span>
                                    <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-primary/10 text-2xl font-semibold text-primary">
                                        {imgUrl ? (
                                            <Image src={imgUrl} alt="Your profile photo" className="h-full w-full object-cover" />
                                        ) : user.image ? (
                                            <Image src={String(resolveFileUrl(user.image))} alt="Your profile photo" className="h-full w-full object-cover" />
                                        ) : (
                                            <span className="select-none" aria-hidden>{(user.name?.charAt(0) || "?").toUpperCase()}</span>
                                        )}
                                    </span>
                                </label>
                                <div className="flex min-w-0 flex-1 flex-col gap-2">
                                    <p className="text-xs text-muted-foreground">JPG, PNG or Webp. Max 2 MB.</p>
                                    <div className="flex flex-wrap gap-2">
                                        <Button type="button" size="sm" disabled={imageUploading || !selectedImage} onClick={() => void uploadProfileImage()}>
                                            {imageUploading ? "Uploading…" : "Upload photo"}
                                        </Button>
                                        {selectedImage ? <Button type="button" variant="outline" size="sm" disabled={imageUploading} onClick={() => setSelectedImage(null)}>
                                            Clear selection
                                        </Button> : null}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                            <h1 className="text-2xl font-bold">Profile</h1>
                            <p className="mt-1 text-sm text-muted-foreground">Update your account details. Mobile number is verified by OTP and cannot be edited here.</p>
                            <Formik<UserState>
                                initialValues={user}
                                enableReinitialize
                                validationSchema={validationSchema}
                                onSubmit={async (values, { setSubmitting, setErrors }) => {
                                    const { data } = await AxiosHelper.putData("/customer/profile", {
                                        name: values.name,
                                        email: values.email,
                                        dateOfBirth: values.dateOfBirth,
                                        preferredLanguage: values.preferredLanguage
                                    });
                                    if (data.status) {
                                        toast.success(data.message || "Profile updated.");
                                        dispatch(updateUser(data.data as UserState));
                                    } else {
                                        toast.error(data.message || "Could not update profile.");
                                        setErrors(data.data || {});
                                    }
                                    setSubmitting(false);
                                }}
                            >
                                {({ isSubmitting }) => (
                                    <Form className="mt-6 space-y-4">
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="profile-name" required>Full Name</Label>
                                                <Field as={Input} id="profile-name" name="name" placeholder="Your full name" />
                                                <ErrorMessage className="mt-1 block text-xs text-rose-600" name="name" component="small" />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="profile-mobile">Mobile</Label>
                                                <Field as={Input} id="profile-mobile" name="mobile" disabled />
                                            </div>
                                        </div>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="profile-email">Email</Label>
                                                <Field as={Input} id="profile-email" name="email" type="email" placeholder="you@example.com" />
                                                <ErrorMessage className="mt-1 block text-xs text-rose-600" name="email" component="small" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="profile-dob">Date of Birth</Label>
                                                <Field as={Input} id="profile-dob" name="dateOfBirth" type="date" />
                                                <ErrorMessage className="mt-1 block text-xs text-rose-600" name="dateOfBirth" component="small" />
                                            </div>
                                        </div>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="profile-language">Preferred Language</Label>
                                                <Field as={Select} id="profile-language" name="preferredLanguage">
                                                    <option value="en">English</option>
                                                    <option value="hi">Hindi</option>
                                                </Field>
                                                <ErrorMessage className="mt-1 block text-xs text-rose-600" name="preferredLanguage" component="small" />
                                            </div>
                                        </div>
                                        <Button type="submit" disabled={isSubmitting}>
                                            {isSubmitting ? "Saving..." : "Save Profile"}
                                        </Button>
                                    </Form>
                                )}
                            </Formik>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
