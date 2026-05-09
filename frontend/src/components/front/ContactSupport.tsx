"use client"

import { Button } from "@/components/ui/Button"
import { MessageCircle, Phone, Mail } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import Setting from "./setting";

const ContactSupport = () => {
    const settings = useAppSelector(store => store.settings)
    return <section className="py-16">
        <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl rounded-2xl border bg-card p-8 text-center">
                <MessageCircle className="mx-auto mb-4 h-12 w-12 text-primary" />
                <h2 className="mb-2 text-2xl font-bold text-foreground">Still need help?</h2>
                <p className="mb-6 text-muted-foreground">
                    Our support team is available 24/7 to assist you
                </p>
                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => window.open(`tel:${settings.phone}`, '_blank')}>
                        <Phone className="mr-2 h-4 w-4" />
                        Call <Setting name="phone" />
                    </Button>
                    <Button variant="outline" onClick={() => window.open(`mailto:${settings.email}`, '_blank')}>
                        <Mail className="mr-2 h-4 w-4" />
                        Email Support
                    </Button>
                </div>
            </div>
        </div>
    </section>
}

export default ContactSupport