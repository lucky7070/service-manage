"use client";

import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import { store } from "@/store";
import { useLayoutEffect } from "react";
import { setTheme, type ThemeMode } from "@/store/slices/appSlice";
import "react-toastify/dist/ReactToastify.css";

export default function Providers({ children }: { children: React.ReactNode }) {

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
    }, []);

    return <Provider store={store}>
        {children}
        <ToastContainer position="top-right" autoClose={3000} />
    </Provider>
}
