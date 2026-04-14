
import { JOIN_PRO_BENEFITS } from "@/config/constants";
import { CheckCircle, ArrowRight, Quote, Star } from "lucide-react"
import ProRegistrationForm from "@/components/front/forms/ProRegistrationForm";
import { Button } from "@/components/front/ui";
import { getTestimonials } from "@/lib/api.server";
import Image from "@/components/ui/Image";
import { resolveFileUrl } from "@/helpers/utils";

export default async function JoinProPage() {
    const testimonials = await getTestimonials("provider")
    return (
        <>
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
                        <ProRegistrationForm />
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
                        {JOIN_PRO_BENEFITS.map((benefit) => (
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
                        {testimonials.map((t) => {
                            const ratingOutOf5 = Math.min(5, Math.max(0, Math.round(Number(t.rating) || 0)));
                            return <div key={t._id} className="rounded-2xl border bg-card p-8">
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Image src={resolveFileUrl(t.image) || ""} alt={t.name} className="h-12 w-12 rounded-full" />
                                        <div>
                                            <h4 className="font-semibold text-foreground">{t.name}</h4>
                                            <p className="text-sm text-muted-foreground">{t.designation}</p>
                                        </div>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-0.5" role="img" aria-label={`${ratingOutOf5} out of 5 stars`}>
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star key={i} className={`h-4 w-4 ${i < ratingOutOf5 ? "fill-amber-400 text-amber-400" : "fill-transparent text-muted-foreground/35"}`} />
                                        ))}
                                    </div>
                                </div>
                                <p className="mb-4 text-muted-foreground">{t.review}</p>
                            </div>
                        })}

                        {testimonials.length === 0 && <div
                            className="col-span-1 md:col-span-2 mx-auto rounded-2xl border border-dashed border-muted-foreground/25 bg-card px-8 py-14 text-center"
                            role="status"
                            aria-live="polite"
                        >
                            <Quote className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" aria-hidden />
                            <p className="text-lg font-semibold text-foreground">No testimonials yet</p>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Success stories from our pros will appear here soon. Register above and you could be featured next.
                            </p>
                        </div>}
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
        </>
    )
}
