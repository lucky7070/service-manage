import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type UserState = {
    _id: string;
    userId: string;
    name: string;
    mobile: string;
    email: string;
    image: string;
    balance: number;
    referralCode: string;
    dateOfBirth: string;
    preferredLanguage: "en" | "hi";
};

const initialState: UserState = {
    "_id": "",
    "userId": "",
    "name": "",
    "mobile": "",
    "email": "",
    "image": "",
    "balance": 0,
    "referralCode": "",
    "dateOfBirth": "",
    "preferredLanguage": "en"
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        updateUser: (state, action: PayloadAction<Partial<UserState>>) => {
            return { ...state, ...action.payload }
        },
        resetUser: () => initialState,
    }
});

export const { updateUser, resetUser } = userSlice.actions;
export default userSlice.reducer;
