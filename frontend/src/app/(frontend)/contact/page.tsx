"use client"

import ContactUs from "@/components/front/forms/ContactUs"
import { RootState } from "@/store";
import { useAppSelector } from "@/store/hooks";
import { Phone, Mail, MapPin } from "lucide-react"

export default function ContactPage() {

    const settings = useAppSelector((state: RootState) => state.settings);
    const contactMethods = [
        {
            icon: Phone,
            colSpan: 'col-span-1',
            title: "Phone Support",
            description: "Talk to our support team",
            value: settings.phone || "N/A",
            subtext: "Toll-free, 24/7 available",
        },
        {
            icon: Mail,
            colSpan: 'col-span-1',
            title: "Email Us",
            description: "Get response within 24 hours",
            value: settings.email || "N/A",
            subtext: "For general inquiries",
        },
        {
            icon: MapPin,
            colSpan: 'col-span-2',
            title: "Our Office",
            description: "Visit our office for any assistance",
            value: settings.address || "N/A",
            subtext: "You can also visit our office for any assistance.",
        },
    ]

    return (
        <div>
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
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="grid gap-6 md:grid-cols-2">
                        {contactMethods.map((method) => (
                            <div key={method.title} className={`space-y-1 flex flex-col items-center rounded-2xl border bg-card p-6 text-center transition-all hover:shadow-lg ${method.colSpan}`}>
                                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                                    <method.icon className="h-7 w-7 text-primary" />
                                </div>
                                <h3 className="font-semibold text-foreground">{method.title}</h3>
                                <p className="text-sm text-muted-foreground">{method.description}</p>
                                <p className="font-semibold text-primary">{method.value}</p>
                                <p className="text-xs text-muted-foreground">{method.subtext}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-12">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="grid gap-12">
                        <ContactUs />
                    </div>
                </div>
            </section>
        </div>
    )
}
