"use client"

import Link from "next/link"
import { Mail, Phone, MapPin } from "lucide-react"
import { useAppSelector } from "@/store/hooks"
import { resolveFileUrl } from "@/helpers/utils"
import Image from "@/components/ui/Image"
import { MeteorIconsFacebook, MeteorIconsX, MeteorIconsInstagram, MeteorIconsLinkedin } from "@/icons"
import { FOOTER_LINKS } from "@/config/constants"

export function Footer() {

    const settings = useAppSelector((state) => state.settings)
    const socialLinks = [
        { key: "facebook", href: settings.facebook, label: "Facebook", icon: MeteorIconsFacebook },
        { key: "twitter", href: settings.twitter, label: "Twitter", icon: MeteorIconsX },
        { key: "instagram", href: settings.instagram, label: "Instagram", icon: MeteorIconsInstagram },
        { key: "linkdin", href: settings.linkdin, label: "LinkedIn", icon: MeteorIconsLinkedin },
    ].filter((row) => !!row.href)

    return (
        <footer className="border-t border-gray-200 bg-gray-900">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-4 lg:col-span-1">
                        <Link href="/" className="mb-4 inline-flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                                <Image src={String(resolveFileUrl(settings.logo))} alt="Logo" className="h-8 w-8 rounded-lg object-cover bg-white" />
                            </div>
                            <span className="text-xl font-bold text-white">{settings.application_name || ""}</span>
                        </Link>
                        <p className="mb-6 text-sm text-gray-400 leading-relaxed">
                            Your trusted partner for all home services. Quality work, verified professionals, satisfaction guaranteed.
                        </p>
                        {socialLinks.length ? <div className="flex gap-3">
                            {socialLinks.map((item) => <a
                                key={item.key}
                                href={item.href}
                                target="_blank"
                                rel="noreferrer"
                                className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-800 text-gray-400 transition-colors hover:bg-primary hover:text-white"
                                aria-label={item.label}
                            >
                                <item.icon className="h-4 w-4" />
                            </a>)}
                        </div> : null}
                    </div>

                    {FOOTER_LINKS.map((item) => (
                        <div key={item.label}>
                            <h3 className="mb-4 font-semibold text-white">{item.label}</h3>
                            <ul className="space-y-3 text-sm">
                                {item.list.map((item) => (
                                    <li key={item.name}>
                                        <Link href={item.href} className="text-gray-400 transition-colors hover:text-primary">{item.name}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Contact */}
                    <div>
                        <h3 className="mb-4 font-semibold text-white">Contact</h3>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-center gap-2 text-gray-400">
                                <Phone className="h-4 w-4 text-primary" />
                                <span>{settings.phone || ""}</span>
                            </li>
                            <li className="flex items-center gap-2 text-gray-400">
                                <Mail className="h-4 w-4 text-primary" />
                                <span>{settings.email || ""}</span>
                            </li>
                            <li className="flex items-start gap-2 text-gray-400">
                                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                <span>{settings.address || ""}</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-10 flex flex-col items-center gap-4 border-t border-gray-800 pt-6 text-center text-sm md:flex-row md:justify-between">
                    <p className="text-gray-400">{settings.copyright || `Copyright © ${new Date().getFullYear()}. All rights reserved.`}</p>
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
