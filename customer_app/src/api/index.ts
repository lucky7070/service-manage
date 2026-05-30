import AxiosHelper, { resolveUploadUrl } from "../helpers/AxiosHelper";
import type { AddressPayload, AddressRow, BookingLocation, ApiResponse, BookingDetail, BookingListData, CategoryServiceType, ChatMessage, CmsPageData, ContactEnquiryPayload, CreateBookingPayload, CreateBookingResult, CreateServiceLeadPayload, CreateServiceLeadResult, CustomerProfile, DashboardData, FieldErrorRow, GeneralSettings, LedgerListData, ProviderSearchData, PublicProviderDetail, RatingTag, SelectOption, ServiceLeadListData, SlugOption, } from "./types";
import type { BookingFeedback, BookingRow, BookingServiceType, LedgerRow, ProviderListRow, ProviderSearchMeta, ProviderServiceRow, ServiceLeadRow } from "./types";

export { resolveUploadUrl };
export type { AddressPayload, AddressRow, ApiResponse, BookingDetail, BookingFeedback, BookingListData, BookingLocation, BookingRow, BookingServiceType, CategoryServiceType, ChatMessage, CmsPageData, ContactEnquiryPayload, CreateBookingPayload, CreateBookingResult, CreateServiceLeadPayload, CreateServiceLeadResult, CustomerProfile, DashboardData, FieldErrorRow, GeneralSettings, LedgerListData, LedgerRow, ProviderListRow, ProviderSearchData, ProviderSearchMeta, ProviderServiceRow, PublicProviderDetail, RatingTag, SelectOption, ServiceLeadListData, ServiceLeadRow, SlugOption, }

export async function sendOtp(mobile: string, purpose: "login" | "register") {
    const { data } = await AxiosHelper.postData("/customer/send-otp", { mobile, purpose });
    return data as ApiResponse<string>;
}

export async function register(payload: {
    mobile: string;
    otp: string;
    name?: string;
    referralCode?: string;
    fcmToken?: string;
    deviceId?: string;
}) {
    const { data } = await AxiosHelper.postData("/customer/register", {
        ...payload,
        registerFrom: "mobile",
    });
    return data as ApiResponse<CustomerProfile>;
}

export async function fetchProfile() {
    const { data } = await AxiosHelper.getData("/customer/profile");
    return data as ApiResponse<CustomerProfile>;
}

export async function updateProfile(payload: {
    name: string;
    email?: string | null;
    dateOfBirth?: string | null;
    preferredLanguage: "en" | "hi";
}) {
    const { data } = await AxiosHelper.putData("/customer/profile", payload);
    return data as ApiResponse<CustomerProfile>;
}

export async function uploadProfileImage(imageUri: string) {
    const formData = new FormData();
    formData.append("image", {
        uri: imageUri,
        type: "image/jpeg",
        name: "profile.jpg",
    } as unknown as Blob);
    const { data } = await AxiosHelper.putData("/customer/profile/image", formData, true);
    return data as ApiResponse<CustomerProfile>;
}

export async function deleteAccount() {
    const { data } = await AxiosHelper.deleteData("/customer/profile");
    return data as ApiResponse<unknown>;
}

export async function logout() {
    const { data } = await AxiosHelper.postData("/customer/logout", {});
    return data as ApiResponse<unknown>;
}

// ─── Dashboard ──────────────────────────────────────────────────────────────

export async function fetchDashboard() {
    const { data } = await AxiosHelper.getData("/customer/dashboard");
    return data as ApiResponse<DashboardData>;
}

// ─── Addresses ──────────────────────────────────────────────────────────────

export async function fetchAddresses() {
    const { data } = await AxiosHelper.getData("/customer/addresses");
    return data as ApiResponse<AddressRow[]>;
}

export async function createAddress(payload: AddressPayload) {
    const { data } = await AxiosHelper.postData("/customer/addresses", payload);
    return data as ApiResponse<AddressRow>;
}

export async function updateAddress(addressId: string, payload: AddressPayload) {
    const { data } = await AxiosHelper.putData(`/customer/addresses/${addressId}`, payload);
    return data as ApiResponse<AddressRow>;
}

export async function deleteAddress(addressId: string) {
    const { data } = await AxiosHelper.deleteData(`/customer/addresses/${addressId}`);
    return data as ApiResponse<unknown>;
}

// ─── Bookings ───────────────────────────────────────────────────────────────

export async function fetchBookings(params: { pageNo?: number; limit?: number; status?: string }) {
    const { data } = await AxiosHelper.getData("/customer/bookings", params as Record<string, unknown>);
    return data as ApiResponse<BookingListData>;
}

export async function fetchBooking(bookingId: string) {
    const { data } = await AxiosHelper.getData(`/customer/bookings/${bookingId}`);
    return data as ApiResponse<BookingDetail>;
}

export async function fetchBookingMessages(bookingId: string) {
    const { data } = await AxiosHelper.getData(`/customer/bookings/${bookingId}/messages`);
    return data as ApiResponse<ChatMessage[]>;
}

export async function sendBookingMessage(bookingId: string, payload: { message?: string; imageUri?: string }) {
    if (payload.imageUri) {
        const formData = new FormData();
        if (payload.message?.trim()) formData.append("message", payload.message.trim());
        formData.append("image", {
            uri: payload.imageUri,
            type: "image/jpeg",
            name: "chat.jpg",
        } as unknown as Blob);
        const { data } = await AxiosHelper.postData(`/customer/bookings/${bookingId}/messages`, formData, true);
        return data as ApiResponse<ChatMessage>;
    }
    const { data } = await AxiosHelper.postData(`/customer/bookings/${bookingId}/messages`, {
        message: payload.message?.trim() || "",
    });
    return data as ApiResponse<ChatMessage>;
}

export async function acceptBookingQuote(bookingId: string) {
    const { data } = await AxiosHelper.putData(`/customer/bookings/${bookingId}/accept-quote`, {});
    return data as ApiResponse<unknown>;
}

export async function cancelBooking(bookingId: string, cancellationReason?: string) {
    const { data } = await AxiosHelper.putData(`/customer/bookings/${bookingId}/cancel`, {
        cancellationReason: cancellationReason?.trim() || "Cancelled by customer",
    });
    return data as ApiResponse<unknown>;
}

export async function completeBooking(bookingId: string) {
    const { data } = await AxiosHelper.putData(`/customer/bookings/${bookingId}/complete`, {});
    return data as ApiResponse<unknown>;
}

export async function submitBookingFeedback(
    bookingId: string,
    payload: { starRating: number; reviewText?: string; quickTags?: string[] }
) {
    const { data } = await AxiosHelper.postData(`/customer/bookings/${bookingId}/feedback`, payload);
    return data as ApiResponse<unknown>;
}

export async function createBooking(payload: CreateBookingPayload) {
    const { data } = await AxiosHelper.postData("/customer/bookings", payload);
    return data as ApiResponse<CreateBookingResult | FieldErrorRow[]>;
}

// ─── Service leads ──────────────────────────────────────────────────────────

export async function fetchServiceLeads(params: { pageNo?: number; limit?: number; status?: string }) {
    const { data } = await AxiosHelper.getData("/customer/service-leads", params as Record<string, unknown>);
    return data as ApiResponse<ServiceLeadListData>;
}

export async function createServiceLead(payload: CreateServiceLeadPayload) {
    const { data } = await AxiosHelper.postData("/customer/service-leads", payload);
    return data as ApiResponse<CreateServiceLeadResult | FieldErrorRow[]>;
}

// ─── Ledger ─────────────────────────────────────────────────────────────────

export async function fetchLedger(params: { pageNo?: number; limit?: number; paymentType?: string; query?: string }) {
    const { data } = await AxiosHelper.getData("/customer/ledger", params as Record<string, unknown>);
    return data as ApiResponse<LedgerListData>;
}

// ─── Open / lookup ──────────────────────────────────────────────────────────

export async function fetchStates(query = "") {
    const { data } = await AxiosHelper.getData("/states-list", { query, limit: 30 });
    return data as ApiResponse<SelectOption[]>;
}

export async function fetchCities(stateId: string, query = "") {
    const { data } = await AxiosHelper.getData("/cities-list", { stateId, query, limit: 30 });
    return data as ApiResponse<SelectOption[]>;
}

export async function fetchProviderRatingTags() {
    const { data } = await AxiosHelper.getData("/feedback-rating-tags", { tagFor: "provider" });
    return data as ApiResponse<RatingTag[]>;
}

export async function fetchCitiesWithState(query = "") {
    const { data } = await AxiosHelper.getData("/cities-with-state", { query, limit: 20, status: 1 });
    return data as ApiResponse<SlugOption[]>;
}

export async function fetchServiceCategories(query = "") {
    const { data } = await AxiosHelper.getData("/service-categories-list", { query, limit: 20, status: 1 });
    return data as ApiResponse<SlugOption[]>;
}

export async function fetchServiceProviders(
    citySlug: string,
    categorySlug: string,
    params: { pageNo?: number; limit?: number; query?: string } = {}
) {
    const { data } = await AxiosHelper.getData(
        `/service-providers/${encodeURIComponent(citySlug)}/${encodeURIComponent(categorySlug)}`,
        {
            pageNo: params.pageNo || 1,
            limit: params.limit || 12,
            query: params.query || undefined,
        }
    );
    return data as ApiResponse<ProviderSearchData>;
}

export async function fetchPublicProvider(idOrSlug: string) {
    const { data } = await AxiosHelper.getData(`/service-provider-details/${encodeURIComponent(idOrSlug)}`);
    return data as ApiResponse<PublicProviderDetail>;
}

export async function fetchServiceTypesByCategory(categorySlug: string) {
    const { data } = await AxiosHelper.getData(`/service-types-by-category/${encodeURIComponent(categorySlug)}`);
    return data as ApiResponse<CategoryServiceType[]>;
}

// ─── CMS & contact ────────────────────────────────────────────────────────────

export async function fetchPrivacyPolicy() {
    const { data } = await AxiosHelper.getData("/privacy-policy");
    return data as ApiResponse<CmsPageData>;
}

export async function fetchTermsAndConditions() {
    const { data } = await AxiosHelper.getData("/terms-and-conditions");
    return data as ApiResponse<CmsPageData>;
}

export async function fetchGeneralSettings() {
    const { data } = await AxiosHelper.getData("/general-settings", { type: "customer" });
    return data as ApiResponse<GeneralSettings>;
}

export async function submitContactEnquiry(payload: ContactEnquiryPayload) {
    const { data } = await AxiosHelper.postData("/enquiries", payload);
    return data as ApiResponse<unknown>;
}
