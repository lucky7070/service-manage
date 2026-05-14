import Link from "next/link";
import { Home, Mail, Search, ShieldAlert } from "lucide-react";

export default function FrontendNotFound() {
    return (
        <div className="relative flex flex-col items-center justify-center overflow-hidden px-4 py-16 sm:py-24">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-20 top-0 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
                <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-orange-200/40 blur-3xl" />
            </div>

            <section className="relative w-full max-w-lg rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-lg sm:p-10">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-primary">
                    <ShieldAlert className="h-8 w-8" />
                </div>

                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Error 404</p>
                <h1 className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl">Page not found</h1>
                <p className="mx-auto mt-3 max-w-md text-sm text-gray-600 sm:text-base">
                    This address is not valid on our site. Check the link or browse from the home page.
                </p>

                <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
                    <Link
                        href="/"
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-md transition hover:bg-orange-600"
                    >
                        <Home className="h-4 w-4" />
                        Go to Home
                    </Link>
                    <Link
                        href="/services"
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-5 text-sm font-medium text-gray-800 transition hover:border-primary hover:bg-orange-50 hover:text-primary"
                    >
                        <Search className="h-4 w-4" />
                        Browse services
                    </Link>
                    <Link
                        href="/contact-us"
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg px-5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                        <Mail className="h-4 w-4" />
                        Contact us
                    </Link>
                </div>
            </section>
        </div>
    );
}
