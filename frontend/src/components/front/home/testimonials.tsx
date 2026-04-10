import Image from "@/components/ui/Image"
import { resolveFileUrl } from "@/helpers/utils"
import { getTestimonials } from "@/lib/settings.server"
import { Star, Quote } from "lucide-react"

export async function Testimonials() {
    const testimonials = await getTestimonials("customer")
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
                            key={testimonial._id}
                            className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-lg"
                        >
                            {/* Quote icon */}
                            <Quote className="mb-6 h-10 w-10 text-orange-200" />

                            {/* Review text */}
                            <p className="mb-8 text-gray-700 leading-relaxed">
                                &quot;{testimonial.review}&quot;
                            </p>

                            {/* Author info */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {/* <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-primary to-orange-400 text-sm font-semibold text-white">
                                        {testimonial.name.split(" ").map((chunk) => chunk[0]).join("").slice(0, 2).toUpperCase()}
                                    </div> */}
                                    <Image src={resolveFileUrl(testimonial.image) || ""} alt={testimonial.name} className="h-12 w-12 rounded-full" />
                                    <div>
                                        <p className="font-semibold text-gray-900">{testimonial.name}</p>
                                        <p className="text-sm text-gray-500">{testimonial.designation}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex gap-0.5">
                                        {Array.from({ length: Math.max(1, Math.min(5, Math.round(Number(testimonial.rating) || 0))) }).map((_, i) => (
                                            <Star
                                                key={i}
                                                className="h-4 w-4 fill-amber-400 text-amber-400"
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
