import { getHomeServiceCategories } from "@/lib/api.server";
import ServiceCategory from "@/components/front/ServiceCategory";

export default async function ServicesPage() {
    const categories = await getHomeServiceCategories(1000);
    return (
        <section className="bg-white py-16 md:py-24">
            <div className="container mx-auto px-4">
                <div className="mb-12 text-center">
                    <span className="mb-3 inline-block rounded-full bg-orange-100 px-4 py-1.5 text-sm font-semibold text-primary">
                        Our Services
                    </span>
                    <h1 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">All Service Categories</h1>
                    <p className="mx-auto max-w-2xl text-gray-600">Browse all available service categories from our database.</p>
                </div>

                {categories.length === 0 ? (
                    <p className="text-center text-gray-500">Service categories will appear here soon.</p>
                ) : (
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
                        {categories.map((service, i) => <ServiceCategory key={i} service={service} />)}
                    </div>
                )}
            </div>
        </section>
    );
}
