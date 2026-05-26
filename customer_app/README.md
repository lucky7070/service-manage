# Service Manage — Customer App (React Native / Expo)

Mobile customer app for the Service Manage platform. Uses **Bearer token** auth (web keeps cookies).

## Prerequisites

- Node.js 20+
- Backend running on your PC (`backend` on port 5000)
- Phone and PC on the **same Wi‑Fi** (or use USB + `adb reverse` for localhost)

## Setup

```powershell
cd customer_app
copy .env.example .env
npm install
```

Edit `.env` — use your PC **LAN IP**, not `localhost`:

```
EXPO_PUBLIC_API_URL=http://192.168.1.7:5000/api
EXPO_PUBLIC_UPLOAD_URL=http://192.168.1.7:5000/uploads
EXPO_PUBLIC_SOCKET_URL=http://192.168.1.7:5000
EXPO_PUBLIC_API_LICENCE=<same as backend X_API_KEY>
```

Find LAN IP: `ipconfig` → IPv4 Address.

## Run on Android phone (Expo Go)

1. Install **Expo Go** from Play Store
2. Start backend: `cd backend && npm run dev`
3. Start app:

```powershell
cd customer_app
npm start
```

4. Scan QR code with Expo Go (same Wi‑Fi)

## Run on connected Android device (dev build)

```powershell
cd customer_app
npm run android
```

Requires USB debugging (`adb devices` shows your phone).

## Auth flow

1. Enter mobile → Login or Create account
2. OTP via `POST /customer/send-otp`
3. Verify → `POST /customer/register` with `registerFrom: "mobile"`
4. Store `data.token` in SecureStore
5. All API calls send `Authorization: Bearer <token>` + `x-api-key`

## Project structure

```
customer_app/
  src/
    api/          # axios client + auth endpoints
    config/       # env
    context/      # AuthProvider
    navigation/   # auth stack + main tabs
    screens/      # Mobile, Otp, Home, Bookings, Profile
    storage/      # SecureStore token
```

## Next features to build

- Service discovery (open APIs)
- Addresses + booking create
- Booking detail + chat (Socket.IO)
- Profile photo upload
