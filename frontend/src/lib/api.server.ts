import AxiosHelper from "@/helpers/AxiosHelper";
import type { SettingsState } from "@/store/slices/settingSlice";

type TestimonialRow = {
    _id: string
    name: string
    designation: string
    rating: number
    review: string
    image: string
}

export async function getServerSettings(): Promise<Partial<SettingsState>> {
    const { data } = await AxiosHelper.getData("/general-settings");
    return (data.status && data.data) ? data.data : {};
}

export async function getTestimonials(from: "customer" | "provider" | "" = ""): Promise<TestimonialRow[]> {
    const { data } = await AxiosHelper.getData(`/testimonials?limit=3&from=${from || ""}`);
    if (data.status && data.data && Array.isArray(data.data)) {
        return data.data;
    } else {
        return [];
    }
}

export type ServiceCategory = {
    _id: string;
    name: string;
    slug: string;
    description?: string | null;
    image?: string | null;
    displayOrder?: number;
};

export async function getHomeServiceCategories(limit = 8): Promise<ServiceCategory[]> {
    const { data } = await AxiosHelper.getData(`/service-categories-home?limit=${limit}`);
    if (data.status && data.data && Array.isArray(data.data)) {
        return data.data as ServiceCategory[];
    }

    return [];
}

export type OurValue = {
    icon: string;
    title: string;
    description: string;
};

export type OurMilestone = {
    year: string;
    event: string;
};

export async function getAboutContent(): Promise<{ ourStory: string; values: OurValue[]; milestones: OurMilestone[] }> {
    const { data } = await AxiosHelper.getData("/about-content");
    if (data.status && data.data) {
        return {
            ourStory: data.data.ourStory,
            values: Array.isArray(data.data.values) ? data.data.values : [],
            milestones: Array.isArray(data.data.milestones) ? data.data.milestones : []
        };
    }
    return { ourStory: "", values: [], milestones: [] };
}

export async function getServiceCategoryBySlug(slug: string): Promise<ServiceCategory | null> {
    const { data } = await AxiosHelper.getData(`/service-categories/${slug}`);
    if (data.status && data.data && !Array.isArray(data.data)) {
        return data.data as ServiceCategory;
    }
    return null;
}

export type ProviderSearchResult = {
    city: { name: string; slug: string };
    serviceCategory: { name: string; slug: string };
    record: Array<{
        _id: string;
        name: string;
        slug: string;
        image: string;
        experienceYears: number;
        totalCompletedServices: number;
        totalRating: number;
        ratingCount: number;
        averageRating: number | null;
    }>;
    count: number;
    pageNo: number;
    limit: number;
    totalPages: number;
};

export async function getServiceProvidersBySlugs(city: string, serviceCategory: string, pageNo = 1, limit = 12): Promise<ProviderSearchResult | null> {
    const { data } = await AxiosHelper.getData(`/service-providers/${city}/${serviceCategory}`, { pageNo, limit });
    if (data.status && data.data) {
        return data.data as ProviderSearchResult;
    }

    return null;
}

export type PublicServiceProvider = {
    _id: string;
    slug: string;
    userId: string;
    name: string;
    image: string | null;
    experienceYears: number;
    experienceDescription?: string | null;
    totalCompletedServices: number;
    totalRating: number;
    ratingCount: number;
    averageRating: number | null;
    isAvailable?: boolean;
    cityId: string;
    cityName: string;
    citySlug: string;
    serviceCategoryId: string;
    serviceCategoryName: string;
    serviceCategorySlug: string;
    photos: Array<string>;
    providerServices: Array<{
        _id: string;
        serviceTypeId: string;
        name: string;
        nameHi?: string | null;
        description?: string | null;
        estimatedTimeMinutes?: number | null;
        basePrice?: number | null;
        price?: number | null;
    }>;
};

export async function getPublicServiceProvider(id: string): Promise<PublicServiceProvider | null> {
    const { data } = await AxiosHelper.getData(`/service-provider/${id}`);
    if (data.status && data.data && !Array.isArray(data.data)) {
        return data.data as PublicServiceProvider;
    }

    return null;
}