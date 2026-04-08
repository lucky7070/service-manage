"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Formik, Form, ErrorMessage, Field } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { Button } from "@/components/front/ui/button";
import { Input } from "@/components/front/ui/input";
import OtpField from "./OtpField";
import AxiosHelper from "@/helpers/AxiosHelper";
import { PHONE_REGEXP, OTP_REGEXP } from "@/config";
import Label from "../ui/label";
import { Phone, User } from "lucide-react";

type RegisterValues = {
    name: string;
    mobile: string;
    otp: string;
    acceptedTerms: boolean;
};

const baseValidation = {
    name: Yup.string().trim().min(2, "Full name must be at least 2 characters.").required("Full name is required."),
    mobile: Yup.string().trim().required("Mobile number is required.").matches(PHONE_REGEXP, "Enter a valid Indian mobile number."),
    acceptedTerms: Yup.boolean().oneOf([true], "You must accept Terms and Privacy Policy.")
}

export default function RegisterForm() {
    const router = useRouter();
    const [step, setStep] = useState<"details" | "otp">("details");
    const [loading, setLoading] = useState(false);

    const schema = step === "details"
        ? Yup.object(baseValidation)
        : Yup.object({ ...baseValidation, otp: Yup.string().trim().required("OTP is required.").matches(OTP_REGEXP, "OTP must be exactly 6 digits.") });

    const sendOtp = async (mobile: string, setOTP: (otp: string) => void) => {
        setLoading(true);
        const { data } = await AxiosHelper.postData("/customer/send-otp", { mobile: mobile.trim(), purpose: "registration" });
        if (data.status) {
            toast.success(data.message || "OTP sent.");
            setStep("otp");
            setLoading(false);
            setOTP(data.data);
        } else {
            toast.error(data?.message || "Could not send OTP.");
            setLoading(false);
        }
    };

    const registerAndVerify = async ({ name, mobile, otp }: { name: string, mobile: string, otp: string }) => {
        setLoading(true);
        const { data } = await AxiosHelper.postData("/customer/register", { mobile, otp, name });
        if (data.status) {
            toast.success(data.message || "Account created successfully.");
            router.push("/user/dashboard");
            setLoading(false);
        } else {
            toast.error(data?.message || "Invalid OTP.");
            setLoading(false);
        }
    };

    return (
        <Formik<RegisterValues>
            initialValues={{ name: "", mobile: "", otp: "", acceptedTerms: false }}
            validationSchema={schema}
            onSubmit={async (values, { setFieldValue }) => {
                if (step === "details") {
                    await sendOtp(values.mobile, (otp) => { setFieldValue("otp", otp); });
                } else {
                    await registerAndVerify(values);
                }
            }}
        >
            {({ values, setFieldValue, validateField, setFieldTouched }) => (
                <Form className="space-y-4">
                    <div>
                        <Label>Full Name</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Field as={Input} className="pl-10" type="text" placeholder="John Doe" name="name" disabled={loading || step === "otp"} maxLength={50} />
                        </div>
                        <ErrorMessage name="name" component="small" className="mt-1 block text-red-600" />
                    </div>

                    <div>
                        <Label>Phone Number</Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Field as={Input} className="pl-10" type="tel" placeholder="9876543210" name="mobile" disabled={loading || step === "otp"} inputMode="numeric" maxLength={10} />
                        </div>
                        <ErrorMessage name="mobile" component="small" className="mt-1 block text-red-600" />
                    </div>

                    {step === "otp" ? (
                        <div>
                            <OtpField
                                value={values.otp}
                                onChange={(next) => setFieldValue("otp", next)}
                                disabled={loading}
                                onResend={async () => {
                                    await setFieldTouched("name", true, true);
                                    await setFieldTouched("mobile", true, true);
                                    await validateField("name");
                                    await validateField("mobile");
                                    if (values.name.trim().length < 2 || !PHONE_REGEXP.test(values.mobile.trim())) return;
                                    await sendOtp(values.mobile, (otp) => { setFieldValue("otp", otp); });
                                }}
                            />
                            <ErrorMessage name="otp" component="small" className="mt-1 block text-xs text-rose-600" />
                        </div>
                    ) : null}

                    <Label className="flex items-start gap-2 text-sm">
                        <Field type="checkbox" name="acceptedTerms" className="mt-0.5 h-4 w-4 rounded border border-border" />
                        <span className="text-muted-foreground">
                            I agree to the {" "}
                            <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>{" "}
                            and {" "}
                            <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                        </span>
                    </Label>
                    <ErrorMessage name="acceptedTerms" component="small" className="-mt-2 block text-xs text-rose-600" />

                    <Button type="submit" className="h-11 w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
                        {loading ? "Please wait..." : step === "details" ? "Send OTP" : "Verify & Create Account"}
                    </Button>
                </Form>
            )}
        </Formik>
    );
}

