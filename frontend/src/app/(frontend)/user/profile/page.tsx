"use client";

import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import AccountNav from "@/components/front/user/AccountNav";
import { Button, Input, Label, Select } from "@/components/front/ui";
import AxiosHelper from "@/helpers/AxiosHelper";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateUser, UserState } from "@/store/slices/userSlice";

const validationSchema = Yup.object().shape({
    name: Yup.string().trim().min(2, "Name must be at least 2 characters.").max(100, "Name is too long.").required("Name is required."),
    email: Yup.string().trim().email("Invalid email.").nullable(),
    dateOfBirth: Yup.string().nullable(),
    preferredLanguage: Yup.string().oneOf(["en", "hi"]).required("Preferred language is required.")
});

export default function CustomerProfilePage() {

    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.user);

    return (
        <section className="bg-muted/30 py-10">
            <div className="container mx-auto px-4">
                <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
                    <AccountNav />
                    <div className="min-w-0 rounded-3xl border border-border bg-card p-6 shadow-sm">
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
                                    <div className="space-y-2">
                                        <Label htmlFor="profile-name" required>Full Name</Label>
                                        <Field as={Input} id="profile-name" name="name" placeholder="Your full name" />
                                        <ErrorMessage className="text-xs text-rose-600" name="name" component="small" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="profile-mobile">Mobile</Label>
                                        <Field as={Input} id="profile-mobile" name="mobile" disabled />
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="profile-email">Email</Label>
                                            <Field as={Input} id="profile-email" name="email" type="email" placeholder="you@example.com" />
                                            <ErrorMessage className="text-xs text-rose-600" name="email" component="small" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="profile-dob">Date of Birth</Label>
                                            <Field as={Input} id="profile-dob" name="dateOfBirth" type="date" />
                                            <ErrorMessage className="text-xs text-rose-600" name="dateOfBirth" component="small" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="profile-language">Preferred Language</Label>
                                        <Field as={Select} id="profile-language" name="preferredLanguage">
                                            <option value="en">English</option>
                                            <option value="hi">Hindi</option>
                                        </Field>
                                        <ErrorMessage className="text-xs text-rose-600" name="preferredLanguage" component="small" />
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
        </section>
    );
}
