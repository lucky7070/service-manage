"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Form, Formik, Field, ErrorMessage } from "formik";
import { toast } from "react-toastify";
import * as Yup from "yup";
import AxiosHelperAdmin from "@/helpers/AxiosHelperAdmin";
import { Button, Input, Label, PasswordInput, OtpInput } from "@/components/ui";
import { useAppSelector } from "@/store/hooks";
import { resolveFileUrl } from "@/helpers/utils";
import Image from "@/components/ui/Image";
import ThemeToggle from "@/components/admin/ThemeToggle";

const emailSchema = Yup.object({
    email: Yup.string().email("Enter a valid email address.").required("Email is required.")
});

const resetSchema = Yup.object({
    email: Yup.string().email("Enter a valid email address.").required("Email is required."),
    otp: Yup.string().required("Verification code is required.").matches(/^[0-9]{6}$/, "Enter the 6-digit code from your email."),
    new_password: Yup.string().required("New password is required.").min(8, "Password must be at least 8 characters.").max(50, "Password must be at most 50 characters."),
    confirm_password: Yup.string().required("Please confirm your new password.").oneOf([Yup.ref("new_password")], "Passwords do not match.")
});

export default function AdminForgotPasswordPage() {
    const router = useRouter();
    const settings = useAppSelector((state) => state.settings);
    const appName = settings.application_name || "Service Manage";
    const logoSrc = resolveFileUrl(settings.logo);

    const [step, setStep] = useState<1 | 2>(1);
    const [email, setEmail] = useState("");

    return (
        <div className="relative flex min-h-screen items-center justify-center p-2 lg:p-4 bg-linear-to-br from-[#f3f7ff] via-white to-[#e8efff] dark:from-[#0b1020] dark:via-[#111a2f] dark:to-[#172443]">
            <ThemeToggle className="absolute right-3 top-3" />

            <div className="mx-auto grid max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 md:grid-cols-2">
                <div className="bg-linear-to-br from-slate-900 via-slate-800 to-indigo-900 p-8 text-white">
                    <div className="flex items-center gap-2">
                        {logoSrc ? <Image src={logoSrc} alt={`${appName} logo`} className="h-8 w-8 rounded object-cover" /> : null}
                        <p className="text-xs uppercase tracking-widest text-slate-300">{appName}</p>
                    </div>
                    <h1 className="mt-3 text-3xl font-semibold">Reset admin password</h1>
                    <p className="mt-3 text-sm text-slate-200">
                        We&apos;ll email a one-time code to your registered admin email. After you verify the code, you can set a new password.
                    </p>
                    <div className="mt-8 rounded-xl border border-white/20 bg-white/10 p-4 text-sm">
                        <p>Use the email on your admin account only.</p>
                    </div>
                </div>
                <div className="p-8">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                        {step === 1 ? "Request code" : step === 2 ? "Verify code" : "New password"}
                    </h2>
                    <p className="mb-4 mt-1 text-sm text-slate-600 dark:text-slate-300">
                        {step === 1
                            ? "Enter the email address linked to your admin account."
                            : step === 2
                                ? `We sent a 6-digit code to ${email}`
                                : "Choose a strong password you haven’t used here before."}
                    </p>

                    {step === 1 ? (
                        <Formik
                            initialValues={{ email: "" }}
                            validationSchema={emailSchema}
                            onSubmit={async (values, { setSubmitting }) => {
                                const { data } = await AxiosHelperAdmin.postData("/forgot-password", { email: values.email.trim().toLowerCase() });
                                if (data.status) {
                                    toast.success(data.message || "Check your email.");
                                    setEmail(values.email.trim().toLowerCase());
                                    setStep(2);
                                } else {
                                    toast.error(data.message || "Something went wrong.");
                                }
                                setSubmitting(false);
                            }}
                        >
                            {({ isSubmitting }) => (
                                <Form className="space-y-3">
                                    <div className="space-y-1">
                                        <Label htmlFor="forgot-email">Email</Label>
                                        <Field as={Input} id="forgot-email" name="email" type="email" autoComplete="email" placeholder="admin@example.com" />
                                        <ErrorMessage className="text-xs text-rose-600" name="email" component="small" />
                                    </div>
                                    <Button type="submit" variant="primary" size="md" fullWidth disabled={isSubmitting}>
                                        {isSubmitting ? "Sending…" : "Send verification code"}
                                    </Button>
                                </Form>
                            )}
                        </Formik>
                    ) : null}

                    {step === 2 ? (
                        <Formik
                            enableReinitialize
                            initialValues={{ email, otp: "", new_password: "", confirm_password: "" }}
                            validationSchema={resetSchema}
                            onSubmit={async (values, { setSubmitting, setErrors }) => {
                                const { data } = await AxiosHelperAdmin.postData("/forgot-password/reset", values);
                                if (data.status) {
                                    toast.success(data.message || "Password updated.");
                                    router.push("/admin/login");
                                } else {
                                    toast.error(data.message || "Could not reset password.");
                                    if (data?.data && typeof data.data === "object") setErrors(data.data);
                                }

                                setSubmitting(false);
                            }}
                        >
                            {({ isSubmitting, values, setFieldValue }) => (
                                <Form className="space-y-3">
                                    <div className="space-y-1">
                                        <Label htmlFor="forgot-otp">6-digit code</Label>
                                        <OtpInput
                                            value={values.otp}
                                            numInputs={6}
                                            inputType="tel"
                                            shouldAutoFocus
                                            onChange={(otp) => setFieldValue("otp", otp)}
                                            containerClassName="mt-1"
                                        />
                                        <ErrorMessage className="text-xs text-rose-600" name="otp" component="small" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="forgot-new">New password</Label>
                                        <Field as={PasswordInput} id="forgot-new" name="new_password" autoComplete="new-password" placeholder="New password" />
                                        <ErrorMessage className="text-xs text-rose-600" name="new_password" component="small" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="forgot-confirm">Confirm password</Label>
                                        <Field
                                            as={PasswordInput}
                                            id="forgot-confirm"
                                            name="confirm_password"
                                            autoComplete="new-password"
                                            placeholder="Confirm new password"
                                        />
                                        <ErrorMessage className="text-xs text-rose-600" name="confirm_password" component="small" />
                                    </div>
                                    <Button type="submit" variant="primary" size="md" fullWidth disabled={isSubmitting}>
                                        {isSubmitting ? "Saving…" : "Update password"}
                                    </Button>
                                </Form>
                            )}
                        </Formik>
                    ) : null}

                    <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
                        <Link href="/admin/login" className="font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400">
                            Back to login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
