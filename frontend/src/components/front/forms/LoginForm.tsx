"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Formik, Form, ErrorMessage, Field } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { Phone } from "lucide-react";
import AxiosHelper from "@/helpers/AxiosHelper";
import { OTP_REGEXP, PHONE_REGEXP } from "@/config";
import { OtpField, Label, Button, Input } from "@/components/front/ui";
import { useAppDispatch } from "@/store/hooks";
import { updateUser, type UserState } from "@/store/slices/userSlice";

type LoginValues = {
    mobile: string;
    otp: string;
    remember: boolean;
};

export default function LoginForm() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [step, setStep] = useState<"mobile" | "otp">("mobile");
    const [loading, setLoading] = useState(false);

    const schema = step === "mobile"
        ? Yup.object({ mobile: Yup.string().trim().required("Mobile number is required.").matches(PHONE_REGEXP, "Enter a valid Indian mobile number.") })
        : Yup.object({
            mobile: Yup.string().trim().required("Mobile number is required.").matches(PHONE_REGEXP, "Enter a valid Indian mobile number."),
            otp: Yup.string().trim().required("OTP is required.").matches(OTP_REGEXP, "OTP must be exactly 6 digits.")
        });

    const sendOtp = async (mobile: string, setOTP: (otp: string) => void) => {
        setLoading(true);
        const { data } = await AxiosHelper.postData("/customer/send-otp", { mobile: mobile.trim(), purpose: "login" });
        if (data.status) {
            toast.success(data.message || "OTP sent.");
            setStep("otp");
            setLoading(false);
            setOTP(data.data);
        } else {
            toast.error(data.message || "Could not send OTP.");
            setLoading(false);
        }
    };

    const verifyOtp = async ({ mobile, otp }: { mobile: string, otp: string }) => {
        setLoading(true);
        const { data } = await AxiosHelper.postData("/customer/register", { mobile, otp });
        if (data.status) {
            toast.success(data.message || "Login successful.");
            dispatch(updateUser(data.data as Partial<UserState>));
            
            const redirect = String(new URLSearchParams(window.location.search).get("redirect") || "/user/dashboard");
            router.push(redirect.startsWith("/") ? redirect : "/user/dashboard");
            setLoading(false);
        } else {
            toast.error(data.message || "Invalid OTP.");
            setLoading(false);
        }
    };

    return (
        <Formik<LoginValues>
            initialValues={{ mobile: "", otp: "", remember: false }}
            validationSchema={schema}
            onSubmit={async (values, { setFieldValue }) => {
                if (step === "mobile") {
                    await sendOtp(values.mobile, (otp) => { setFieldValue("otp", otp || ""); });
                } else {
                    await verifyOtp(values);
                }
            }}
        >
            {({ values, setFieldValue, validateField, setFieldTouched }) => (
                <Form className="space-y-4">
                    <div>
                        <Label>Mobile Number</Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Field as={Input} type="tel" placeholder="9876543210" className="pl-10" name="mobile" disabled={loading || step === "otp"} maxLength={10} inputMode="numeric" />
                        </div>
                        <ErrorMessage name="mobile" component="small" className="mt-1 block text-xs text-rose-600" />
                    </div>

                    {step === "otp" ? (
                        <div>
                            <OtpField
                                value={values.otp}
                                onChange={(next) => setFieldValue("otp", next)}
                                disabled={loading}
                                onResend={async () => {
                                    await setFieldTouched("mobile", true, true);
                                    await validateField("mobile");
                                    if (!PHONE_REGEXP.test(values.mobile.trim())) return;
                                    await sendOtp(values.mobile, (otp) => { setFieldValue("otp", otp); });
                                }}
                            />
                            <ErrorMessage name="otp" component="small" className="mt-1 block text-xs text-rose-600" />
                        </div>
                    ) : null}

                    <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2 text-sm">
                            <Field id="remember" name="remember" type="checkbox" className="h-4 w-4 rounded border border-border" />
                            <span className="text-muted-foreground">Remember me</span>
                        </Label>
                    </div>

                    <Button type="submit" className="h-11 w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
                        {loading ? "Please wait..." : step === "mobile" ? "Send OTP" : "Verify & Sign In"}
                    </Button>
                </Form>
            )}
        </Formik>
    );
}

