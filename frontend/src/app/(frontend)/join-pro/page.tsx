"use client"

import { useState, type ChangeEvent } from "react"
import { Header } from "@/components/front/header"
import { Footer } from "@/components/front/footer"
import { Input } from "@/components/front/ui/input"
import { Button } from "@/components/front/ui/button"
import { Select } from "../../../components/front/ui/select"
import { Briefcase, TrendingUp, Calendar, Shield, Users, Smartphone, CheckCircle, ArrowRight, Star, IndianRupee } from "lucide-react"

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

const services = [
    "Electrician",
    "Plumber",
    "House Cleaning",
    "AC Repair",
    "Painter",
    "Carpenter",
    "Pest Control",
    "Appliance Repair",
]

export default function JoinProPage() {
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        city: "",
        service: "",
        experience: "",
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Handle form submission
    }

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
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <Input
                                            placeholder="Full Name"
                                            value={formData.name}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            placeholder="Phone Number"
                                            value={formData.phone}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, phone: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            type="email"
                                            placeholder="Email Address"
                                            value={formData.email}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            placeholder="City"
                                            value={formData.city}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, city: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Select
                                            value={formData.service}
                                            onChange={(e: ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, service: e.target.value })}
                                            placeholder="Select Service Category"
                                        >
                                            {services.map((s) => (
                                                <option key={s} value={s.toLowerCase()}>{s}</option>
                                            ))}
                                        </Select>
                                    </div>
                                    <div>
                                        <Select
                                            value={formData.experience}
                                            onChange={(e: ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, experience: e.target.value })}
                                            placeholder="Years of Experience"
                                        >
                                            <option value="0-1">0-1 years</option>
                                            <option value="1-3">1-3 years</option>
                                            <option value="3-5">3-5 years</option>
                                            <option value="5+">5+ years</option>
                                        </Select>
                                    </div>
                                    <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                                        Apply Now
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </form>
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
