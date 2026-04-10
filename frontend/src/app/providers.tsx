"use client";

import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import { makeStore } from "@/store";
import { useLayoutEffect, useMemo } from "react";
import { setTheme, type ThemeMode } from "@/store/slices/appSlice";
import type { SettingsState } from "@/store/slices/settingSlice";
import "react-toastify/dist/ReactToastify.css";

export default function Providers({ children, initialSettings }: { children: React.ReactNode; initialSettings?: Partial<SettingsState> }) {

    const store = useMemo(() => makeStore({ settings: initialSettings || {} }), [initialSettings]);

    useLayoutEffect(() => {
        const stored = window.localStorage.getItem("theme");
        const isDark = stored === "dark";
        document.documentElement.classList.toggle("dark", isDark);

        const initialTheme: ThemeMode = stored === "dark" ? "dark" : "light";
        store.dispatch(setTheme(initialTheme));
        document.documentElement.classList.toggle("dark", initialTheme === "dark");

        const unsubscribe = store.subscribe(() => {
            const theme = store.getState().app.theme;
            document.documentElement.classList.toggle("dark", theme === "dark");
            window.localStorage.setItem("theme", theme);
        });

        return () => { unsubscribe() };
    }, [store]);

    return <Provider store={store}>
        {children}
        <ToastContainer position="top-right" autoClose={3000} />
    </Provider>
}
