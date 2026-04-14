import Link from 'next/link';
import Image from '../ui/Image';
import { ArrowRight } from 'lucide-react';
import { resolveFileUrl } from '@/helpers/utils';
import type { ServiceCategory } from '@/lib/api.server';

const ServiceCategory = ({ service }: { service: ServiceCategory }) => {
    const description = (service.description && String(service.description).trim()) || "Professional service by verified experts";
    return (
        <Link key={service._id} href={`/services/${service.slug}`} className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg md:p-6">
            <div className="mb-4 h-14 w-14 overflow-hidden rounded-xl bg-orange-50 shadow-lg">
                <Image src={resolveFileUrl(service.image) || ""} alt={service.name} className="h-full w-full object-cover" />
            </div>
            <h3 className="mb-2 font-semibold text-gray-900 transition-colors group-hover:text-primary">{service.name}</h3>
            <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-gray-500">{description}</p>
            <div className="flex items-center gap-1 text-sm font-medium text-primary">
                <span>Book Now</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
        </Link>
    );
}

export default ServiceCategory