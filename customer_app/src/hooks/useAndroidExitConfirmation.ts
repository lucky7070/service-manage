import { useCallback } from "react";
import { Alert, BackHandler, Platform } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { APP_EXIT } from "../config/constant";

export function confirmAppExit() {
    Alert.alert(
        APP_EXIT.title,
        APP_EXIT.message,
        [
            { text: APP_EXIT.cancel, style: "cancel" },
            { text: APP_EXIT.confirm, style: "destructive", onPress: () => BackHandler.exitApp() },
        ],
        { cancelable: true }
    );
}

export function useAndroidExitConfirmation(onBack?: () => boolean) {
    useFocusEffect(
        useCallback(() => {
            if (Platform.OS !== "android") return;

            const onBackPress = () => {
                if (onBack?.()) return true;
                confirmAppExit();
                return true;
            };

            const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
            return () => subscription.remove();
        }, [onBack])
    );
}
