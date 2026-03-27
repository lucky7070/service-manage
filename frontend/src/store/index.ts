import { configureStore } from "@reduxjs/toolkit";
import settingReducer from "./slices/settingSlice";
import adminReducer from "./slices/adminSlice";

export const store = configureStore({
    reducer: {
        settings: settingReducer,
        admin: adminReducer
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
