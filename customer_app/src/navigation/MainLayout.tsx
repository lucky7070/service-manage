import { useCallback, useEffect, useMemo, useState, type ComponentType } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DashboardScreen from "../screens/DashboardScreen";
import BookingsScreen from "../screens/BookingsScreen";
import ServiceLeadsScreen from "../screens/ServiceLeadsScreen";
import LedgerScreen from "../screens/LedgerScreen";
import ReferEarnScreen from "../screens/ReferEarnScreen";
import AddressesScreen from "../screens/AddressesScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ContactUsScreen from "../screens/ContactUsScreen";
import TermsScreen from "../screens/TermsScreen";
import PrivacyScreen from "../screens/PrivacyScreen";
import AccountSidebar from "./AccountSidebar";
import { useAndroidExitConfirmation } from "../hooks/useAndroidExitConfirmation";
import { allMenuItems } from "../config/constant";
import type { AccountMenuRoute } from "../api/types";
import { BRAND } from "../config/constant";
import { colors, radius, shadows, spacing } from "../theme/colors";
import { useRoute, type RouteProp } from "@react-navigation/native";
import type { MainStackParamList } from "../api/types";
import { MainNavContext, type MainNavContextValue } from "./MainNavContext";

const screenComponents: Record<AccountMenuRoute, ComponentType> = {
    Dashboard: DashboardScreen,
    Bookings: BookingsScreen,
    ServiceLeads: ServiceLeadsScreen,
    Ledger: LedgerScreen,
    ReferEarn: ReferEarnScreen,
    Addresses: AddressesScreen,
    Profile: ProfileScreen,
    ContactUs: ContactUsScreen,
    Terms: TermsScreen,
    Privacy: PrivacyScreen,
};

export default function MainLayout() {
    const insets = useSafeAreaInsets();
    const route = useRoute<RouteProp<MainStackParamList, "Main">>();
    const [activeRoute, setActiveRoute] = useState<AccountMenuRoute>(route.params?.initialTab ?? "Dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (route.params?.initialTab) setActiveRoute(route.params.initialTab);
    }, [route.params?.initialTab]);

    const activeItem = allMenuItems.find((item) => item.route === activeRoute) ?? allMenuItems[0];
    const ActiveScreen = screenComponents[activeRoute];

    const navValue = useMemo<MainNavContextValue>(() => ({
        navigate: (route) => setActiveRoute(route),
    }), []);

    const onHardwareBack = useCallback(() => {
        if (sidebarOpen) {
            setSidebarOpen(false);
            return true;
        }

        if (activeRoute !== "Dashboard") {
            setActiveRoute("Dashboard");
            return true;
        }
        
        return false;
    }, [sidebarOpen, activeRoute]);

    useAndroidExitConfirmation(onHardwareBack);

    return (
        <MainNavContext.Provider value={navValue}>
            <View style={styles.root}>
                <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
                    <Pressable onPress={() => setSidebarOpen(true)} style={styles.menuBtn} hitSlop={8}>
                        <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.menuBtnGradient}>
                            <Feather name="menu" size={20} color={colors.white} />
                        </LinearGradient>
                    </Pressable>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerEyebrow}>{BRAND.name}</Text>
                        <Text style={styles.headerTitle}>{activeItem.label}</Text>
                    </View>
                    <View style={styles.headerSpacer} />
                </View>
                <View style={styles.headerAccent} />

                <View style={styles.content}>
                    <ActiveScreen />
                </View>

                <AccountSidebar
                    visible={sidebarOpen}
                    activeRoute={activeRoute}
                    onClose={() => setSidebarOpen(false)}
                    onNavigate={(route) => {
                        setActiveRoute(route);
                        setSidebarOpen(false);
                    }}
                />
            </View>
        </MainNavContext.Provider>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.muted,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.card,
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.md,
        gap: spacing.md,
        ...shadows.card,
    },
    headerAccent: {
        height: 3,
        backgroundColor: colors.primary,
        opacity: 0.85,
    },
    menuBtn: {
        borderRadius: radius.lg,
        overflow: "hidden",
    },
    menuBtnGradient: {
        width: 42,
        height: 42,
        alignItems: "center",
        justifyContent: "center",
    },
    headerCenter: {
        flex: 1,
        gap: 2,
    },
    headerEyebrow: {
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 0.6,
        color: colors.primary,
        textTransform: "uppercase",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: colors.foreground,
    },
    headerSpacer: {
        width: 42,
    },
    content: {
        flex: 1,
    },
});
