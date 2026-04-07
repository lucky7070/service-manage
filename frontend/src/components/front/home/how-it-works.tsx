import { Search, UserCheck, Calendar, ThumbsUp } from "lucide-react"

const steps = [
    {
        icon: Search,
        title: "Search Service",
        description: "Browse our wide range of home services and find exactly what you need",
        step: 1,
        color: "bg-blue-500",
    },
    {
        icon: UserCheck,
        title: "Choose a Pro",
        description: "Compare verified professionals, read reviews and select the best fit",
        step: 2,
        color: "bg-emerald-500",
    },
    {
        icon: Calendar,
        title: "Book Appointment",
        description: "Schedule at your convenience with flexible timing options",
        step: 3,
        color: "bg-primary",
    },
    {
        icon: ThumbsUp,
        title: "Relax & Rate",
        description: "Our experts complete the job, then share your experience",
        step: 4,
        color: "bg-rose-500",
    },
]

export function HowItWorks() {
    return (
        <section className="bg-gray-50 py-16 md:py-24">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="mb-14 text-center">
                    <span className="mb-3 inline-block rounded-full bg-orange-100 px-4 py-1.5 text-sm font-semibold text-primary">
                        Simple Process
                    </span>
                    <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
                        How It Works
                    </h2>
                    <p className="mx-auto max-w-xl text-gray-600">
                        Get quality home services in just 4 simple steps
                    </p>
                </div>

                {/* Steps */}
                <div className="relative">
                    {/* Connection Line - Desktop */}
                    <div className="absolute left-[calc(12.5%+28px)] right-[calc(12.5%+28px)] top-14 hidden h-1 rounded-full bg-linear-to-r from-blue-200 via-emerald-200 via-orange-200 to-rose-200 md:block" />

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-4 md:gap-6">
                        {steps.map((step, index) => (
                            <div key={step.title} className="relative text-center">
                                {/* Step circle */}
                                <div className="relative mx-auto mb-6">
                                    <div className={`relative mx-auto flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-white shadow-lg`}>
                                        <div className={`flex h-16 w-16 items-center justify-center rounded-full ${step.color}`}>
                                            <step.icon className="h-8 w-8 text-white" />
                                        </div>
                                    </div>
                                    {/* Step number badge */}
                                    <span className="absolute -right-1 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white shadow-lg">
                                        {step.step}
                                    </span>
                                </div>

                                <h3 className="mb-2 text-lg font-semibold text-gray-900">{step.title}</h3>
                                <p className="mx-auto max-w-[200px] text-sm text-gray-500 leading-relaxed">{step.description}</p>

                                {/* Arrow for mobile */}
                                {index < steps.length - 1 && (
                                    <div className="mt-6 flex justify-center md:hidden">
                                        <div className="h-8 w-0.5 bg-gray-200" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
