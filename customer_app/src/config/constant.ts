import type { AccountMenuItem } from "../api/types";
import { colors, radius, spacing } from "../theme/colors";

export const chatButtonStyles = {
    btn: {
        flexDirection: "row" as const,
        alignItems: "center" as const,
        gap: 6,
        backgroundColor: "rgba(240,116,26,0.1)",
        borderRadius: radius.xl,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: "rgba(240,116,26,0.2)",
    },
    text: {
        fontSize: 12,
        fontWeight: "700" as const,
        color: colors.primary,
    },
};

export const accountMenuItems: AccountMenuItem[] = [
    { route: "Dashboard", label: "Home", icon: "home" },
    { route: "Bookings", label: "Bookings", icon: "calendar" },
    { route: "ServiceLeads", label: "Booking requests", icon: "clipboard" },
    { route: "Ledger", label: "Ledger", icon: "credit-card" },
    { route: "ReferEarn", label: "Refer and Earn", icon: "gift", highlight: true },
    { route: "Addresses", label: "Addresses", icon: "home" },
    { route: "Profile", label: "Profile", icon: "user" },
];

export const BRAND = {
    mark: "H",
    name: "HomeServe Pro",
} as const;

export const LOGIN_HERO = {
    headline: "Your trusted partner for all home services",
    subline: "Join 50K+ happy customers who trust us with their homes",
} as const;

export const LOGIN_STATS = [
    { value: "50K+", label: "Happy Customers" },
    { value: "10K+", label: "Verified Pros" },
    { value: "4.8★", label: "Average Rating" },
] as const;

export const LOGIN_FORM = {
    welcomeBack: "Welcome back",
    createAccount: "Create account",
    enterCredentials: "Enter your credentials to access your account",
    fillDetails: "Fill in your details to get started",
    loginTab: "Login",
    signUpTab: "Sign Up",
} as const;

export const APP_EXIT = {
    title: "Exit app",
    message: "Are you sure you want to close the app?",
    cancel: "Cancel",
    confirm: "Exit",
} as const;