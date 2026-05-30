import { ActivityIndicator, StyleSheet, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import AuthScreen from "../screens/auth/AuthScreen";
import MainStackNavigator from "./MainStackNavigator";
import { navigationRef, onNavigationReady } from "./rootNavigation";
import NotificationNavigationHandler from "../notifications/NotificationNavigationHandler";
import { colors } from "../theme/colors";

export type { MainDrawerParamList } from "./MainNavContext";
export type { MainStackParamList } from "../api/types";

export default function AppNavigator() {
    const { user, bootstrapping } = useAuth();

    if (bootstrapping) {
        return <View style={styles.loader}>
            <ActivityIndicator size="large" color={colors.primary} />
        </View>
    }

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

const styles = StyleSheet.create({
    loader: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.muted,
    },
});
