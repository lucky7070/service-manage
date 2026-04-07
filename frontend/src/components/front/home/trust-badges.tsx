import { Shield, Award, Clock, Headphones } from "lucide-react"

const badges = [
    {
        icon: Shield,
        title: "Verified Professionals",
        description: "Background-checked and trained experts",
    },
    {
        icon: Award,
        title: "Quality Guarantee",
        description: "100% satisfaction or your money back",
    },
    {
        icon: Clock,
        title: "On-Time Service",
        description: "Punctual professionals, every time",
    },
    {
        icon: Headphones,
        title: "24/7 Support",
        description: "Always here when you need us",
    },
]

export function TrustBadges() {
    return (
        <section className="border-y border-gray-100 bg-white py-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
                    {badges.map((badge) => (
                        <div key={badge.title} className="flex flex-col items-center text-center md:flex-row md:text-left">
                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 md:mb-0 md:mr-4">
                                <badge.icon className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">{badge.title}</h3>
                                <p className="text-sm text-gray-500">{badge.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
