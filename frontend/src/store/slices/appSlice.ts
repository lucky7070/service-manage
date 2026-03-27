import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type ThemeMode = "light" | "dark";

type AppState = {
    theme: ThemeMode;
    sidebarCollapsed: boolean;
    mobileSidebarOpen: boolean;
    loading: boolean;
};

const initialState: AppState = {
    theme: "light",
    sidebarCollapsed: false,
    mobileSidebarOpen: false,
    loading: true,
};

const appSlice = createSlice({
    name: "app",
    initialState,
    reducers: {
        setTheme: (state, action: PayloadAction<ThemeMode>) => {
            state.theme = action.payload;
        },
        toggleTheme: (state) => {
            state.theme = state.theme === "dark" ? "light" : "dark";
        },
        toggleSidebarCollapsed: (state) => {
            state.sidebarCollapsed = !state.sidebarCollapsed;
        },
        setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
            state.sidebarCollapsed = action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        toggleMobileSidebarOpen: (state) => {
            state.mobileSidebarOpen = !state.mobileSidebarOpen;
        },
        setMobileSidebarOpen: (state, action: PayloadAction<boolean>) => {
            state.mobileSidebarOpen = action.payload;
        },
    }
});

export const { setTheme, toggleTheme, toggleSidebarCollapsed, setSidebarCollapsed, setLoading, toggleMobileSidebarOpen, setMobileSidebarOpen } = appSlice.actions;
export default appSlice.reducer;

