import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type SettingsState = {
    application_name: string;
    phone: string;
    email: string;
    copyright: string;
    logo: string;
    favicon: string;
    address: string;
    facebook: string;
    twitter: string;
    linkdin: string;
    instagram: string;
};

export const initialSettingsState: SettingsState = {
    favicon: "",
    logo: "",
    application_name: "",
    copyright: "",
    address: "",
    email: "",
    phone: "",
    facebook: "",
    twitter: "",
    linkdin: "",
    instagram: ""
}

const appSlice = createSlice({
    name: "settings",
    initialState: initialSettingsState,
    reducers: {
        updateSettings: (state, action: PayloadAction<Partial<SettingsState>>) => {
            return { ...state, ...action.payload }
        },
        resetSettings: () => initialSettingsState,
    }
});

export const { updateSettings, resetSettings } = appSlice.actions;
export default appSlice.reducer;
