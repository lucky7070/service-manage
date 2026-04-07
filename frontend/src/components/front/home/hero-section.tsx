"use client"

import { useState } from "react"
import Image from "next/image"
import { Search, MapPin, Shield, Clock, Star, Users } from "lucide-react"
import { Select } from "@/components/front/ui/select"
import { Input } from "../ui/input"
import { Button } from "../ui/button"

const cities = [
    { value: "bangalore", label: "Bangalore" },
    { value: "mumbai", label: "Mumbai" },
    { value: "delhi", label: "Delhi NCR" },
    { value: "chennai", label: "Chennai" },
    { value: "hyderabad", label: "Hyderabad" },
    { value: "pune", label: "Pune" },
    { value: "kolkata", label: "Kolkata" },
    { value: "ahmedabad", label: "Ahmedabad" },
]

const stats = [
    { icon: Users, value: "50,000+", label: "Happy Customers" },
    { icon: Shield, value: "10,000+", label: "Verified Pros" },
    { icon: Star, value: "4.8/5", label: "Average Rating" },
    { icon: Clock, value: "30 min", label: "Avg Response" },
]

export function HeroSection() {
    const [city, setCity] = useState("bangalore")
    const [service, setService] = useState("")

    return (
        <section className="relative overflow-hidden bg-linear-to-br from-orange-50 via-white to-amber-50">
            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 opacity-40" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f97316' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }} />

            <div className="container relative mx-auto px-4 py-12 lg:py-20">
                <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                    {/* Left Content */}
                    <div className="max-w-xl">
                        {/* Badge */}
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-100 px-4 py-1.5">
                            <span className="flex h-2 w-2 rounded-full bg-green-500" />
                            <span className="text-sm font-medium text-orange-800">Trusted by 50,000+ homeowners</span>
                        </div>

                        <h1 className="mb-6 text-balance text-4xl font-bold leading-tight tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
                            Hiring service experts{" "}
                            <span className="text-primary">made easy</span>
                        </h1>

                        <p className="mb-8 text-pretty text-lg text-gray-600 md:text-xl">
                            From cleaning to repairs, painting to plumbing - connect with verified
                            professionals and get quality work done at fair prices.
                        </p>

                        {/* Search Box */}
                        <div className="mb-8 overflow-hidden rounded-2xl border border-gray-200 bg-white p-2 shadow-xl shadow-gray-200/50">
                            <div className="flex flex-col gap-2 sm:flex-row">
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Select
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        className="h-12 w-full border-0 bg-gray-50 pl-10 text-sm font-medium sm:w-40"
                                        aria-label="Select City"
                                    >
                                        {cities.map((c) => (
                                            <option key={c.value} value={c.value}>
                                                {c.label}
                                            </option>
                                        ))}
                                    </Select>
                                </div>

                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        type="text"
                                        placeholder="What service do you need?"
                                        value={service}
                                        onChange={(e) => setService(e.target.value)}
                                        className="h-12 border-0 bg-gray-50 pl-10 text-sm"
                                    />
                                </div>

                                <Button
                                    size="lg"
                                    className="h-12 bg-primary px-8 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 hover:bg-orange-600"
                                >
                                    <Search className="mr-2 h-4 w-4" />
                                    Search
                                </Button>
                            </div>
                        </div>

                        {/* Popular searches */}
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm text-gray-500">Popular:</span>
                            {["AC Repair", "Deep Cleaning", "Plumber", "Electrician"].map((item) => (
                                <button
                                    key={item}
                                    className="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm text-gray-600 transition-colors hover:border-primary hover:bg-orange-50 hover:text-primary"
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right Side - Banner Image */}
                    <div className="relative hidden lg:block">
                        <div className="relative">
                            {/* Main Image */}
                            <div className="relative aspect-4/3 overflow-hidden rounded-3xl shadow-2xl">
                                <Image
                                    src="/images/hero-home.jpg"
                                    alt="Happy family with professional home service"
                                    fill
                                    className="object-cover"
                                    priority
                                />
                                {/* Overlay gradient */}
                                <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
                            </div>

                            {/* Floating stat card - top right */}
                            <div className="absolute -right-4 -top-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-xl">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                                        <Shield className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">100%</p>
                                        <p className="text-sm text-gray-500">Verified Pros</p>
                                    </div>
                                </div>
                            </div>

                            {/* Floating rating card - bottom left */}
                            <div className="absolute -bottom-4 -left-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-xl">
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
                <div className="mt-16 grid grid-cols-2 gap-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-lg md:grid-cols-4 lg:mt-20">
                    {stats.map((stat) => (
                        <div key={stat.label} className="flex items-center gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-100">
                                <stat.icon className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-xl font-bold text-gray-900 md:text-2xl">{stat.value}</p>
                                <p className="text-sm text-gray-500">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
