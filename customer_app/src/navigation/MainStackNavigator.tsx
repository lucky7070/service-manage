import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainLayout from "./MainLayout";
import BookingDetailScreen from "../screens/BookingDetailScreen";
import BookingChatScreen from "../screens/BookingChatScreen";
import BookServiceScreen from "../screens/BookServiceScreen";
import ProviderSearchScreen from "../screens/ProviderSearchScreen";
import ProviderDetailScreen from "../screens/ProviderDetailScreen";
import BookProviderScreen from "../screens/BookProviderScreen";
import ServiceLeadFormScreen from "../screens/ServiceLeadFormScreen";
import AddressFormScreen from "../screens/AddressFormScreen";
import type { MainStackParamList } from "../api/types";

const Stack = createNativeStackNavigator<MainStackParamList>();

export default function MainStackNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
            <Stack.Screen name="Main" component={MainLayout} />
            <Stack.Screen name="BookService" component={BookServiceScreen} />
            <Stack.Screen name="ProviderSearch" component={ProviderSearchScreen} />
            <Stack.Screen name="ProviderDetail" component={ProviderDetailScreen} />
            <Stack.Screen name="BookProvider" component={BookProviderScreen} />
            <Stack.Screen name="ServiceLeadForm" component={ServiceLeadFormScreen} />
            <Stack.Screen name="BookingDetail" component={BookingDetailScreen} />
            <Stack.Screen name="BookingChat" component={BookingChatScreen} />
            <Stack.Screen name="AddressForm" component={AddressFormScreen} />
        </Stack.Navigator>
    );
}
