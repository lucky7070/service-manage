"use client"

import { RootState } from "@/store";
import { useAppSelector } from "@/store/hooks";
import { SettingsState } from "@/store/slices/settingSlice";

const Setting = ({ name, isNumber = false, defaultValue = "" }: { name: keyof SettingsState, isNumber?: boolean, defaultValue?: string }) => {
    const settings = useAppSelector((store: RootState) => store.settings);
    if (isNumber) {
        return Number(settings[name]) || 0;
    } else {
        return settings[name] || defaultValue;
    }
}

export default Setting