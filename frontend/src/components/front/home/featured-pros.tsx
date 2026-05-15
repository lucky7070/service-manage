import Link from "next/link";
import Image from "@/components/ui/Image";
import { Star, Shield, Clock, BadgeCheck } from "lucide-react";
import { Button } from "@/components/front/ui";
import { getFeaturedProviders } from "@/lib/api.server";
import { resolveFileUrl } from "@/helpers/utils";

const HEADER_COLORS = ["bg-amber-500", "bg-blue-500", "bg-emerald-500", "bg-violet-500", "bg-rose-500", "bg-cyan-500", "bg-indigo-500", "bg-orange-500"];

function initialsFromName(name: string) {
    return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() || "").join("") || "?";
}

function formatExperience(years: number) {
    const n = Number(years) || 0;
    return n === 1 ? "1 year" : `${n} years`;
}

function formatJobs(count: number) {
    const n = Number(count) || 0;
    if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K+`;
    if (n > 0) return `${n}+`;
    return "0";
}

export async function FeaturedPros() {
    const providers = await getFeaturedProviders(8);
    if (!providers.length) return null;

    return (
        <section className="bg-gray-50 py-16 md:py-24">
            <div className="container mx-auto px-4">
                <div className="mb-12 text-center">
                    <span className="mb-3 inline-block rounded-full bg-orange-100 px-4 py-1.5 text-sm font-semibold text-primary">
                        Top Professionals
                    </span>
                    <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
                        Meet Our Best Rated Pros
                    </h2>
                    <p className="mx-auto max-w-xl text-gray-600">
                        Verified professionals ready to help with your home needs
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {providers.map((pro, index) => {
                        const color = HEADER_COLORS[index % HEADER_COLORS.length];
                        const imageUrl = resolveFileUrl(pro.image);
                        const rating = pro.averageRating != null ? pro.averageRating.toFixed(1) : "—";
                        const reviews = pro.ratingCount > 0 ? pro.ratingCount : "—";

                        return (
                            <div
                                key={pro._id}
                                className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                            >
                                <div className={`relative h-16 ${color}`}>
                                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
                                        <div className="relative">
                                            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gray-900 text-lg font-bold text-white">
                                                {imageUrl ? (
                                                    <Image src={imageUrl} alt={pro.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    initialsFromName(pro.name)
                                                )}
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
                                                <BadgeCheck className="h-4 w-4 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-5 pb-5 pt-12 text-center">
                                    <h3 className="mb-1 font-semibold text-gray-900">{pro.name}</h3>
                                    <p className="mb-4 text-sm text-gray-500">{pro.serviceCategoryName || "Service professional"}</p>

                                    <div className="mb-4 flex items-center justify-center gap-1">
                                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                        <span className="font-semibold text-gray-900">{rating}</span>
                                        <span className="text-sm text-gray-500">({reviews})</span>
                                    </div>

                                    <div className="mb-5 flex justify-center gap-4 text-sm">
                                        <div className="flex items-center gap-1 text-gray-500">
                                            <Clock className="h-4 w-4" />
                                            <span>{formatExperience(pro.experienceYears)}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-gray-500">
                                            <Shield className="h-4 w-4" />
                                            <span>{formatJobs(pro.totalCompletedServices)} jobs</span>
                                        </div>
                                    </div>

                                    <Button asChild className="w-full bg-primary text-white hover:bg-orange-600">
                                        <Link href={`/book/${pro.slug}`}>Book Now</Link>
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
