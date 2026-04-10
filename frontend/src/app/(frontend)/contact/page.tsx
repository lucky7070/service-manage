import ContactUs from "@/components/front/forms/ContactUs"
import { Phone, Mail, MapPin, Clock, MessageSquare, Headphones } from "lucide-react"

const contactMethods = [
    {
        icon: Phone,
        title: "Phone Support",
        description: "Talk to our support team",
        value: "1800-123-4567",
        subtext: "Toll-free, 24/7 available",
    },
    {
        icon: Mail,
        title: "Email Us",
        description: "Get response within 24 hours",
        value: "help@homeservepro.com",
        subtext: "For general inquiries",
    },
    {
        icon: MessageSquare,
        title: "Live Chat",
        description: "Instant help when you need it",
        value: "Start Chat",
        subtext: "Available 9 AM - 9 PM",
    },
]

export default function ContactPage() {
    return (
        <>
            <section className="bg-linear-to-b from-secondary/80 to-background py-16 md:py-20">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-2xl text-center">
                        <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-wider text-primary">Contact Us</span>
                        <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                            We&apos;d Love to Hear From You
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Have questions or feedback? Our team is here to help you 24/7.
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-12">
                <div className="container mx-auto px-4">
                    <div className="grid gap-6 md:grid-cols-3">
                        {contactMethods.map((method) => (
                            <div
                                key={method.title}
                                className="flex flex-col items-center rounded-2xl border bg-card p-6 text-center transition-all hover:shadow-lg"
                            >
                                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                                    <method.icon className="h-7 w-7 text-primary" />
                                </div>
                                <h3 className="mb-1 font-semibold text-foreground">{method.title}</h3>
                                <p className="mb-3 text-sm text-muted-foreground">{method.description}</p>
                                <p className="font-semibold text-primary">{method.value}</p>
                                <p className="text-xs text-muted-foreground">{method.subtext}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Form & Office Info */}
            <section className="py-12">
                <div className="container mx-auto px-4">
                    <div className="grid gap-12 lg:grid-cols-2">
                        {/* Form */}
                        <ContactUs />

                        {/* Office Info */}
                        <div>
                            <h2 className="mb-6 text-2xl font-bold text-foreground">Our Offices</h2>
                            <div className="space-y-6">
                                <div className="rounded-xl border bg-card p-5">
                                    <h3 className="mb-3 font-semibold text-foreground">Bangalore (HQ)</h3>
                                    <div className="space-y-2 text-sm text-muted-foreground">
                                        <div className="flex items-start gap-3">
                                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                            <span>123 Service Lane, Tech Park, Koramangala, Bangalore 560034</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Phone className="h-4 w-4 text-primary" />
                                            <span>+91 80 1234 5678</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 rounded-xl border bg-primary/5 p-5">
                                <div className="flex items-center gap-3">
                                    <Headphones className="h-8 w-8 text-primary" />
                                    <div>
                                        <h4 className="font-semibold text-foreground">24/7 Customer Support</h4>
                                        <p className="text-sm text-muted-foreground">We&apos;re always here to help</p>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    <span>Average response time: under 2 hours</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
