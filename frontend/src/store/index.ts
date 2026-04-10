import { configureStore } from "@reduxjs/toolkit";
import settingReducer from "@/store/slices/settingSlice";
import adminReducer from "@/store/slices/adminSlice";
import appReducer from "@/store/slices/appSlice";

export const store = configureStore({
    reducer: {
        settings: settingReducer,
        admin: adminReducer,
        app: appReducer
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
