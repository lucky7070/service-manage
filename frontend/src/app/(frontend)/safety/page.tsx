import { Shield, Lock, AlertTriangle, CheckCircle, Phone } from "lucide-react"
import { Button } from "@/components/ui/Button"
import Setting from "@/components/front/setting"
import { VERIFICATION_STEPS, SAFETY_FEATURES } from "@/config/constants"

export default function SafetyPage() {
    return (
        <>
            {/* Hero */}
            <section className="bg-linear-to-b from-secondary/80 to-background py-20">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-3xl text-center">
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                            <Shield className="h-8 w-8 text-primary" />
                        </div>
                        <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                            Your Safety is Our <span className="text-primary">Top Priority</span>
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            We go above and beyond to ensure every service experience is safe, secure, and trustworthy.
                            Here&apos;s how we protect you and your home.
                        </p>
                    </div>
                </div>
            </section>

            {/* Verification Process */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="mb-14 text-center">
                        <span className="mb-2 inline-block text-sm font-semibold uppercase tracking-wider text-primary">Verification Process</span>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                            How We Verify Professionals
                        </h2>
                    </div>
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                        {VERIFICATION_STEPS.map((step, index) => (
                            <div key={step.title} className="relative">
                                {/* Horizontal connector: center of icon → into next column (lg: 4-col + gap-8 only) */}
                                {index < VERIFICATION_STEPS.length - 1 && (
                                    <div
                                        className="pointer-events-none absolute left-1/2 top-13 z-0 hidden h-px bg-border lg:block"
                                        style={{ width: "calc(100% + 2rem)" }}
                                        aria-hidden
                                    />
                                )}
                                <div className="relative z-10 rounded-2xl border bg-card p-6 text-center h-full">
                                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                                        <step.icon className="h-7 w-7 text-primary" />
                                    </div>
                                    <h3 className="mb-2 font-semibold text-foreground">{step.title}</h3>
                                    <p className="text-sm text-muted-foreground">{step.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Safety Features */}
            <section className="bg-secondary/50 py-20">
                <div className="container mx-auto px-4">
                    <div className="grid items-center gap-12 lg:grid-cols-2">
                        <div>
                            <span className="mb-2 inline-block text-sm font-semibold uppercase tracking-wider text-primary">Safety Features</span>
                            <h2 className="mb-6 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                                Built-in Safety at Every Step
                            </h2>
                            <p className="mb-8 text-muted-foreground">
                                Our platform includes multiple safety features designed to give you peace of mind
                                before, during, and after every service visit.
                            </p>
                            <ul className="space-y-4">
                                {SAFETY_FEATURES.map((feature) => (
                                    <li key={feature} className="flex items-center gap-3">
                                        <CheckCircle className="h-5 w-5 shrink-0 text-green-500" />
                                        <span className="text-foreground">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="rounded-2xl border bg-card p-8">
                            <div className="mb-6 flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                                    <AlertTriangle className="h-6 w-6 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground">Emergency Support</h3>
                                    <p className="text-sm text-muted-foreground">Available 24/7</p>
                                </div>
                            </div>
                            <p className="mb-6 text-muted-foreground">
                                If you ever feel unsafe during a service, use our in-app SOS button or call our
                                emergency hotline. Our safety team will respond immediately.
                            </p>
                            <Button className="w-full bg-red-600 text-white hover:bg-red-700">
                                <Phone className="mr-2 h-4 w-4" />
                                Emergency: <Setting name="phone" />
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust Stats */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
                        <div>
                            <p className="mb-1 text-3xl font-bold text-primary md:text-4xl">100%</p>
                            <p className="text-sm text-muted-foreground">Background Verified</p>
                        </div>
                        <div>
                            <p className="mb-1 text-3xl font-bold text-primary md:text-4xl">10,000+</p>
                            <p className="text-sm text-muted-foreground">Vetted Professionals</p>
                        </div>
                        <div>
                            <p className="mb-1 text-3xl font-bold text-primary md:text-4xl">500K+</p>
                            <p className="text-sm text-muted-foreground">Safe Service Visits</p>
                        </div>
                        <div>
                            <p className="mb-1 text-3xl font-bold text-primary md:text-4xl">4.8</p>
                            <p className="text-sm text-muted-foreground">Trust Score</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Secure Payments */}
            <section className="bg-secondary/50 py-20">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-2xl text-center">
                        <Lock className="mx-auto mb-4 h-12 w-12 text-primary" />
                        <h2 className="mb-4 text-2xl font-bold text-foreground">Secure Payments</h2>
                        <p className="mb-6 text-muted-foreground">
                            All payments are processed through our secure platform. We never share your financial
                            information with service providers. Pay only after the service is completed to your satisfaction.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                            <span className="rounded-full bg-background px-4 py-2">PCI DSS Compliant</span>
                            <span className="rounded-full bg-background px-4 py-2">256-bit Encryption</span>
                            <span className="rounded-full bg-background px-4 py-2">Secure Checkout</span>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
