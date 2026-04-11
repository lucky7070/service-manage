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
                    {testimonials.map((testimonial) => {
                        const ratingOutOf5 = Math.min(5, Math.max(0, Math.round(Number(testimonial.rating) || 0)));
                        return (
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
                                        <div className="flex justify-end gap-0.5" role="img" aria-label={`${ratingOutOf5} out of 5 stars`}>
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star key={i} className={`h-4 w-4 ${i < ratingOutOf5 ? "fill-amber-400 text-amber-400" : "fill-transparent text-gray-300"}`} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {testimonials.length === 0 && <div
                        className="col-span-1 md:col-span-3 mx-auto rounded-2xl border border-gray-100 bg-gray-50 px-8 py-14 text-center"
                        role="status"
                        aria-live="polite"
                    >
                        <Quote className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" aria-hidden />
                        <p className="text-lg font-semibold text-foreground">No testimonials yet</p>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Success stories from our customers will appear here soon. Register here and you could be featured next.
                        </p>
                    </div>}
                </div>
            </div>
        </section>
    )
}
