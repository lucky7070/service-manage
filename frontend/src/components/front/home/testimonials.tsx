import { Star, Quote } from "lucide-react"

const testimonials = [
    {
        name: "Sneha Patel",
        location: "Mumbai",
        rating: 5,
        text: "Booked a deep cleaning service and was amazed by the professionalism. The team was punctual, thorough, and left my home sparkling clean!",
        service: "House Cleaning",
        initials: "SP",
    },
    {
        name: "Vikram Singh",
        location: "Bangalore",
        rating: 5,
        text: "Had an electrical emergency and HomeServe Pro connected me with a certified electrician within an hour. Excellent service and fair pricing.",
        service: "Electrical",
        initials: "VS",
    },
    {
        name: "Meera Nair",
        location: "Chennai",
        rating: 5,
        text: "The painting team did a fantastic job with our home renovation. They were neat, efficient, and the finish quality exceeded our expectations.",
        service: "Painting",
        initials: "MN",
    },
]

export function Testimonials() {
    return (
        <section className="bg-white py-16 md:py-24">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="mb-12 text-center">
                    <span className="mb-3 inline-block rounded-full bg-orange-100 px-4 py-1.5 text-sm font-semibold text-primary">
                        Testimonials
                    </span>
                    <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
                        What Our Customers Say
                    </h2>
                    <p className="mx-auto max-w-xl text-gray-600">
                        Trusted by over 50,000+ happy customers across India
                    </p>
                </div>

                {/* Testimonials Grid */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {testimonials.map((testimonial) => (
                        <div
                            key={testimonial.name}
                            className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-lg"
                        >
                            {/* Quote icon */}
                            <Quote className="mb-6 h-10 w-10 text-orange-200" />

                            {/* Review text */}
                            <p className="mb-8 text-gray-700 leading-relaxed">
                                &quot;{testimonial.text}&quot;
                            </p>

                            {/* Author info */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-primary to-orange-400 text-sm font-semibold text-white">
                                        {testimonial.initials}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{testimonial.name}</p>
                                        <p className="text-sm text-gray-500">{testimonial.location}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex gap-0.5">
                                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                                            <Star
                                                key={i}
                                                className="h-4 w-4 fill-amber-400 text-amber-400"
                                            />
                                        ))}
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">
                                        {testimonial.service}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
