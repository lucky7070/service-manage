import { ActivityIndicator, StyleSheet, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import AuthScreen from "../screens/auth/AuthScreen";
import MainStackNavigator from "./MainStackNavigator";
import { colors } from "../theme/colors";

export type { MainDrawerParamList } from "./MainLayout";
export type { MainStackParamList } from "../api/types";

export default function AppNavigator() {
    const { user, bootstrapping } = useAuth();

    if (bootstrapping) {
        return <View style={styles.loader}>
            <ActivityIndicator size="large" color={colors.primary} />
        </View>
    }

    return <NavigationContainer>
        {user ? <MainStackNavigator /> : <AuthScreen />}
    </NavigationContainer>
}

const styles = StyleSheet.create({
    loader: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.muted,
    },
});
