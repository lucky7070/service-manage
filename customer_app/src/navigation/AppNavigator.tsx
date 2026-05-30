import { NavigationContainer } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import AuthScreen from "../screens/auth/AuthScreen";
import MainStackNavigator from "./MainStackNavigator";
import { navigationRef, onNavigationReady } from "./rootNavigation";
import NotificationNavigationHandler from "../notifications/NotificationNavigationHandler";
export type { MainDrawerParamList } from "./MainNavContext";
export type { MainStackParamList } from "../api/types";

export default function AppNavigator() {
    const { user } = useAuth();

    return (
        <NavigationContainer ref={navigationRef} onReady={onNavigationReady}>
            {user._id ? <>
                <MainStackNavigator />
                <NotificationNavigationHandler enabled />
            </> : (
                <AuthScreen />
            )}
        </NavigationContainer>
    );
}
