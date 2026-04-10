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

export async function getTestimonials(form: "customer" | "provider" | "" = ""): Promise<TestimonialRow[]> {
    const { data } = await AxiosHelper.getData(`/testimonials?limit=3&form=${form || ""}`);
    if (data.status && data.data && Array.isArray(data.data)) {
        return data.data;
    } else {
        return [];
    }
}