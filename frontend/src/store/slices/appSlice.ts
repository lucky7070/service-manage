import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type ThemeMode = "light" | "dark";

type AppState = {
    theme: ThemeMode;
};

const initialState: AppState = {
    theme: "light"
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
        }
    }
});

export const { setTheme, toggleTheme } = appSlice.actions;
export default appSlice.reducer;

