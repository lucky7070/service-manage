import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { fetchProfile, logout as logoutApi, register as registerApi } from "../api";
import { clearToken, getToken, setToken } from "../storage/token";
import type { CustomerProfile } from "../api/types";

type AuthContextValue = {
    user: CustomerProfile | null;
    bootstrapping: boolean;
    signInWithOtp: (payload: { mobile: string; otp: string; name?: string; referralCode?: string }) => Promise<string | null>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<CustomerProfile | null>(null);
    const [bootstrapping, setBootstrapping] = useState(true);

    const refreshProfile = useCallback(async () => {
        const response = await fetchProfile();
        if (response.status && response.data) {
            const { token: _token, ...profile } = response.data;
            setUser(profile);
        } else {
            setUser(null);
            await clearToken();
        }
    }, []);

    useEffect(() => {
        (async () => {
            const token = await getToken();
            if (token) await refreshProfile();
            setBootstrapping(false);
        })();
    }, [refreshProfile]);

    const signInWithOtp = useCallback(async (payload: { mobile: string; otp: string; name?: string; referralCode?: string }) => {
        const response = await registerApi(payload);
        if (!response.status || !response.data?.token) {
            return response.message || "Could not sign in.";
        }

        await setToken(response.data.token);
        const { token: _token, ...profile } = response.data;
        setUser(profile);
        return null;
    }, []);

    const signOut = useCallback(async () => {
        await logoutApi();
        await clearToken();
        setUser(null);
    }, []);

    const value = useMemo(() => ({ user, bootstrapping, signInWithOtp, signOut, refreshProfile }), [user, bootstrapping, signInWithOtp, signOut, refreshProfile]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
