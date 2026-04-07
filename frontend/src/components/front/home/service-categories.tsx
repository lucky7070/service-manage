import Link from "next/link"
import { Sparkles, Wrench, Tv, Paintbrush, Zap, Droplets, Home, Truck, ArrowRight, } from "lucide-react"

const services = [
    {
        title: "Cleaning & Pest Control",
        description: "Deep cleaning, sanitization & pest removal",
        icon: Sparkles,
        color: "bg-blue-500",
        lightBg: "bg-blue-50",
        slug: "cleaning",
    },
    {
        title: "Handyman Services",
        description: "Furniture assembly, repairs & installations",
        icon: Wrench,
        color: "bg-amber-500",
        lightBg: "bg-amber-50",
        slug: "handyman",
    },
    {
        title: "Appliance Repair",
        description: "AC, refrigerator, washing machine & more",
        icon: Tv,
        color: "bg-emerald-500",
        lightBg: "bg-emerald-50",
        slug: "appliance-repair",
    },
    {
        title: "Painting",
        description: "Interior, exterior & texture painting",
        icon: Paintbrush,
        color: "bg-rose-500",
        lightBg: "bg-rose-50",
        slug: "painting",
    },
    {
        title: "Electrical",
        description: "Wiring, fixtures & electrical repairs",
        icon: Zap,
        color: "bg-yellow-500",
        lightBg: "bg-yellow-50",
        slug: "electrical",
    },
    {
        title: "Plumbing",
        description: "Leak repairs, installations & maintenance",
        icon: Droplets,
        color: "bg-cyan-500",
        lightBg: "bg-cyan-50",
        slug: "plumbing",
    },
    {
        title: "Home Renovation",
        description: "Kitchen, bathroom & full home makeovers",
        icon: Home,
        color: "bg-orange-500",
        lightBg: "bg-orange-50",
        slug: "renovation",
    },
    {
        title: "Packers & Movers",
        description: "Relocation, packing & transportation",
        icon: Truck,
        color: "bg-indigo-500",
        lightBg: "bg-indigo-50",
        slug: "packers-movers",
    },
]

export function ServiceCategories() {
    return (
        <section className="bg-white py-16 md:py-24">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="mb-12 text-center">
                    <span className="mb-3 inline-block rounded-full bg-orange-100 px-4 py-1.5 text-sm font-semibold text-primary">
                        Our Services
                    </span>
                    <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
                        What do you need help with?
                    </h2>
                    <p className="mx-auto max-w-2xl text-gray-600">
                        Choose from our wide range of professional home services delivered by verified experts
                    </p>
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
                    {services.map((service) => (
                        <Link
                            key={service.title}
                            href={`/services/${service.slug}`}
                            className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg md:p-6"
                        >
                            {/* Icon */}
                            <div className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl ${service.color} shadow-lg`}>
                                <service.icon className="h-7 w-7 text-white" />
                            </div>

                            {/* Content */}
                            <h3 className="mb-2 font-semibold text-gray-900 transition-colors group-hover:text-primary">
                                {service.title}
                            </h3>
                            <p className="mb-4 text-sm text-gray-500 leading-relaxed">
                                {service.description}
                            </p>

                            {/* Link */}
                            <div className="flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                                <span>Book Now</span>
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </div>

                            {/* Hover background */}
                            <div className={`absolute inset-0 ${service.lightBg} opacity-0 transition-opacity group-hover:opacity-50`} style={{ zIndex: -1 }} />
                        </Link>
                    ))}
                </div>

                {/* View All Link */}
                <div className="mt-10 text-center">
                    <Link
                        href="/services/cleaning"
                        className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-3 font-medium text-gray-700 shadow-sm transition-all hover:border-primary hover:bg-orange-50 hover:text-primary"
                    >
                        View All Services
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </section>
    )
}
