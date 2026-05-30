import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { handleNotificationResponse } from "./notificationNavigation";
import { isPushAvailableInThisBuild } from "./push";

type Props = {
    enabled: boolean;
};

/** Opens BookingDetail when user taps a booking push notification. */
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

        return () => subscription.remove();
    }, [enabled]);

    return null;
}
