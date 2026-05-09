"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu, X, Phone, LogOut, UserRound } from "lucide-react"
import { toast } from "react-toastify"
import { Button } from "@/components/front/ui"
import Image from "@/components/ui/Image"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { resetUser } from "@/store/slices/userSlice"
import { resolveFileUrl } from "@/helpers/utils"
import AxiosHelper from "@/helpers/AxiosHelper"

export function Header() {
    const router = useRouter()
    const dispatch = useAppDispatch()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const settings = useAppSelector((state) => state.settings)
    const user = useAppSelector((state) => state.user)
    const isLoggedIn = Boolean(user._id)

    const handleLogout = async () => {
        const { data } = await AxiosHelper.postData("/customer/logout", {})
        if (data.status) {
            dispatch(resetUser())
            setMobileMenuOpen(false)
            router.push("/")
        } else {
            toast.error(data.message || "Could not logout.")
        }
    }

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
                            <span className="text-xl font-bold text-orange-600">{settings.application_name || ""}</span>
                        </Link>
                    </div>

                    <nav className="hidden items-center gap-1 md:flex">
                        <Link href="/services">
                            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">Services</Button>
                        </Link>
                        <Link href="/about">
                            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">About</Button>
                        </Link>
                        <Link href="/user/bookings">
                            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">My Bookings</Button>
                        </Link>
                        {isLoggedIn ? (
                            <div className="ml-2 flex items-center gap-1">
                                <Link
                                    href="/user/dashboard"
                                    className="flex max-w-[200px] items-center gap-2 rounded-full py-1 pl-1 pr-3 text-gray-900 hover:bg-gray-100"
                                >
                                    <span className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary">
                                        {user.image ? (
                                            <Image
                                                src={String(resolveFileUrl(user.image))}
                                                alt={user.name || "Profile"}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <UserRound className="h-4 w-4" />
                                        )}
                                    </span>
                                    <span className="truncate text-sm font-medium">{user.name || "Account"}</span>
                                </Link>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 shrink-0 p-0 text-gray-500 hover:text-gray-900"
                                    onClick={handleLogout}
                                    aria-label="Logout"
                                >
                                    <LogOut className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <Link href="/login">
                                <Button size="sm" className="ml-2 bg-primary text-white hover:bg-orange-600">Login</Button>
                            </Link>
                        )}
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
                            <Link href="/user/bookings" onClick={() => setMobileMenuOpen(false)}>
                                <Button variant="ghost" className="w-full justify-start text-gray-600">
                                    My Bookings
                                </Button>
                            </Link>
                            {isLoggedIn ? (
                                <>
                                    <div className="my-2 border-t border-gray-100 pt-3">
                                        <div className="flex items-center gap-3 px-2">
                                            <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary">
                                                {user.image ? (
                                                    <Image
                                                        src={String(resolveFileUrl(user.image))}
                                                        alt={user.name || "Profile"}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <UserRound className="h-5 w-5" />
                                                )}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate font-medium text-gray-900">{user.name || "Account"}</p>
                                                {user.mobile ? (
                                                    <p className="truncate text-xs text-gray-500">{user.mobile}</p>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>
                                    <Link href="/user/dashboard" onClick={() => setMobileMenuOpen(false)}>
                                        <Button variant="ghost" className="w-full justify-start text-gray-600">
                                            Dashboard
                                        </Button>
                                    </Link>
                                    <Link href="/user/profile" onClick={() => setMobileMenuOpen(false)}>
                                        <Button variant="ghost" className="w-full justify-start text-gray-600">
                                            Profile
                                        </Button>
                                    </Link>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="mt-2 w-full justify-start border-gray-200 text-gray-700"
                                        onClick={() => void handleLogout()}
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Logout
                                    </Button>
                                </>
                            ) : (
                                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                                    <Button className="mt-2 w-full bg-primary text-white hover:bg-orange-600">
                                        Login
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </header>
        </>
    )
}
