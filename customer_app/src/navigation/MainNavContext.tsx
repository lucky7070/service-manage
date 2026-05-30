import { createContext, useContext } from "react";
import type { AccountMenuRoute } from "../api/types";

export type MainDrawerParamList = Record<AccountMenuRoute, undefined>;

export type MainNavContextValue = {
    navigate: (route: AccountMenuRoute) => void;
};

export const MainNavContext = createContext<MainNavContextValue | null>(null);

export function useMainNavigation() {
    const ctx = useContext(MainNavContext);
    if (!ctx) throw new Error("useMainNavigation must be used within MainLayout");
    return ctx;
}
