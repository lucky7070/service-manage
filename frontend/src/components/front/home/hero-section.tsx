"use client"

import { useState, useCallback } from "react"
import Image from "next/image"
import { Search, ShieldCheck, Clock3, Star, Users } from "lucide-react"
import { Button, FrontAsyncSelect, Label } from "@/components/front/ui"
import AxiosHelper from "@/helpers/AxiosHelper"
import { useRouter } from "next/navigation"
import { Formik, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { slugify } from "@/helpers/utils"

type CityOption = { value: string; label: string; slug: string }
type CategoryOption = { value: string; label: string; slug: string }

const stats = [
    { icon: Users, value: "50,000+", label: "Happy Customers" },
    { icon: ShieldCheck, value: "10,000+", label: "Verified Pros" },
    { icon: Star, value: "4.8/5", label: "Average Rating" },
    { icon: Clock3, value: "30 min", label: "Avg Response" },
]

const validationSchema = Yup.object().shape({
    city: Yup.string().required('City is required'),
    service: Yup.string().required('Service category is required'),
});

export function HeroSection() {
    const router = useRouter()
    const search = JSON.parse(localStorage.getItem("search") || "{}");
    const [city, setCity] = useState<CityOption | null>(search.city || null);
    const [service, setService] = useState<CategoryOption | null>(search.service || null);

    const loadCityOptions = useCallback(async (inputValue: string) => {
        const { data } = await AxiosHelper.getData("/cities-list", { limit: 20, status: 1, query: inputValue || "" });
        if (data.status && data?.data && Array.isArray(data.data)) {
            return data.data.map((city: { _id: string; label: string; slug: string }) => ({
                value: city.slug,
                label: city.label,
                slug: city.slug
            }));
        }

        return [];
    }, []);

    const loadServiceOptions = useCallback(async (inputValue: string) => {
        const { data } = await AxiosHelper.getData("/service-categories-list", { limit: 20, status: 1, query: inputValue || "" });
        if (data.status && data?.data && Array.isArray(data.data)) {
            return data.data.map((city: { _id: string; label: string; slug: string }) => ({
                value: city.slug,
                label: city.label,
                slug: city.slug
            }));
        }

        return [];
    }, []);

    return (
        <section className="relative overflow-hidden bg-linear-to-br from-orange-50 via-white to-amber-50">
            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 opacity-40" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f97316' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }} />

            <div className="container relative mx-auto px-4 py-14 lg:py-20">
                <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
                    {/* Left Content */}
                    <div className="max-w-xl">
                        {/* Badge */}
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-200/80 bg-white/90 px-4 py-1.5 shadow-sm backdrop-blur">
                            <span className="flex h-2 w-2 rounded-full bg-green-500" />
                            <span className="text-sm font-medium text-orange-800">Trusted by 50,000+ homeowners</span>
                        </div>

                        <h1 className="mb-5 text-balance text-4xl font-bold leading-tight tracking-tight text-gray-900 md:text-5xl lg:text-[56px]">
                            Hiring service experts{" "}
                            <span className="text-primary">made easy</span>
                        </h1>

                        <p className="mb-7 text-pretty text-lg text-gray-600 md:text-xl">
                            From cleaning to repairs, painting to plumbing - connect with verified
                            professionals and get quality work done at fair prices.
                        </p>

                        {/* Search Box */}
                        <div className="mb-7 rounded-2xl border border-white/60 bg-white/90 p-3 shadow-2xl shadow-orange-100/50 backdrop-blur">
                            <Formik
                                initialValues={{ city: city?.value || '', service: service?.value || '' }}
                                validationSchema={validationSchema}
                                onSubmit={values => {
                                    if (!values.city || !values.service) return;

                                    localStorage.setItem("search", JSON.stringify({ city, service }));
                                    router.push(`/service/${values.city}/${values.service}`);
                                }}
                            >
                                {({ setFieldValue }) => (
                                    <Form className="grid gap-2 sm:grid-cols-[220px_1fr_auto]">
                                        <div className="relative min-w-0">
                                            <Label htmlFor="city-search" className="text-sm font-medium text-gray-700">Your City</Label>
                                            <FrontAsyncSelect
                                                inputId="city-search"
                                                isSearchable={true}
                                                instanceId="city-search"
                                                loadOptions={loadCityOptions}
                                                cacheOptions
                                                defaultOptions
                                                value={city}
                                                onChange={(option) => {
                                                    setCity(option as CityOption);
                                                    setFieldValue("city", option?.value || "");
                                                }}
                                                placeholder="Jaipur, Nagpur, etc."
                                            />
                                            <ErrorMessage className="text-xs text-orange-600" name="city" component="small" />
                                        </div>

                                        <div className="relative flex-1">
                                            <Label htmlFor="service-search" className="text-sm font-medium text-gray-700">Service Needed</Label>
                                            <FrontAsyncSelect
                                                inputId="service-search"
                                                isSearchable={true}
                                                instanceId="service-search"
                                                loadOptions={loadServiceOptions}
                                                cacheOptions
                                                defaultOptions
                                                value={service}
                                                onChange={(option) => {
                                                    setService(option as CategoryOption);
                                                    setFieldValue("service", option?.value || "");
                                                }}
                                                placeholder="Plumber, Electrician, etc."
                                            />
                                            <ErrorMessage className="text-xs text-orange-600" name="service" component="small" />
                                        </div>
                                        <div className="col-span-full grid grid-cols-1 lg:grid-cols-2 items-start justify-between gap-2">
                                            {/* Popular searches */}
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <span className="text-sm font-semibold text-gray-500 ">Popular:</span>
                                                {["Plumber", "Electrician", "Cleaning"].map((item) => (
                                                    <button
                                                        key={item}
                                                        onClick={() => {
                                                            setService({ value: item, label: item, slug: slugify(item) } as CategoryOption)
                                                            setFieldValue("service", slugify(item))
                                                        }}
                                                        className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-600 transition-colors hover:border-primary hover:bg-orange-50 hover:text-primary"
                                                    >
                                                        {item}
                                                    </button>
                                                ))}
                                            </div>
                                            <Button size="lg" type="submit" className="bg-primary px-6 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 hover:bg-orange-600" >
                                                <Search className="h-4 w-4" />
                                                Search
                                            </Button>
                                        </div>
                                        <div className="col-span-full text-end">

                                        </div>
                                    </Form>
                                )}
                            </Formik>
                        </div>
                    </div>

                    {/* Right Side - Banner Image */}
                    <div className="relative hidden lg:block">
                        <div className="relative">
                            {/* Main Image */}
                            <div className="relative aspect-4/3 overflow-hidden rounded-3xl border border-white/70 shadow-2xl">
                                <Image
                                    src="/images/hero-home.jpg"
                                    alt="Happy family with professional home service"
                                    fill
                                    sizes="(min-width: 1024px) min(50vw, 720px), 100vw"
                                    className="object-cover"
                                    priority
                                />
                                {/* Overlay gradient */}
                                <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
                            </div>

                            {/* Floating stat card - top right */}
                            <div className="absolute -right-3 -top-3 rounded-2xl border border-gray-100 bg-white/95 p-4 shadow-xl backdrop-blur">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                                        <ShieldCheck className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">100%</p>
                                        <p className="text-sm text-gray-500">Verified Pros</p>
                                    </div>
                                </div>
                            </div>

                            {/* Floating rating card - bottom left */}
                            <div className="absolute -bottom-3 -left-3 rounded-2xl border border-gray-100 bg-white/95 p-4 shadow-xl backdrop-blur">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                                        <Star className="h-6 w-6 text-amber-500" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-2xl font-bold text-gray-900">4.8</span>
                                            <div className="flex">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-500">50K+ Reviews</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="mt-14 grid grid-cols-2 gap-4 rounded-2xl border border-white/70 bg-white/90 p-5 shadow-lg backdrop-blur md:grid-cols-4 lg:mt-16">
                    {stats.map((stat) => (
                        <div key={stat.label} className="flex items-center gap-3 rounded-xl bg-white px-3 py-3 shadow-sm">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100">
                                <stat.icon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-lg font-bold text-gray-900 md:text-xl">{stat.value}</p>
                                <p className="text-xs text-gray-500 md:text-sm">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
