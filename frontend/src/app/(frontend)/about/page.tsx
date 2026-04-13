import { Users, Target, Award, Heart, CheckCircle, Building } from "lucide-react"

const stats = [
    { value: "500K+", label: "Happy Customers" },
    { value: "10,000+", label: "Verified Pros" },
    { value: "50+", label: "Cities Covered" },
    { value: "4.8", label: "Average Rating" },
]

const values = [
    {
        icon: Users,
        title: "Customer First",
        description: "Every decision we make starts with how it benefits our customers. Your satisfaction is our success.",
    },
    {
        icon: Target,
        title: "Quality Service",
        description: "We rigorously vet every professional to ensure you receive only the best quality work.",
    },
    {
        icon: Award,
        title: "Trust & Transparency",
        description: "Upfront pricing, verified reviews, and background-checked professionals you can trust.",
    },
    {
        icon: Heart,
        title: "Community Impact",
        description: "We empower local professionals and create meaningful employment opportunities.",
    },
]

const milestones = [
    { year: "2018", event: "Founded in Bangalore with a vision to transform home services" },
    { year: "2019", event: "Expanded to 5 major cities, crossed 10,000 service bookings" },
    { year: "2020", event: "Launched verified pro program with background checks" },
    { year: "2021", event: "Raised Series A funding, expanded to 25 cities" },
    { year: "2022", event: "Crossed 100,000 happy customers milestone" },
    { year: "2023", event: "Launched same-day service guarantee in top metros" },
    { year: "2024", event: "Expanded to 50+ cities, 500K+ customers served" },
]

export default function AboutPage() {
    return (
        <>
            <section className="bg-linear-to-b from-secondary/80 to-background py-20 md:py-28">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-3xl text-center">
                        <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-wider text-primary">About Us</span>
                        <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                            Making Home Services <span className="text-primary">Simple & Reliable</span>
                        </h1>
                        <p className="text-lg text-muted-foreground md:text-xl">
                            We&apos;re on a mission to transform how India experiences home services -
                            connecting homeowners with trusted professionals for every need.
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="border-b py-12">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                        {stats.map((stat) => (
                            <div key={stat.label} className="text-center">
                                <p className="mb-1 text-3xl font-bold text-primary md:text-4xl">{stat.value}</p>
                                <p className="text-sm text-muted-foreground md:text-base">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Our Story */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-3xl">
                        <div className="mb-8 flex items-center gap-3">
                            <Building className="h-8 w-8 text-primary" />
                            <h2 className="text-3xl font-bold text-foreground">Our Story</h2>
                        </div>
                        <div className="space-y-4 text-muted-foreground">
                            <p>
                                HomeServe Pro was founded in 2018 with a simple observation: finding reliable
                                home service professionals was frustrating and time-consuming for most Indian households.
                            </p>
                            <p>
                                Our founders experienced firsthand the challenges of finding trustworthy electricians,
                                plumbers, and cleaners. They realized that while there were skilled professionals
                                in every neighborhood, there was no easy way to discover, vet, and book them.
                            </p>
                            <p>
                                Today, HomeServe Pro connects hundreds of thousands of homeowners with verified
                                professionals across 50+ cities. Our platform ensures quality through rigorous
                                vetting, transparent pricing, and a satisfaction guarantee on every service.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Values */}
            <section className="bg-secondary/50 py-20">
                <div className="container mx-auto px-4">
                    <div className="mb-14 text-center">
                        <span className="mb-2 inline-block text-sm font-semibold uppercase tracking-wider text-primary">What We Stand For</span>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Our Values</h2>
                    </div>
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                        {values.map((value) => (
                            <div key={value.title} className="rounded-2xl border bg-card p-6">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                    <value.icon className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="mb-2 font-semibold text-foreground">{value.title}</h3>
                                <p className="text-sm text-muted-foreground">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Timeline */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="mb-14 text-center">
                        <span className="mb-2 inline-block text-sm font-semibold uppercase tracking-wider text-primary">Our Journey</span>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Milestones</h2>
                    </div>
                    <div className="mx-auto max-w-2xl">
                        <div className="space-y-6">
                            {milestones.map((milestone, index) => (
                                <div key={milestone.year} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">
                                            <CheckCircle className="h-5 w-5" />
                                        </div>
                                        {index < milestones.length - 1 && (
                                            <div className="h-full w-0.5 bg-border" />
                                        )}
                                    </div>
                                    <div className="pb-6">
                                        <span className="text-sm font-semibold text-primary">{milestone.year}</span>
                                        <p className="text-foreground">{milestone.event}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
