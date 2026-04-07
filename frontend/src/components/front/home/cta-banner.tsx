import Link from "next/link"
import { ArrowRight, CheckCircle } from "lucide-react"
import { Button } from "../ui/button"

const benefits = [
    "10,000+ Verified Professionals",
    "100% Satisfaction Guarantee",
    "Best Price Assurance",
    "24/7 Customer Support",
]

export function CTABanner() {
    return (
        <section className="bg-linear-to-r from-primary via-orange-500 to-amber-500 py-16 md:py-20">
            <div className="container mx-auto px-4">
                <div className="flex flex-col items-center gap-8 text-center lg:flex-row lg:justify-between lg:text-left">
                    <div className="max-w-xl">
                        <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
                            Ready to get started?
                        </h2>
                        <p className="mb-6 text-lg text-white/90">
                            Join thousands of homeowners who trust HomeServe Pro for their home service needs
                        </p>
                        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 lg:justify-start">
                            {benefits.map((benefit) => (
                                <div key={benefit} className="flex items-center gap-2 text-sm text-white/90">
                                    <CheckCircle className="h-4 w-4" />
                                    <span>{benefit}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Link href="/login">
                            <Button size="lg" className="bg-white px-8 text-primary shadow-lg hover:bg-gray-100">
                                Get Started
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href="/join-pro">
                            <Button size="lg" variant="outline" className="border-2 border-white bg-transparent px-8 text-white hover:bg-white/10">
                                Join as Pro
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}
