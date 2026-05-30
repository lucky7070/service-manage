# Push notifications (FCM)

## Backend setup

1. Create a Firebase project and enable **Cloud Messaging**.
2. Download a **service account** key (not `google-services.json`):
   Firebase Console → **Project settings** → **Service accounts** → **Generate new private key**.
3. Add credentials to `backend/.env`:
   - `FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json`
   - or `FIREBASE_SERVICE_ACCOUNT_JSON={...}` (minified one-line JSON)

- **Backend:** service account JSON (`project_id` + `private_key`) — e.g. `firebase-service-account.json`
- **Customer app:** Android `google-services.json` for package `com.serva.users` in the **same** Firebase project

If you see **`messaging/mismatched-credential` / SenderId mismatch**, the device token was issued for a different project or app than the backend. Rebuild the customer app with the correct `google-services.json` and have the user log in again.

## Where tokens are stored

`fcmToken` and `deviceId` are fields on **`Customer`** and **`ServiceProvider`** (nullable, indexed).

They are updated **only** when optional values are sent on:

| Role | Endpoint |
|------|----------|
| Customer | `POST /api/customer/register` (login + signup via OTP) |
| Service provider | `POST /api/service-provider/login` |
| Service provider | `POST /api/service-provider/register` |

Optional body fields:

```json
{
  "fcmToken": "firebase-device-token",
  "deviceId": "stable-install-id"
}
```

Tokens are **not** cleared on logout or other events. On each login/register, send the latest values to refresh the profile.

## Sending notifications from code

```js
import { notifyUser } from "../services/notificationPush.service.js";

await notifyUser({
  userId: customerId,
  userType: "customer",
  title: "Booking update",
  message: "Your provider sent a quote.",
  type: "booking",
  relatedId: bookingId
});
```

Creates an in-app `Notification` row and sends FCM to the user’s saved `fcmToken`.

## Booking status updates

`notifyBookingStatusChange` in `src/helpers/bookingNotifications.js` is called after every booking status change. It notifies the **other** party only (not the user who performed the action):

| Actor | Notifies |
|-------|----------|
| Customer | Provider |
| Provider | Customer |
| Admin | Customer + provider |

Wired in: customer create / accept quote / cancel / complete; provider cancel / quote / start / complete; admin lead assign (new booking).

When a provider sends a quote and status stays `price_pending`, the customer still gets a push via `notifyBookingQuoteSent`.

## Customer app (Expo)

On OTP sign-in, the app requests notification permission, reads the device push token, and includes `fcmToken` + `deviceId` in `POST /customer/register`.

Android: configure `google-services.json` and run `expo prebuild` for native FCM.
