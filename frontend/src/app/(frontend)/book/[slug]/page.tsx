import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Briefcase, CalendarCheck, CheckCircle2, MapPin, Star } from "lucide-react";
import Image from "@/components/ui/Image";
import { getPublicServiceProvider } from "@/lib/api.server";
import { resolveFileUrl } from "@/helpers/utils";
import { ProviderWorkPhotoCarousel } from "@/components/front/provider-work-photo-carousel";
import BookingWidget from "@/components/front/booking-widget";

const BookPage = async ({ params }: { params: Promise<{ slug: string }> }) => {

    const { slug } = await params;
    const provider = await getPublicServiceProvider(slug);
    if (!provider) return notFound();

    const backHref = provider.citySlug && provider.serviceCategorySlug ? `/service/${provider.citySlug}/${provider.serviceCategorySlug}` : "/";

    return (
        <section className="bg-gray-50 py-12 md:py-16">
            <div className="container mx-auto px-4">
                <Link href={backHref} className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary">
                    <ArrowLeft className="h-4 w-4" />
                    Back to providers
                </Link>

                <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
                    <aside className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                        <div className="flex flex-col items-center text-center">
                            <div className="h-28 w-28 overflow-hidden rounded-full bg-gray-100 ring-4 ring-orange-50">
                                <Image src={resolveFileUrl(provider.image) || ""} alt={provider.name} className="h-full w-full object-cover" />
                            </div>
                            <h1 className="mt-4 text-2xl font-bold text-gray-900">{provider.name}</h1>
                            <p className="mt-1 text-sm text-gray-500">{provider.serviceCategoryName || "Service Provider"}</p>

                            <div className="mt-4 inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
                                <CheckCircle2 className="h-4 w-4" />
                                Verified Professional
                            </div>
                        </div>

                        <div className="mt-6 space-y-3 text-sm text-gray-600">
                            <p className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                {provider.cityName || "Location not available"}
                            </p>
                            <p className="flex items-center gap-2">
                                <Briefcase className="h-4 w-4 text-gray-400" />
                                {provider.experienceYears} years experience
                            </p>
                            <p className="flex items-center gap-2">
                                <Star className="h-4 w-4 text-amber-500" />
                                {provider.averageRating} ({provider.ratingCount} ratings)
                            </p>
                            <p className="flex items-center gap-2">
                                <CalendarCheck className="h-4 w-4 text-gray-400" />
                                {provider.totalCompletedServices} completed services
                            </p>
                        </div>

                        <BookingWidget provider={provider} />
                    </aside>

                    <div className="space-y-6">
                        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900">About this Professional</h2>
                            <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-600">
                                {provider.experienceDescription?.trim() || `${provider.name} is a verified ${provider.serviceCategoryName || "service"} professional ready to help with your booking.`}
                            </p>
                        </div>

                        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                            <div className="flex items-center justify-between gap-3">
                                <h2 className="text-xl font-bold text-gray-900">Work Photos</h2>
                                <span className="rounded-full bg-orange-50 px-3 py-1 text-sm font-medium text-primary">{provider.photos.length} photos</span>
                            </div>
                            <p className="mt-1 mb-5 text-sm text-gray-500">Previous work uploaded by the provider.</p>
                            <ProviderWorkPhotoCarousel photos={provider.photos} providerName={provider.name} />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default BookPage;