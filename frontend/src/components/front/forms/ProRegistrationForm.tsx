"use client"

import { Formik, Form, Field, ErrorMessage } from "formik"
import { Button, Input, Label, OtpField, Textarea, FrontAsyncSelect } from "@/components/front/ui"
import * as Yup from "yup"
import { toast } from "react-toastify";
import AxiosHelper from "@/helpers/AxiosHelper"
import { OTP_REGEXP, PHONE_REGEXP } from "@/config";
import { useMemo, useState } from "react"
import { ArrowRight } from "lucide-react";

const ProRegistrationForm = () => {

    const [step, setStep] = useState<"details" | "otp">("details");
    const [city, setCity] = useState<{ value: string; label: string } | null>(null);
    const [serviceCategory, setServiceCategory] = useState<{ value: string; label: string } | null>(null);

    const loadCityOptions = async (inputValue: string) => {
        const { data } = await AxiosHelper.getData("/cities-with-state", { query: inputValue, limit: 20 });
        if (data.status && Array.isArray(data.data)) {
            return data.data;
        } else {
            return [];
        }
    };

    const loadServiceCategoryOptions = async (inputValue: string) => {
        const { data } = await AxiosHelper.getData("/service-categories-list", { query: inputValue, limit: 20 });
        if (data.status && Array.isArray(data.data)) {
            return data.data;
        } else {
            return [];
        }
    };

    const validationSchema = useMemo(() => {
        const base = {
            name: Yup.string().trim().min(2, "Full name must be at least 2 characters.").required("Full name is required."),
            mobile: Yup.string().trim().required("Mobile number is required.").matches(PHONE_REGEXP, "Enter a valid Indian mobile number."),
            email: Yup.string().trim().email("Enter a valid email address.").required("Email is required."),
            cityId: Yup.string().trim().required("City is required."),
            serviceCategoryId: Yup.string().trim().required("Service category is required."),
            panCardNumber: Yup.string().trim().matches(/^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$/, "Enter a valid PAN (e.g. ABCDE1234F).").required("PAN number is required."),
            aadharNumber: Yup.string().trim().matches(/^[0-9]{12}$/, "Aadhar must be exactly 12 digits.").required("Aadhar number is required."),
            experienceYears: Yup.number().typeError("Experience years must be numeric.").min(0, "Experience must be 0 or more.").max(80, "Experience cannot exceed 80 years.").required("Experience years is required."),
            experienceDescription: Yup.string().trim().max(5000, "Description is too long."),
            image: Yup.mixed().required("Profile image is required."),
            panCardDocument: Yup.mixed().required("PAN card document is required."),
            aadharDocument: Yup.mixed().required("Aadhar document is required.")
        };
        if (step === "details") {
            return Yup.object(base);
        }
        return Yup.object({
            ...base,
            otp: Yup.string().trim().required("OTP is required.").matches(OTP_REGEXP, "OTP must be exactly 6 digits.")
        });
    }, [step]);

    const sendOtp = async (mobile: string, setOTP: (otp: string) => void) => {
        const { data } = await AxiosHelper.postData("/service-provider/send-otp", { mobile: mobile.trim(), purpose: "registration" });
        if (data.status) {
            toast.success(data.message || "OTP sent.");
            setStep("otp");
            setOTP(typeof data.data === "string" ? data.data : "");
        } else {
            toast.error(data?.message || "Could not send OTP.");
        }
    };




    return <div className="rounded-2xl bg-background p-8 text-foreground">
        <h2 className="mb-6 text-2xl font-bold">Register as a Pro</h2>
        <Formik
            initialValues={{
                name: "",
                mobile: "",
                email: "",
                cityId: "",
                serviceCategoryId: "",
                panCardNumber: "",
                aadharNumber: "",
                experienceYears: "",
                experienceDescription: "",
                image: null,
                panCardDocument: null,
                aadharDocument: null,
                otp: ""
            }}
            validationSchema={validationSchema}
            onSubmit={async (values, { resetForm, setFieldValue }) => {
                if (step === "details") {
                    await sendOtp(values.mobile, (otp) => { setFieldValue("otp", otp); });
                    return;
                }

                const { data } = await AxiosHelper.postData("/service-provider/register", values, true);
                if (data.status) {
                    toast.success(data.message || "Registration submitted successfully.");
                    resetForm();
                    setServiceCategory(null);
                    setCity(null);
                    setStep("details");
                } else {
                    toast.error(data?.message || "Unable to submit registration.");
                }
            }}
        >
            {({ setFieldValue, isSubmitting, values }) => {
                const locked = isSubmitting || step === "otp";
                return (
                    <Form className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                            <Label required>Full Name</Label>
                            <Field as={Input} name="name" type="text" placeholder="John Doe" maxLength={100} disabled={locked} />
                            <ErrorMessage name="name" component="small" className="mt-1 block text-xs text-rose-600" />
                        </div>
                        <div>
                            <Label required>Phone Number</Label>
                            <Field as={Input} name="mobile" type="tel" placeholder="9876543210" inputMode="numeric" maxLength={10} disabled={locked} />
                            <ErrorMessage name="mobile" component="small" className="mt-1 block text-xs text-rose-600" />
                        </div>
                        <div>
                            <Label required>Email Address</Label>
                            <Field as={Input} name="email" type="email" placeholder="john@example.com" maxLength={100} disabled={locked} />
                            <ErrorMessage name="email" component="small" className="mt-1 block text-xs text-rose-600" />
                        </div>
                        <div>
                            <Label required>City</Label>
                            <FrontAsyncSelect
                                instanceId="join-pro-city-select"
                                inputId="join-pro-city-select-input"
                                cacheOptions
                                defaultOptions
                                loadOptions={loadCityOptions}
                                isSearchable
                                isDisabled={locked}
                                placeholder="Select city"
                                value={city}
                                onChange={(option) => {
                                    setFieldValue("cityId", option?.value || "")
                                    setCity(option || null);
                                }}
                            />
                            <ErrorMessage name="cityId" component="small" className="mt-1 block text-xs text-rose-600" />
                        </div>
                        <div>
                            <Label required>Service Category</Label>
                            <FrontAsyncSelect
                                instanceId="join-pro-service-category-select"
                                inputId="join-pro-service-category-select-input"
                                cacheOptions
                                defaultOptions
                                loadOptions={loadServiceCategoryOptions}
                                isSearchable
                                isDisabled={locked}
                                placeholder="Select service category"
                                value={serviceCategory}
                                onChange={(option) => {
                                    setFieldValue("serviceCategoryId", option?.value || "")
                                    setServiceCategory(option || null);
                                }}
                            />
                            <ErrorMessage name="serviceCategoryId" component="small" className="mt-1 block text-xs text-rose-600" />
                        </div>
                        <div>
                            <Label required>PAN Number</Label>
                            <Field as={Input} name="panCardNumber" type="text" placeholder="ABCDE1234F" maxLength={10} disabled={locked} />
                            <ErrorMessage name="panCardNumber" component="small" className="mt-1 block text-xs text-rose-600" />
                        </div>
                        <div>
                            <Label required>Aadhar Number</Label>
                            <Field as={Input} name="aadharNumber" type="text" placeholder="123412341234" maxLength={12} disabled={locked} />
                            <ErrorMessage name="aadharNumber" component="small" className="mt-1 block text-xs text-rose-600" />
                        </div>
                        <div>
                            <Label required>Years of Experience</Label>
                            <Field as={Input} name="experienceYears" type="number" min={0} max={80} placeholder="3" disabled={locked} />
                            <ErrorMessage name="experienceYears" component="small" className="mt-1 block text-xs text-rose-600" />
                        </div>
                        <div className="col-span-1 sm:col-span-2">
                            <Label>Experience Description</Label>
                            <Field as={Textarea} name="experienceDescription" rows={4} placeholder="Briefly describe your experience" maxLength={5000} disabled={locked} />
                            <ErrorMessage name="experienceDescription" component="small" className="mt-1 block text-xs text-rose-600" />
                        </div>
                        <div>
                            <Label required>Profile Image</Label>
                            <Input type="file" accept="image/*,application/pdf" disabled={locked} onChange={(e) => setFieldValue("image", e.currentTarget.files?.[0] ?? null)} />
                            <ErrorMessage name="image" component="small" className="mt-1 block text-xs text-rose-600" />
                        </div>
                        <div>
                            <Label required>PAN Card Document</Label>
                            <Input type="file" accept="image/*,application/pdf" disabled={locked} onChange={(e) => setFieldValue("panCardDocument", e.currentTarget.files?.[0] ?? null)} />
                            <ErrorMessage name="panCardDocument" component="small" className="mt-1 block text-xs text-rose-600" />
                        </div>
                        <div>
                            <Label required>Aadhar Document</Label>
                            <Input type="file" accept="image/*,application/pdf" disabled={locked} onChange={(e) => setFieldValue("aadharDocument", e.currentTarget.files?.[0] ?? null)} />
                            <ErrorMessage name="aadharDocument" component="small" className="mt-1 block text-xs text-rose-600" />
                        </div>
                        {step === "otp" ? (
                            <div className="col-span-1 md:col-span-2 rounded-lg border border-border bg-muted/30 p-4">
                                <p className="mb-3 text-sm text-muted-foreground">
                                    Enter the 6-digit code sent to <span className="font-medium text-foreground">{values.mobile}</span>
                                </p>
                                <OtpField
                                    value={values.otp}
                                    onChange={(next) => setFieldValue("otp", next)}
                                    disabled={isSubmitting}
                                    onResend={async () => {
                                        if (!PHONE_REGEXP.test(values.mobile.trim())) return;
                                        await sendOtp(values.mobile, (otp) => { setFieldValue("otp", otp); });
                                    }}
                                />
                                <ErrorMessage name="otp" component="small" className="mt-1 block text-xs text-rose-600" />
                            </div>
                        ) : null}
                        <div className="col-span-1 sm:col-span-2 flex flex-col gap-2 pt-2 sm:flex-row sm:items-center">
                            {step === "otp" ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full sm:w-auto shrink-0"
                                    onClick={() => {
                                        setStep("details");
                                        setFieldValue("otp", "");
                                    }}
                                    disabled={isSubmitting}
                                >
                                    Back to edit
                                </Button>
                            ) : null}
                            <Button type="submit" className="min-w-0 flex-1 bg-primary text-primary-foreground hover:bg-primary/90" disabled={isSubmitting}>
                                {isSubmitting ? "Please wait..." : step === "details" ? "Send verification code" : "Submit application"}
                                {step === "otp" ? <ArrowRight className="ml-2 h-4 w-4 shrink-0" /> : null}
                            </Button>
                        </div>
                    </Form>
                );
            }}
        </Formik>
        <p className="mt-4 text-center text-xs text-muted-foreground">
            By registering, you agree to our Terms of Service and Privacy Policy
        </p>
    </div>
}

export default ProRegistrationForm