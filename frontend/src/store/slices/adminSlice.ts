import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type Notification = {
    _id: string;
    title: string;
    message: string;
    isRead: boolean;
    readAt?: string | null;
    createdAt: string;
};

type AdminState = {
    _id: string;
    userId: string;
    name: string;
    mobile: string;
    email: string;
    image: string;
    permissions: number[];
    createdAt: string;
    roleId: string;
    roleName: string;
    notifications: Notification[];
};

const initialState: AdminState = {
    _id: "",
    userId: "",
    name: "",
    mobile: "",
    email: "",
    image: "",
    permissions: [],
    createdAt: "",
    roleId: "",
    roleName: "",
    notifications: []
};

const adminSlice = createSlice({
    name: "admin",
    initialState,
    reducers: {
        updateAdmin: (state, action: PayloadAction<Partial<AdminState>>) => {
            return { ...state, ...action.payload }
        },
        resetAdmin: () => initialState,
    }
});

export const { updateAdmin, resetAdmin } = adminSlice.actions;
export default adminSlice.reducer;
