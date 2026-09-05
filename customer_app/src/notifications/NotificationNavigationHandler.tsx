import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { getApp, getApps } from "@react-native-firebase/app";
import { getMessaging, onMessage } from "@react-native-firebase/messaging";
import { handleNotificationResponse } from "./notificationNavigation";
import { isPushAvailableInThisBuild } from "./push";

type Props = {
    enabled: boolean;
};

/** Foreground FCM display + tap handling for booking/chat pushes. */
export default function NotificationNavigationHandler({ enabled }: Props) {
    const initialChecked = useRef(false);

    useEffect(() => {
        if (!enabled || !isPushAvailableInThisBuild()) return;

        const onResponse = (response: Notifications.NotificationResponse) => {
            handleNotificationResponse(response);
        };

        const subscription = Notifications.addNotificationResponseReceivedListener(onResponse);

        if (!initialChecked.current) {
            initialChecked.current = true;
            void Notifications.getLastNotificationResponseAsync().then((response) => {
                if (response) handleNotificationResponse(response);
            });
        }

        let unsubscribeMessage: (() => void) | undefined;
        if (getApps().length) {
            const messaging = getMessaging(getApp());
            unsubscribeMessage = onMessage(messaging, async (remoteMessage) => {
                const title = String(remoteMessage.notification?.title || remoteMessage.data?.title || "Notification");
                const body = String(
                    remoteMessage.notification?.body || remoteMessage.data?.body || remoteMessage.data?.message || ""
                );
                await Notifications.scheduleNotificationAsync({
                    content: {
                        title,
                        body,
                        data: remoteMessage.data || {},
                        sound: true,
                    },
                    trigger: null,
                });
            });
        }

        return () => {
            subscription.remove();
            unsubscribeMessage?.();
        };
    }, [enabled]);

    return null;
}
