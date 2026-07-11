import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type FranchiseState = {
    _id: string;
    userId: string;
    name: string;
    mobile: string;
    email: string;
    image: string;
    createdAt: string;
};

const initialState: FranchiseState = {
    _id: "",
    userId: "",
    name: "",
    mobile: "",
    email: "",
    image: "",
    createdAt: ""
};

const franchiseSlice = createSlice({
    name: "franchise",
    initialState,
    reducers: {
        updateFranchise: (state, action: PayloadAction<Partial<FranchiseState>>) => {
            return { ...state, ...action.payload };
        },
        resetFranchise: () => initialState
    }
});

export const { updateFranchise, resetFranchise } = franchiseSlice.actions;
export default franchiseSlice.reducer;
