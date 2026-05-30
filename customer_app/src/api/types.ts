import { Feather } from "@expo/vector-icons";

export type ApiResponse<T = unknown> = {
    status: boolean;
    message?: string;
    data: T;
};

export type CustomerProfile = {
    _id: string;
    userId: string;
    name: string;
    mobile: string;
    email: string;
    image: string;
    balance: number;
    referralCode: string;
    dateOfBirth: string;
    preferredLanguage: "en" | "hi";
    token?: string;
};

export type SelectOption = { value: string; label: string };

export type RatingTag = {
    _id: string;
    tagName: string;
    tagType?: string;
    tagFor?: string;
};

export type SlugOption = {
    value: string;
    label: string;
    slug: string;
};

export type AddressRow = {
    _id: string;
    addressLine1: string;
    addressLine2?: string;
    landmark?: string;
    state?: string;
    city?: string;
    stateName?: string;
    cityName?: string;
    pincode?: string;
    latitude?: number;
    longitude?: number;
    isDefault?: boolean;
    locationType?: "home" | "office" | "other";
    createdAt?: string;
};

export type AddressPayload = {
    addressLine1: string;
    addressLine2: string;
    landmark?: string;
    state: string;
    city: string;
    pincode: string;
    latitude: number;
    longitude: number;
    locationType?: "home" | "office" | "other";
    isDefault?: boolean | 0 | 1;
};

export type BookingRow = {
    _id: string;
    bookingNumber: string;
    providerName?: string;
    serviceCategoryName?: string;
    serviceTypeNames?: string[];
    cityName?: string;
    status: string;
    bookingTime?: string;
    scheduledTime?: string;
    finalPrice?: number | null;
};

export type BookingListData = {
    record: BookingRow[];
    count: number;
    totalPages: number;
    current_page: number;
};

export type BookingServiceType = {
    _id: string;
    name: string;
    basePrice?: number;
    estimatedTimeMinutes?: number;
};

export type BookingLocation = {
    addressLine1?: string;
    addressLine2?: string;
    landmark?: string;
    city?: string;
    state?: string;
    pincode?: string;
};

export type BookingFeedback = {
    _id: string;
    starRating: number;
    reviewText?: string | null;
    quickTags?: Array<{ _id: string; tagName: string; tagType?: string }>;
    createdAt?: string;
};

export type BookingDetail = {
    _id: string;
    bookingNumber: string;
    providerName?: string;
    serviceCategoryName?: string;
    serviceTypes?: BookingServiceType[];
    status: string;
    issueDescription?: string | null;
    quotedPrice?: number | null;
    agreedPrice?: number | null;
    finalPrice?: number | null;
    scheduledTime?: string;
    startTime?: string | null;
    location?: BookingLocation;
    customerFeedback?: BookingFeedback | null;
};

export type ChatMessage = {
    _id: string;
    senderType: "customer" | "provider";
    message?: string | null;
    attachmentUrl?: string | null;
    createdAt?: string;
};

export type CreateBookingPayload = {
    providerId: string;
    serviceTypeId: string[];
    addressId: string;
    scheduledTime: string;
    issueDescription?: string;
};

export type CreateBookingResult = {
    _id: string;
    bookingNumber?: string;
};

export type ServiceLeadRow = {
    _id: string;
    leadNumber: string;
    status: "open" | "assigned" | "cancelled";
    scheduledTime?: string;
    issueDescription?: string | null;
    bookingId?: string | null;
    createdAt?: string;
    serviceCategoryName?: string;
    cityName?: string;
};

export type ServiceLeadListData = {
    record: ServiceLeadRow[];
    count: number;
    totalPages: number;
    current_page: number;
};

export type CreateServiceLeadPayload = {
    cityId: string;
    serviceCategoryId: string;
    serviceTypeId: string[];
    addressId: string;
    scheduledTime: string;
    issueDescription?: string;
};

export type CreateServiceLeadResult = {
    _id: string;
    leadNumber?: string;
    status?: string;
};

export type DashboardData = {
    addressCount: number;
    bookingStats: Record<string, number>;
    recentBookings: Array<{
        _id: string;
        bookingNumber: string;
        providerName?: string;
        serviceCategoryName?: string;
        status: string;
        bookingTime?: string;
    }>;
};

export type LedgerRow = {
    _id: string;
    voucherNo: string;
    amount: number;
    currentBalance: number;
    updatedBalance: number;
    paymentType: 1 | 2;
    paymentMethod?: number;
    particulars?: string | null;
    createdAt?: string;
};

export type LedgerListData = {
    record: LedgerRow[];
    count: number;
    totalPages: number;
    current_page: number;
};

export type ProviderListRow = {
    _id: string;
    name: string;
    slug: string;
    image?: string | null;
    experienceYears?: number;
    totalCompletedServices?: number;
    totalRating?: number;
    ratingCount?: number;
};

export type ProviderSearchMeta = {
    _id: string;
    name: string;
    slug: string;
};

export type ProviderSearchData = {
    record: ProviderListRow[];
    count: number;
    totalPages: number;
    current_page: number;
    city: ProviderSearchMeta | null;
    serviceCategory: ProviderSearchMeta | null;
};

export type ProviderServiceRow = {
    _id: string;
    serviceTypeId: string;
    name: string;
    description?: string | null;
    basePrice?: number | null;
    price?: number | null;
    estimatedTimeMinutes?: number | null;
};

export type PublicProviderDetail = {
    _id: string;
    name: string;
    slug: string;
    image?: string | null;
    photos?: string[];
    experienceYears?: number;
    experienceDescription?: string;
    totalCompletedServices?: number;
    totalRating?: number;
    ratingCount?: number;
    averageRating?: number | string;
    cityId?: string;
    cityName?: string;
    citySlug?: string;
    serviceCategoryId?: string;
    serviceCategoryName?: string;
    serviceCategorySlug?: string;
    providerServices: ProviderServiceRow[];
};

export type CategoryServiceType = {
    _id: string;
    name: string;
    description?: string | null;
    basePrice?: number | null;
    estimatedTimeMinutes?: number | null;
};

export type FieldErrorRow = { field?: string; message?: string };

export type BookingPresenceSnapshot = {
    customerOnline: boolean;
    providerOnline: boolean;
};

export type BookingTypingPayload = {
    role?: "customer" | "provider";
    typing?: boolean;
};


export type AccountMenuRoute =
    | "Dashboard"
    | "Bookings"
    | "ServiceLeads"
    | "Ledger"
    | "ReferEarn"
    | "Addresses"
    | "Profile"
    | "ContactUs"
    | "Terms"
    | "Privacy";

export type CmsPageData = {
    title?: string;
    pageTitle?: string;
    content?: string;
    contentHi?: string;
    metaDescription?: string;
    updatedAt?: string;
};

export type GeneralSettings = {
    favicon: string;
    logo: string;
    application_name: string;
    copyright: string;
    address: string;
    email: string;
    phone: string;
    brand_tagline: string;
    facebook: string;
    twitter: string;
    linkdin: string;
    instagram: string;
    force_update_android: string;
    force_update_ios: string;
    app_version_android: string;
    app_version_ios: string;
    app_url_android: string;
    app_url_ios: string;
    force_update_message_android: string;
    force_update_message_ios: string;
    maintenance: string;
    maintenance_toggle: string;
    information_banner: string;
    information_banner_toggle: string;
    baseUrl: string;
    uploadUrl: string;
};

export type ContactEnquiryPayload = {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
};

export type AccountMenuItem = {
    route: AccountMenuRoute;
    label: string;
    icon: keyof typeof Feather.glyphMap;
    highlight?: boolean;
};


export type MainStackParamList = {
    Main: { initialTab?: AccountMenuRoute } | undefined;
    BookService: undefined;
    ProviderSearch: {
        citySlug: string;
        cityName: string;
        cityId: string;
        categorySlug: string;
        categoryName: string;
        categoryId: string;
    };
    ProviderDetail: { providerSlug: string };
    BookProvider: {
        providerId: string;
        providerSlug?: string;
        providerName?: string;
    };
    ServiceLeadForm: {
        cityId: string;
        cityName: string;
        categoryId: string;
        categoryName: string;
        categorySlug: string;
    };
    BookingDetail: { bookingId: string };
    BookingChat: {
        bookingId: string;
        bookingNumber?: string;
        providerName?: string;
        chatDisabled?: boolean;
    };
    AddressForm: { addressId?: string };
};
