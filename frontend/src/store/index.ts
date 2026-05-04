import { configureStore } from "@reduxjs/toolkit";
import settingReducer from "@/store/slices/settingSlice";
import adminReducer from "@/store/slices/adminSlice";
import appReducer from "@/store/slices/appSlice";
import userReducer from "@/store/slices/userSlice";
import { initialSettingsState, type SettingsState } from "@/store/slices/settingSlice";

export const makeStore = (preloadedState?: { settings?: Partial<SettingsState> }) => {

    const preloadedSettingsState = preloadedState ? { settings: { ...initialSettingsState, ...(preloadedState.settings || {}) } } : undefined;
    return configureStore({
        reducer: {
            settings: settingReducer,
            admin: adminReducer,
            user: userReducer,
            app: appReducer
        },
        preloadedState: preloadedSettingsState
    });
};

export const store = makeStore();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = ReturnType<typeof makeStore>;
