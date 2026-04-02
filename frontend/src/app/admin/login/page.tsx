"use client";

import { Form, Formik, Field, ErrorMessage } from "formik";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import * as Yup from "yup";
import AxiosHelperAdmin from "@/helpers/AxiosHelperAdmin";
import { Button, Input, PasswordInput } from "@/components/ui";
import { useAppSelector } from "@/store/hooks";
import { resolveFileUrl } from "@/helpers/utils";
import Image from "@/components/ui/Image";
import ThemeToggle from "@/components/admin/ThemeToggle";

const schema = Yup.object({
    identifier: Yup.string().required("Email or mobile is required"),
    password: Yup.string().min(6).required("Password is required")
});

export default function AdminLoginPage() {
    const router = useRouter();
    const settings = useAppSelector((state) => state.settings);
    const appName = settings.application_name || "Service Manage";
    const logoSrc = resolveFileUrl(settings.logo);

    return <div className="relative min-h-screen flex items-center justify-center p-2 lg:p-4 bg-linear-to-br from-[#f3f7ff] via-white to-[#e8efff] dark:from-[#0b1020] dark:via-[#111a2f] dark:to-[#172443]">
        <ThemeToggle className="absolute right-3 top-3" />
        <div className="mx-auto grid max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 md:grid-cols-2">
            <div className="bg-linear-to-br from-slate-900 via-slate-800 to-indigo-900 p-8 text-white">
                <div className="flex items-center gap-2">
                    {logoSrc ? <Image src={logoSrc} alt={`${appName} logo`} className="h-8 w-8 rounded object-cover" /> : null}
                    <p className="text-xs uppercase tracking-widest text-slate-300">{appName}</p>
                </div>
                <h1 className="mt-3 text-3xl font-semibold">Admin Control Hub</h1>
                <p className="mt-3 text-sm text-slate-200">Secure login for operations, analytics, provider approvals, and system control.</p>
                <div className="mt-8 rounded-xl border border-white/20 bg-white/10 p-4 text-sm">
                    <p>Use your admin email/mobile and password to continue.</p>
                </div>
            </div>
            <div className="p-8">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Login</h2>
                <p className="mb-4 mt-1 text-sm text-slate-600 dark:text-slate-300">Sign in to manage your platform.</p>
                <Formik
                    initialValues={{ identifier: "", password: "" }}
                    validationSchema={schema}
                    onSubmit={async (values, { setSubmitting }) => {
                        const { data } = await AxiosHelperAdmin.postData("/login", values);
                        if (data.status) {
                            toast.success(data.message);
                            router.push("/admin/dashboard");
                        } else {
                            toast.error(data.message);
                            setSubmitting(false);
                        }
                    }}
                >
                    {({ isSubmitting }) => (
                        <Form className="space-y-3">
                            <div>
                                <Field as={Input} name="identifier" placeholder="Email or mobile" autoComplete="username" />
                                <ErrorMessage className="text-xs text-red-600" name="identifier" component="small" />
                            </div>
                            <div>
                                <Field as={PasswordInput} name="password" placeholder="Password" autoComplete="current-password" />
                                <ErrorMessage className="text-xs text-red-600" name="password" component="small" />
                            </div>
                            <div className="text-right text-sm dark:text-slate-300">
                                <Link href="/admin/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400">
                                    Forgot password?
                                </Link>
                            </div>
                            <Button type="submit" variant="primary" size="md" fullWidth disabled={isSubmitting}>
                                {isSubmitting ? "Please wait..." : "Login"}
                            </Button>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    </div>
}
