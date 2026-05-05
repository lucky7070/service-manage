import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Briefcase, MapPin, Star } from "lucide-react";
import Image from "@/components/ui/Image";
import { getServiceProvidersBySlugs } from "@/lib/api.server";
import { resolveFileUrl } from "@/helpers/utils";
import { Button } from "@/components/front/ui";

export default async function ProviderSearchPage({
    params,
    searchParams
}: {
    params: Promise<{ city: string; service: string }>;
    searchParams: Promise<{ pageNo?: string }>;
}) {
    const { city, service } = await params;
    const { pageNo: pageNoParam } = await searchParams;

    const pageNo = Math.max(Number(pageNoParam) || 1, 1);
    const data = await getServiceProvidersBySlugs(city, service, pageNo, 12);
    if (!data) return notFound();
    if (!data.city) return notFound();
    if (!data.serviceCategory) return notFound();

    const prevPage = data.pageNo > 1 ? data.pageNo - 1 : null;
    const nextPage = data.pageNo < data.totalPages ? data.pageNo + 1 : null;

    return (
        <section className="bg-white py-14 md:py-20">
            <div className="container mx-auto px-4">
                <div className="mb-8 flex items-start justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">{data.serviceCategory.name} in {data.city.name}</h1>
                        <p className="mt-2 text-sm text-gray-600">{data.count} service providers found • Page {data.pageNo} of {Math.max(data.totalPages, 1)}</p>
                    </div>
                    <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-primary hover:bg-orange-50 hover:text-primary">
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Link>
                </div>

                {data.record.length === 0 ? (
                    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-8 text-center text-gray-500">
                        No verified providers found for this city/category yet.
                    </div>
                ) : (
                    <>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {data.record.map((row) => (
                                <article key={row._id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="h-14 w-14 overflow-hidden rounded-full bg-gray-100">
                                            <Image src={resolveFileUrl(row.image) || ""} alt={row.name} className="h-full w-full object-cover" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate font-semibold text-gray-900">{row.name}</p>
                                            <p className="text-xs text-gray-500">{data.serviceCategory.name}</p>
                                        </div>
                                        <Link href={`/book/${row.slug}`} className="ml-auto">
                                            <Button>Book Now</Button>
                                        </Link>
                                    </div>

                                    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                                        <p className="inline-flex items-center gap-1">
                                            <MapPin className="h-4 w-4 text-gray-400" />
                                            {data.city.name}
                                        </p>
                                        <p className="inline-flex items-center gap-1">
                                            <Briefcase className="h-4 w-4 text-gray-400" />
                                            {row.experienceYears} years experience
                                        </p>
                                        <p className="inline-flex items-center gap-1">
                                            <Star className="h-4 w-4 text-amber-500" />
                                            {row.averageRating ?? "N/A"} ({row.ratingCount} ratings)
                                        </p>
                                    </div>
                                </article>
                            ))}
                        </div>

                        <div className="mt-8 flex items-center justify-center gap-3">
                            <Link
                                href={prevPage ? `/${city}/${service}?pageNo=${prevPage}` : "#"}
                                className={`inline-flex items-center rounded-md border px-4 py-2 text-sm ${prevPage ? "border-gray-300 text-gray-700 hover:bg-gray-50" : "cursor-not-allowed border-gray-200 text-gray-400"}`}
                                aria-disabled={!prevPage}
                            >
                                Previous
                            </Link>
                            <span className="text-sm text-gray-600">Page {data.pageNo}</span>
                            <Link
                                href={nextPage ? `/${city}/${service}?pageNo=${nextPage}` : "#"}
                                className={`inline-flex items-center rounded-md border px-4 py-2 text-sm ${nextPage ? "border-gray-300 text-gray-700 hover:bg-gray-50" : "cursor-not-allowed border-gray-200 text-gray-400"}`}
                                aria-disabled={!nextPage}
                            >
                                Next
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}
