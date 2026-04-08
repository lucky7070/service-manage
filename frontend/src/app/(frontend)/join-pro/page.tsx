"use client"

import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import { toast } from "react-toastify"
import FrontAsyncSelect from "@/components/front/ui/async-select"
import { Header } from "@/components/front/header"
import { Footer } from "@/components/front/footer"
import { Input } from "@/components/front/ui/input"
import { Button } from "@/components/front/ui/button"
import Label from "@/components/front/ui/label"
import AxiosHelper from "@/helpers/AxiosHelper"
import { PHONE_REGEXP } from "@/config"
import { Briefcase, TrendingUp, Calendar, Shield, Users, Smartphone, CheckCircle, ArrowRight, Star, IndianRupee } from "lucide-react"
import { Textarea } from "@/components/front/ui/textarea"
import { useState } from "react"


const benefits = [
    {
        icon: TrendingUp,
        title: "Grow Your Business",
        description: "Access thousands of customers looking for your services every day",
    },
    {
        icon: Calendar,
        title: "Flexible Schedule",
        description: "Accept jobs that fit your schedule. Work when you want",
    },
    {
        icon: IndianRupee,
        title: "Earn More",
        description: "Top pros earn Rs. 50,000+ monthly with competitive pricing",
    },
    {
        icon: Shield,
        title: "Secure Payments",
        description: "Get paid directly to your bank account within 24 hours",
    },
    {
        icon: Smartphone,
        title: "Easy-to-use App",
        description: "Manage bookings, track earnings, and chat with customers",
    },
    {
        icon: Users,
        title: "Training & Support",
        description: "Free training programs and 24/7 partner support",
    },
]

const testimonials = [
    {
        name: "Suresh Electricals",
        service: "Electrician",
        earnings: "Rs. 65,000/month",
        text: "Joining HomeServe Pro was the best decision. I get consistent work and my income has doubled.",
        rating: 4.9,
    },
    {
        name: "Neha Cleaning Services",
        service: "House Cleaning",
        earnings: "Rs. 45,000/month",
        text: "The platform is so easy to use. I manage my own schedule and the payments are always on time.",
        rating: 4.8,
    },
]

export default function JoinProPage() {

    const [city, setCity] = useState<{ value: string; label: string } | null>(null);
    const [serviceCategory, setServiceCategory] = useState<{ value: string; label: string } | null>(null);

    const loadCityOptions = async (inputValue: string) => {
        const { data } = await AxiosHelper.getData("/cities-list", { query: inputValue, limit: 20 });
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

    const validationSchema = Yup.object({
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
    });

    return (
        <>
            <Header />
            <main className="min-h-screen">
                {/* Hero */}
                <section className="bg-foreground py-20 text-background">
                    <div className="container mx-auto px-4">
                        <div className="grid items-center gap-12 lg:grid-cols-2">
                            <div>
                                <span className="mb-4 inline-block rounded-full bg-primary/20 px-4 py-1.5 text-sm font-medium text-primary">
                                    Partner with Us
                                </span>
                                <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl">
                                    Turn Your Skills Into a{" "}
                                    <span className="text-primary">Thriving Business</span>
                                </h1>
                                <p className="mb-8 text-lg text-background/70">
                                    Join 10,000+ professionals earning more with HomeServe Pro.
                                    Get consistent work, flexible hours, and secure payments.
                                </p>
                                <div className="flex flex-wrap gap-6">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-400" />
                                        <span>Free to join</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-400" />
                                        <span>No commission on first 5 jobs</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-400" />
                                        <span>Start earning in 48 hours</span>
                                    </div>
                                </div>
                            </div>

                            {/* Registration Form */}
                            <div className="rounded-2xl bg-background p-8 text-foreground">
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
                                        aadharDocument: null
                                    }}
                                    validationSchema={validationSchema}
                                    onSubmit={async (values, { setSubmitting, resetForm }) => {
                                        setSubmitting(true);

                                        const { data } = await AxiosHelper.postData("/service-provider/register", values, true);
                                        if (data.status) {
                                            toast.success(data.message || "Registration submitted successfully.");
                                            resetForm();
                                            setServiceCategory(null);
                                            setCity(null);
                                        } else {
                                            toast.error(data?.message || "Unable to submit registration.");
                                        }
                                        
                                        setSubmitting(false);
                                    }}
                                >
                                    {({ setFieldValue, isSubmitting }) => (
                                        <Form className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            <div>
                                                <Label>Full Name</Label>
                                                <Field as={Input} name="name" type="text" placeholder="John Doe" maxLength={100} />
                                                <ErrorMessage name="name" component="small" className="mt-1 block text-xs text-rose-600" />
                                            </div>
                                            <div>
                                                <Label>Phone Number</Label>
                                                <Field as={Input} name="mobile" type="tel" placeholder="9876543210" inputMode="numeric" maxLength={10} />
                                                <ErrorMessage name="mobile" component="small" className="mt-1 block text-xs text-rose-600" />
                                            </div>
                                            <div>
                                                <Label>Email Address</Label>
                                                <Field as={Input} name="email" type="email" placeholder="john@example.com" maxLength={100} />
                                                <ErrorMessage name="email" component="small" className="mt-1 block text-xs text-rose-600" />
                                            </div>
                                            <div>
                                                <Label>City</Label>
                                                <FrontAsyncSelect
                                                    instanceId="join-pro-city-select"
                                                    inputId="join-pro-city-select-input"
                                                    cacheOptions
                                                    defaultOptions
                                                    loadOptions={loadCityOptions}
                                                    isSearchable
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
                                                <Label>Service Category</Label>
                                                <FrontAsyncSelect
                                                    instanceId="join-pro-service-category-select"
                                                    inputId="join-pro-service-category-select-input"
                                                    cacheOptions
                                                    defaultOptions
                                                    loadOptions={loadServiceCategoryOptions}
                                                    isSearchable
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
                                                <Label>PAN Number</Label>
                                                <Field as={Input} name="panCardNumber" type="text" placeholder="ABCDE1234F" maxLength={10} />
                                                <ErrorMessage name="panCardNumber" component="small" className="mt-1 block text-xs text-rose-600" />
                                            </div>
                                            <div>
                                                <Label>Aadhar Number</Label>
                                                <Field as={Input} name="aadharNumber" type="text" placeholder="123412341234" maxLength={12} />
                                                <ErrorMessage name="aadharNumber" component="small" className="mt-1 block text-xs text-rose-600" />
                                            </div>
                                            <div>
                                                <Label>Years of Experience</Label>
                                                <Field as={Input} name="experienceYears" type="number" min={0} max={80} placeholder="3" />
                                                <ErrorMessage name="experienceYears" component="small" className="mt-1 block text-xs text-rose-600" />
                                            </div>
                                            <div className="col-span-1 sm:col-span-2">
                                                <Label>Experience Description</Label>
                                                <Field as={Textarea} name="experienceDescription" rows={4} placeholder="Briefly describe your experience" maxLength={5000} />
                                                <ErrorMessage name="experienceDescription" component="small" className="mt-1 block text-xs text-rose-600" />
                                            </div>
                                            <div>
                                                <Label>Profile Image</Label>
                                                <Input type="file" accept="image/*,application/pdf" onChange={(e) => setFieldValue("image", e.currentTarget.files?.[0] ?? null)} />
                                                <ErrorMessage name="image" component="small" className="mt-1 block text-xs text-rose-600" />
                                            </div>
                                            <div>
                                                <Label>PAN Card Document</Label>
                                                <Input type="file" accept="image/*,application/pdf" onChange={(e) => setFieldValue("panCardDocument", e.currentTarget.files?.[0] ?? null)} />
                                                <ErrorMessage name="panCardDocument" component="small" className="mt-1 block text-xs text-rose-600" />
                                            </div>
                                            <div>
                                                <Label>Aadhar Document</Label>
                                                <Input type="file" accept="image/*,application/pdf" onChange={(e) => setFieldValue("aadharDocument", e.currentTarget.files?.[0] ?? null)} />
                                                <ErrorMessage name="aadharDocument" component="small" className="mt-1 block text-xs text-rose-600" />
                                            </div>
                                            <div className="col-span-1 sm:col-span-2 pt-2">
                                                <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={isSubmitting}>
                                                    {isSubmitting ? "Please wait..." : "Apply Now"}
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </Button>
                                            </div>
                                        </Form>
                                    )}
                                </Formik>
                                <p className="mt-4 text-center text-xs text-muted-foreground">
                                    By registering, you agree to our Terms of Service and Privacy Policy
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Benefits */}
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <div className="mb-14 text-center">
                            <span className="mb-2 inline-block text-sm font-semibold uppercase tracking-wider text-primary">Why Join Us</span>
                            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                                Benefits of Being a Pro
                            </h2>
                        </div>
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {benefits.map((benefit) => (
                                <div key={benefit.title} className="flex gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                                        <benefit.icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="mb-2 font-semibold text-foreground">{benefit.title}</h3>
                                        <p className="text-sm text-muted-foreground">{benefit.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Pro Testimonials */}
                <section className="bg-secondary/50 py-20">
                    <div className="container mx-auto px-4">
                        <div className="mb-14 text-center">
                            <span className="mb-2 inline-block text-sm font-semibold uppercase tracking-wider text-primary">Success Stories</span>
                            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                                Hear From Our Top Pros
                            </h2>
                        </div>
                        <div className="grid gap-8 md:grid-cols-2">
                            {testimonials.map((t) => (
                                <div key={t.name} className="rounded-2xl border bg-card p-8">
                                    <div className="mb-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                                                {t.name[0]}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-foreground">{t.name}</h4>
                                                <p className="text-sm text-muted-foreground">{t.service}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                            <span className="font-medium text-foreground">{t.rating}</span>
                                        </div>
                                    </div>
                                    <p className="mb-4 text-muted-foreground">{t.text}</p>
                                    <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
                                        <Briefcase className="h-4 w-4" />
                                        <span>Avg. Earnings: {t.earnings}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <div className="rounded-2xl bg-linear-to-r from-primary to-orange-400 p-12 text-center text-white">
                            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Ready to Start Earning?</h2>
                            <p className="mx-auto mb-8 max-w-xl text-white/80">
                                Join thousands of professionals who are growing their business with HomeServe Pro
                            </p>
                            <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                                Register Now - It&apos;s Free
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    )
}
