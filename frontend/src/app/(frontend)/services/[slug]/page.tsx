import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Image from "@/components/ui/Image";
import { resolveFileUrl } from "@/helpers/utils";
import { getServiceCategoryBySlug } from "@/lib/api.server";

export default async function ServiceCategoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    
    const { slug } = await params;
    const category = await getServiceCategoryBySlug(slug);
    if (!category) return notFound();

    return <section className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
                <div className="flex justify-between items-start gap-2">

                    <div className="">
                        <div className="mb-5 h-20 w-20 overflow-hidden rounded-xl bg-orange-50 shadow-lg">
                            <Image src={resolveFileUrl(category.image) || ""} alt={category.name} className="h-full w-full object-cover" />
                        </div>
                        <h1 className="mb-2 text-3xl font-bold text-gray-900 md:text-4xl">{category.name}</h1>
                        <p className="text-gray-600">
                            {(category.description && String(category.description).trim()) || "Details coming soon for this category."}
                        </p>
                    </div>
                    <Link
                        href="/services"
                        className="mb-5 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:border-primary hover:bg-orange-50 hover:text-primary"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Go Back
                    </Link>
                </div>
            </div>
        </div>
    </section>
}
