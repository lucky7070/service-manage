import { Star, Shield, Clock, BadgeCheck } from "lucide-react"
import { Button } from "@/components/front/ui"

const professionals = [
    {
        name: "Rajesh Kumar",
        specialty: "Electrician",
        rating: 4.9,
        reviews: 234,
        experience: "8 years",
        initials: "RK",
        jobs: "1.2K+",
        color: "bg-amber-500",
    },
    {
        name: "Priya Sharma",
        specialty: "House Cleaning",
        rating: 4.8,
        reviews: 189,
        experience: "5 years",
        initials: "PS",
        jobs: "890+",
        color: "bg-blue-500",
    },
    {
        name: "Mohammed Ali",
        specialty: "Plumber",
        rating: 4.9,
        reviews: 312,
        experience: "10 years",
        initials: "MA",
        jobs: "2.1K+",
        color: "bg-cyan-500",
    },
    {
        name: "Anita Desai",
        specialty: "Painter",
        rating: 4.7,
        reviews: 156,
        experience: "6 years",
        initials: "AD",
        jobs: "650+",
        color: "bg-rose-500",
    },
]

export function FeaturedPros() {
    return (
        <section className="bg-gray-50 py-16 md:py-24">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="mb-12 text-center">
                    <span className="mb-3 inline-block rounded-full bg-orange-100 px-4 py-1.5 text-sm font-semibold text-primary">
                        Top Professionals
                    </span>
                    <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
                        Meet Our Best Rated Pros
                    </h2>
                    <p className="mx-auto max-w-xl text-gray-600">
                        Verified professionals ready to help with your home needs
                    </p>
                </div>

                {/* Professionals Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {professionals.map((pro) => (
                        <div
                            key={pro.name}
                            className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                        >
                            {/* Header with color */}
                            <div className={`relative h-16 ${pro.color}`}>
                                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
                                    <div className="relative">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-gray-900 text-lg font-bold text-white">
                                            {pro.initials}
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
                                            <BadgeCheck className="h-4 w-4 text-white" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="px-5 pb-5 pt-12 text-center">
                                <h3 className="mb-1 font-semibold text-gray-900">{pro.name}</h3>
                                <p className="mb-4 text-sm text-gray-500">{pro.specialty}</p>

                                <div className="mb-4 flex items-center justify-center gap-1">
                                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                    <span className="font-semibold text-gray-900">{pro.rating}</span>
                                    <span className="text-sm text-gray-500">({pro.reviews})</span>
                                </div>

                                <div className="mb-5 flex justify-center gap-4 text-sm">
                                    <div className="flex items-center gap-1 text-gray-500">
                                        <Clock className="h-4 w-4" />
                                        <span>{pro.experience}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-gray-500">
                                        <Shield className="h-4 w-4" />
                                        <span>{pro.jobs}</span>
                                    </div>
                                </div>

                                <Button className="w-full bg-primary text-white hover:bg-orange-600">
                                    Book Now
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
