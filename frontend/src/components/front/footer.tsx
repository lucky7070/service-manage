import Link from "next/link"
import { Globe, Send, Camera, Play, Mail, Phone, MapPin } from "lucide-react"

const services = [
    { name: "Cleaning Services", href: "/services/cleaning" },
    { name: "Electrical", href: "/services/electrical" },
    { name: "Plumbing", href: "/services/plumbing" },
    { name: "Painting", href: "/services/painting" },
    { name: "Handyman", href: "/services/handyman" },
    { name: "Appliance Repair", href: "/services/appliance-repair" },
]

const company = [
    { name: "About Us", href: "/about" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Partner with Us", href: "/join-pro" },
]

const support = [
    { name: "Help Center", href: "/help" },
    { name: "Safety", href: "/safety" },
    { name: "Contact Us", href: "/contact" },
]

export function Footer() {
    return (
        <footer className="border-t border-gray-200 bg-gray-900">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-4 lg:col-span-1">
                        <Link href="/" className="mb-4 inline-flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                                <span className="text-sm font-bold text-white">H</span>
                            </div>
                            <span className="text-xl font-bold text-white">
                                HomeServe<span className="text-primary">Pro</span>
                            </span>
                        </Link>
                        <p className="mb-6 text-sm text-gray-400 leading-relaxed">
                            Your trusted partner for all home services. Quality work, verified professionals, satisfaction guaranteed.
                        </p>
                        <div className="flex gap-3">
                            <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-800 text-gray-400 transition-colors hover:bg-primary hover:text-white" aria-label="Facebook">
                                <Globe className="h-4 w-4" />
                            </a>
                            <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-800 text-gray-400 transition-colors hover:bg-primary hover:text-white" aria-label="Twitter">
                                <Send className="h-4 w-4" />
                            </a>
                            <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-800 text-gray-400 transition-colors hover:bg-primary hover:text-white" aria-label="Instagram">
                                <Camera className="h-4 w-4" />
                            </a>
                            <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-800 text-gray-400 transition-colors hover:bg-primary hover:text-white" aria-label="Youtube">
                                <Play className="h-4 w-4" />
                            </a>
                        </div>
                    </div>

                    {/* Services */}
                    <div>
                        <h3 className="mb-4 font-semibold text-white">Services</h3>
                        <ul className="space-y-3 text-sm">
                            {services.map((item) => (
                                <li key={item.name}>
                                    <Link href={item.href} className="text-gray-400 transition-colors hover:text-primary">{item.name}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="mb-4 font-semibold text-white">Company</h3>
                        <ul className="space-y-3 text-sm">
                            {company.map((item) => (
                                <li key={item.name}>
                                    <Link href={item.href} className="text-gray-400 transition-colors hover:text-primary">{item.name}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="mb-4 font-semibold text-white">Support</h3>
                        <ul className="space-y-3 text-sm">
                            {support.map((item) => (
                                <li key={item.name}>
                                    <Link href={item.href} className="text-gray-400 transition-colors hover:text-primary">{item.name}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="mb-4 font-semibold text-white">Contact</h3>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-center gap-2 text-gray-400">
                                <Phone className="h-4 w-4 text-primary" />
                                <span>1800-123-4567</span>
                            </li>
                            <li className="flex items-center gap-2 text-gray-400">
                                <Mail className="h-4 w-4 text-primary" />
                                <span>help@homeservepro.com</span>
                            </li>
                            <li className="flex items-start gap-2 text-gray-400">
                                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                <span>123 Service Lane, Tech Park, Bangalore 560001</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-10 flex flex-col items-center gap-4 border-t border-gray-800 pt-6 text-center text-sm md:flex-row md:justify-between">
                    <p className="text-gray-400">&copy; 2026 HomeServe Pro. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="/terms" className="text-gray-400 transition-colors hover:text-primary">Terms</Link>
                        <Link href="/privacy" className="text-gray-400 transition-colors hover:text-primary">Privacy</Link>
                        <Link href="/cookies" className="text-gray-400 transition-colors hover:text-primary">Cookies</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
