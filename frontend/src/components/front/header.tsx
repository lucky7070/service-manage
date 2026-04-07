"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, MapPin, ChevronDown, Phone } from "lucide-react"
import { Button } from "./ui/button"
import { LocationPickerModal } from "./location-picker-modal"

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [locationModalOpen, setLocationModalOpen] = useState(false)
    const [selectedCity, setSelectedCity] = useState<string | null>(null)

    return (
        <>
            <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/80">
                {/* Top bar */}
                <div className="hidden border-b border-gray-100 bg-gray-50 md:block">
                    <div className="container mx-auto flex h-8 items-center justify-between px-4 text-xs">
                        <div className="flex items-center gap-4 text-gray-600">
                            <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                1800-123-4567 (Toll Free)
                            </span>
                            <span>Mon-Sat: 8AM - 8PM</span>
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
                                <span className="text-base font-bold text-white">H</span>
                            </div>
                            <span className="text-xl font-bold text-gray-900">
                                HomeServe<span className="text-primary">Pro</span>
                            </span>
                        </Link>

                        <button
                            onClick={() => setLocationModalOpen(true)}
                            className="hidden items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 transition-colors hover:border-primary hover:text-primary md:flex"
                        >
                            <MapPin className="h-4 w-4" />
                            <span>{selectedCity || "Select City"}</span>
                            <ChevronDown className="h-3 w-3" />
                        </button>
                    </div>

                    <nav className="hidden items-center gap-1 md:flex">
                        <Link href="/services/cleaning">
                            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                                Services
                            </Button>
                        </Link>
                        <Link href="/about">
                            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                                About
                            </Button>
                        </Link>
                        <Link href="/bookings">
                            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                                My Bookings
                            </Button>
                        </Link>
                        <Link href="/login">
                            <Button size="sm" className="ml-2 bg-primary text-white hover:bg-orange-600">
                                Login
                            </Button>
                        </Link>
                    </nav>

                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
                    >
                        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>

                {/* Mobile menu */}
                {mobileMenuOpen && (
                    <div className="border-t border-gray-100 bg-white px-4 py-4 md:hidden">
                        <button
                            onClick={() => setLocationModalOpen(true)}
                            className="mb-4 flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-600"
                        >
                            <MapPin className="h-4 w-4" />
                            <span>{selectedCity || "Select City"}</span>
                            <ChevronDown className="ml-auto h-4 w-4" />
                        </button>
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

            <LocationPickerModal
                open={locationModalOpen}
                onOpenChange={setLocationModalOpen}
                selectedCity={selectedCity}
                onCitySelect={(city) => {
                    setSelectedCity(city)
                    setLocationModalOpen(false)
                }}
            />
        </>
    )
}
