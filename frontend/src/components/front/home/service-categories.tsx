import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { getHomeServiceCategories } from "@/lib/api.server"
import ServiceCategory from "../ServiceCategory"

export async function ServiceCategories() {
    const categories = await getHomeServiceCategories(8)

    return (
        <section className="bg-white py-16 md:py-24">
            <div className="container mx-auto px-4">
                <div className="mb-12 text-center">
                    <span className="mb-3 inline-block rounded-full bg-orange-100 px-4 py-1.5 text-sm font-semibold text-primary">
                        Our Services
                    </span>
                    <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
                        What do you need help with?
                    </h2>
                    <p className="mx-auto max-w-2xl text-gray-600">
                        Choose from our wide range of professional home services delivered by verified experts
                    </p>
                </div>

                {categories.length === 0 ? (
                    <p className="text-center text-gray-500">Service categories will appear here soon.</p>
                ) : (
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
                        {categories.map((service, i) => <ServiceCategory key={i} service={service} />)}
                    </div>
                )}

                {categories.length > 0 ? (
                    <div className="mt-10 text-center">
                        <Link href={`/services`} className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-3 font-medium text-gray-700 shadow-sm transition-all hover:border-primary hover:bg-orange-50 hover:text-primary">
                            View All Services
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                ) : null}
            </div>
        </section>
    )
}
