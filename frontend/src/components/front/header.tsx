"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, Phone } from "lucide-react"
import { Button } from "@/components/front/ui"
import Image from "@/components/ui/Image"
import { useAppSelector } from "@/store/hooks"
import { resolveFileUrl } from "@/helpers/utils"

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const settings = useAppSelector((state) => state.settings)

    return (
        <>
            <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/80">
                {/* Top bar */}
                <div className="hidden border-b border-gray-100 bg-gray-50 md:block">
                    <div className="container mx-auto flex h-8 items-center justify-between px-4 text-xs">
                        <div className="flex items-center gap-4 text-gray-600">
                            <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {settings.phone || ""} (Toll Free)
                            </span>
                            <span>Mon-Sat: 10AM - 6PM</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link href="/help" className="text-gray-600 hover:text-primary">Help</Link>
                            <Link href="/join-pro" className="font-medium text-primary hover:underline">Become a Pro</Link>
                        </div>
                    </div>
                </div>

                {/* Main header */}
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                                <Image src={String(resolveFileUrl(settings.logo))} alt="logo" className="h-9 w-9 rounded-xl object-cover" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">{settings.application_name || ""}</span>
                        </Link>
                    </div>

                    <nav className="hidden items-center gap-1 md:flex">
                        <Link href="/services/cleaning">
                            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">Services</Button>
                        </Link>
                        <Link href="/about">
                            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">About</Button>
                        </Link>
                        <Link href="/bookings">
                            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">My Bookings</Button>
                        </Link>
                        <Link href="/login">
                            <Button size="sm" className="ml-2 bg-primary text-white hover:bg-orange-600">Login</Button>
                        </Link>
                    </nav>

                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden">
                        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>

                {/* Mobile menu */}
                {mobileMenuOpen && (
                    <div className="border-t border-gray-100 bg-white px-4 py-4 md:hidden">
                        <div className="flex flex-col gap-1">
                            <Link href="/services/cleaning" onClick={() => setMobileMenuOpen(false)}>
                                <Button variant="ghost" className="w-full justify-start text-gray-600">
                                    Services
                                </Button>
                            </Link>
                            <Link href="/about" onClick={() => setMobileMenuOpen(false)}>
                                <Button variant="ghost" className="w-full justify-start text-gray-600">
                                    About
                                </Button>
                            </Link>
                            <Link href="/join-pro" onClick={() => setMobileMenuOpen(false)}>
                                <Button variant="ghost" className="w-full justify-start text-gray-600">
                                    Join as Pro
                                </Button>
                            </Link>
                            <Link href="/bookings" onClick={() => setMobileMenuOpen(false)}>
                                <Button variant="ghost" className="w-full justify-start text-gray-600">
                                    My Bookings
                                </Button>
                            </Link>
                            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                                <Button className="mt-2 w-full bg-primary text-white hover:bg-orange-600">
                                    Login
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
            </header>
        </>
    )
}
