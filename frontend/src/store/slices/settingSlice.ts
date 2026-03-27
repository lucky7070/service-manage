import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type AppState = {
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

const initialState: AppState = {
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
    initialState,
    reducers: {
        updateSettings: (state, action: PayloadAction<Partial<AppState>>) => {
            return { ...state, ...action.payload }
        },
        resetSettings: () => initialState,
    }
});

export const { updateSettings, resetSettings } = appSlice.actions;
export default appSlice.reducer;
