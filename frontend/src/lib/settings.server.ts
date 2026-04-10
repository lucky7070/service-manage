import AxiosHelper from "@/helpers/AxiosHelper";
import type { SettingsState } from "@/store/slices/settingSlice";

export async function getServerSettings(): Promise<Partial<SettingsState>> {
    const { data } = await AxiosHelper.getData("/general-settings");
    return (data.status && data.data) ? data.data : {};
}
