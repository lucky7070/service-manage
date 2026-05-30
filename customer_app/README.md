# Serva Services — Customer App

React Native mobile app for **Service Manage** customers. Built with **Expo SDK 54**, TypeScript, React Navigation, Formik + Yup, and Socket.IO for booking chat.

| | |
|---|---|
| **App name** | Serva Services |
| **Android package** | `com.serva.users` |
| **iOS bundle ID** | `com.serva.users` |
| **Backend** | [`../backend`](../backend) — Express API on port `5000` |
| **Web frontend** | [`../frontend`](../frontend) — Next.js customer site |

The app uses **Bearer token** auth stored in SecureStore (the web app uses cookies). All API requests include `Authorization: Bearer <token>` and `x-api-key`.

---

## Table of contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Environment variables](#environment-variables)
- [Setup](#setup)
- [Development](#development)
- [Production builds](#production-builds)
- [Scripts reference](#scripts-reference)
- [Auth flow](#auth-flow)
- [Project structure](#project-structure)
- [Navigation](#navigation)
- [Troubleshooting](#troubleshooting)

---

## Features

- **Auth** — mobile OTP login / register
- **Dashboard** — stats, quick actions, recent activity
- **Book a service** — search by category → find providers → view profile & gallery → book
- **Bookings** — list, filters, pagination, detail, feedback
- **Booking chat** — real-time Socket.IO messaging with typing indicators
- **Service leads** — create and track booking requests
- **Addresses** — CRUD with map-style picker fields
- **Profile** — edit details, language (EN/HI), photo upload
- **Ledger** — transaction history
- **Refer & earn** — referral code sharing
- **Support** — Contact us, Terms & conditions, Privacy policy (CMS from backend)

---

## Prerequisites

### All platforms

- **Node.js 20+**
- **npm**
- Backend running locally or on a reachable server — see [root README](../README.md)

### Android development

- **Android Studio** (SDK + platform tools)
- **JDK 17** — required for native builds (`assembleRelease`)
- Environment variables (Windows example):

```powershell
# User or System environment variables
JAVA_HOME=C:\Program Files\Microsoft\jdk-17.0.x
ANDROID_HOME=C:\Users\<you>\AppData\Local\Android\Sdk
```

Add to `PATH`: `%ANDROID_HOME%\platform-tools` (for `adb`).

Verify:

```powershell
java -version
adb devices
```

### Physical device testing (Expo Go)

- Phone and PC on the **same Wi‑Fi**, **or**
- USB debugging + `adb reverse tcp:5000 tcp:5000` if using `localhost` URLs

Find your PC LAN IP: `ipconfig` → **IPv4 Address** (e.g. `192.168.1.6`).

---

## Environment variables

Expo loads `EXPO_PUBLIC_*` variables at build time. This project uses **separate env files** — you do **not** need a root `.env` file if both of the following exist.

| File | When it loads | Purpose |
|------|---------------|---------|
| `.env.development` | `npm start`, `expo start`, dev builds | Local LAN IP, HTTP, debug logging |
| `.env.production` | `NODE_ENV=production`, release APK, EAS builds | HTTPS URLs, production API key |

**Load order (first match wins):**

- Development: `.env.development.local` → `.env.development` → `.env.local` → `.env`
- Production: `.env.production.local` → `.env.production` → `.env.local` → `.env`

All env files are **gitignored**. Use `.env.example` as a template.

### Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `EXPO_PUBLIC_APP_ENV` | Yes | `development` or `production` |
| `EXPO_PUBLIC_API_URL` | Yes | REST base URL, e.g. `http://192.168.1.6:5000/api` |
| `EXPO_PUBLIC_UPLOAD_URL` | Yes | Uploads base, e.g. `http://192.168.1.6:5000/uploads` |
| `EXPO_PUBLIC_SOCKET_URL` | Yes | Socket.IO origin, e.g. `http://192.168.1.6:5000` |
| `EXPO_PUBLIC_WEB_URL` | Yes | Customer web site (links / CMS), e.g. `http://192.168.1.6:3000` |
| `EXPO_PUBLIC_API_LICENCE` | Yes | Same value as backend `X_API_KEY` |
| `EXPO_PUBLIC_LOG_ERRORS_IN_CONSOLE` | No | `true` in dev, `false` in production |

**Tips**

- Use your PC **LAN IP**, not `localhost`, when testing on a physical phone.
- Do **not** put spaces around `=` — use `KEY=value`, not `KEY = value`.
- `EXPO_PUBLIC_API_LICENCE` must match the backend env var (see `backend/.env` → `X_API_KEY`).
- After changing env files, restart Metro with cache clear: `npx expo start -c`.

### Example — development

Create `.env.development`:

```env
EXPO_PUBLIC_APP_ENV=development
EXPO_PUBLIC_API_URL=http://192.168.1.6:5000/api
EXPO_PUBLIC_UPLOAD_URL=http://192.168.1.6:5000/uploads
EXPO_PUBLIC_SOCKET_URL=http://192.168.1.6:5000
EXPO_PUBLIC_WEB_URL=http://192.168.1.6:3000
EXPO_PUBLIC_API_LICENCE=your-x-api-key-from-backend-env
EXPO_PUBLIC_LOG_ERRORS_IN_CONSOLE=true
```

### Example — production

Create `.env.production` before any release build:

```env
EXPO_PUBLIC_APP_ENV=production
EXPO_PUBLIC_API_URL=https://api.yourdomain.com/api
EXPO_PUBLIC_UPLOAD_URL=https://api.yourdomain.com/uploads
EXPO_PUBLIC_SOCKET_URL=https://api.yourdomain.com
EXPO_PUBLIC_WEB_URL=https://yourdomain.com
EXPO_PUBLIC_API_LICENCE=your-production-x-api-key
EXPO_PUBLIC_LOG_ERRORS_IN_CONSOLE=false
```

When `EXPO_PUBLIC_APP_ENV=production` or `NODE_ENV=production`, `app.config.js` sets `android.usesCleartextTraffic: false` (HTTPS only).

Runtime access: `src/config/env.ts` exports `env.apiUrl`, `env.isProduction`, etc.

---

## Setup

```powershell
cd customer_app
npm install
copy .env.example .env.development
# Edit .env.development with your LAN IP and API key
copy .env.example .env.production
# Edit .env.production with live URLs before release builds
```

Start the backend (from repo root):

```powershell
cd backend
npm run dev
```

---

## Development

### Expo Go (fastest — no native build)

1. Install **Expo Go** on your Android phone.
2. Ensure `.env.development` points to your LAN IP.
3. Run:

```powershell
cd customer_app
npm start
```

4. Scan the QR code with Expo Go (same Wi‑Fi as your PC).

**Push notifications do not work in Expo Go** (SDK 53+). Login still works; `fcmToken` is only sent from a **development build** with `google-services.json`. Use `npm run android` to test FCM.

### Native dev build (USB device / emulator)

Generates `android/` via Expo prebuild on first run:

```powershell
npm run android
```

Requires a connected device (`adb devices`) or a running Android emulator.

### Typecheck

```powershell
npx tsc --noEmit
```

---

## Production builds

### Local release APK (Gradle)

1. Fill `.env.production` with real HTTPS URLs and production API key.
2. Ensure `JAVA_HOME` and `ANDROID_HOME` are set.
3. Generate native project (if `android/` is missing or stale):

```powershell
npm run prebuild:prod
```

4. Build APK:

```powershell
npm run apk:local
```

Output:

```text
android/app/build/outputs/apk/release/app-release.apk
```

> **Note:** The default release build uses the debug keystore (fine for testing). For Google Play, configure a release keystore in `android/app/build.gradle` and store credentials securely.

### EAS Build (cloud)

Requires [EAS CLI](https://docs.expo.dev/build/setup/) and an Expo account:

```powershell
npm install -g eas-cli
eas login
```

Profiles in `eas.json`:

| Profile | Output | Env |
|---------|--------|-----|
| `development` | Dev client APK | `EXPO_PUBLIC_APP_ENV=development` |
| `preview` | Internal APK | `EXPO_PUBLIC_APP_ENV=production` |
| `production` | Store-ready APK | `EXPO_PUBLIC_APP_ENV=production` |

```powershell
npm run apk:preview      # internal test APK (production env)
npm run apk:production   # production APK
```

Set production secrets in [EAS environment variables](https://docs.expo.dev/eas/environment-variables/) or ensure `.env.production` is present locally before `eas build`.

### Test production config in Metro

```powershell
npm run start:prod
```

Loads `.env.production` while still in dev mode — useful to verify URLs before building.

---

## Scripts reference

| Script | Description |
|--------|-------------|
| `npm start` | Start Expo dev server (uses `.env.development`) |
| `npm run start:prod` | Start with `NODE_ENV=production` (uses `.env.production`) |
| `npm run android` | Run native Android dev build |
| `npm run android:prod` | Android dev build with production env |
| `npm run ios` | Run native iOS dev build (macOS only) |
| `npm run web` | Expo web (limited; mobile-first app) |
| `npm run prebuild:prod` | `expo prebuild --clean` with production env |
| `npm run apk:local` | Gradle `assembleRelease` → local APK |
| `npm run apk:preview` | EAS preview APK |
| `npm run apk:production` | EAS production APK |

---

## Auth flow

1. User enters mobile number on **Auth** screen.
2. App calls `POST /customer/send-otp` with `purpose: "login" | "register"`.
3. User enters OTP → `POST /customer/register` with `registerFrom: "mobile"`.
4. Backend returns `{ token, ...profile }` in JSON — **no `Set-Cookie`** for mobile clients.
5. Token is stored in **Expo SecureStore** (`src/storage/token.ts`).
6. `AxiosHelper` sends on every request:
   - `Authorization: Bearer <token>`
   - `x-api-key` (from `EXPO_PUBLIC_API_LICENCE`)
   - `X-Client-Platform: ios | android`
7. On `401`, user is logged out and returned to auth.

**Backend cookie config** (see `backend/.env.example`):

| Variable | Mobile app |
|----------|--------------|
| `CROSS_ORIGIN_COOKIES` | Not used by native app (CORS is browser-only) |
| `COOKIE_ENABLED_FOR_MOBILE` | Keep `false` (default) |
| `MOBILE_CLIENT_HEADER` | Default `x-client-platform` — sent by this app |

Web customer portal still uses `customer_token` httpOnly cookies; admin and provider portals unchanged.

---

## Project structure

```text
customer_app/
  app.config.js          # Dynamic Expo config (cleartext traffic by env)
  app.json               # Static Expo manifest (name, icon, package)
  eas.json               # EAS Build profiles
  assets/                # App icon, splash, adaptive icon
  src/
    api/
      index.ts           # All customer API functions
      types.ts           # Shared TypeScript types + navigation param lists
    components/
      booking/           # Search, chat thread, feedback
      chat/              # Chat UI helpers
      cms/               # CMS pages, contact card, HtmlContent (WebView)
      form/              # Formik fields, pickers, LanguagePicker
      ui/                # Button, Card, PageHero, PaginationBar, etc.
    config/
      env.ts             # EXPO_PUBLIC_* runtime config
      constant.ts        # Menu items, brand copy, support routes
    context/
      AuthContext.tsx    # User session, bootstrap, logout
    helpers/
      AxiosHelper.ts     # Axios instance, interceptors, upload URL helper
      common.ts
      date.ts
    hooks/
      useBookingChat.ts  # Socket.IO booking room
      useAndroidExitConfirmation.ts
    navigation/
      AppNavigator.tsx   # Auth vs main stack
      MainStackNavigator.tsx
      MainLayout.tsx     # Sidebar + tab-like screen switching
      AccountSidebar.tsx
    screens/
      auth/AuthScreen.tsx
      DashboardScreen.tsx
      BookingsScreen.tsx, BookingDetailScreen.tsx, BookingChatScreen.tsx
      BookServiceScreen.tsx, ProviderSearchScreen.tsx, ...
      ProfileScreen.tsx, AddressesScreen.tsx, ...
      TermsScreen.tsx, PrivacyScreen.tsx, ContactUsScreen.tsx
    storage/
      token.ts           # SecureStore read/write/clear
    theme/
      colors.ts
      screenStyles.ts    # Shared layout / section styles
    validation/
      schemas.ts         # Yup schemas (aligned with backend where applicable)
  index.ts               # Expo entry
  App.tsx                # Root providers + AppNavigator
```

---

## Navigation

```text
AppNavigator
├── AuthScreen                    (logged out)
└── MainStackNavigator            (logged in)
    ├── Main (MainLayout)         ← sidebar routes
    │   ├── Dashboard
    │   ├── Bookings
    │   ├── ServiceLeads
    │   ├── Ledger
    │   ├── ReferEarn
    │   ├── Addresses
    │   ├── Profile
    │   ├── ContactUs
    │   ├── Terms
    │   └── Privacy
    ├── BookService
    ├── ProviderSearch
    ├── ProviderDetail
    ├── BookProvider
    ├── ServiceLeadForm
    ├── BookingDetail
    ├── BookingChat
    └── AddressForm
```

Stack screens are pushed from Dashboard / Bookings / Addresses flows. The account **sidebar** switches between main tab screens without unmounting the stack.

---

## Push notifications (FCM)

The backend sends FCM using the **`home-serve-customer`** Firebase project (service account JSON in `backend/.env`).

The customer app **must** use the **Android client** config for the same project and package `com.serva.users`:

1. Firebase Console → project **home-serve-customer** → **Project settings** → **Your apps**
2. Add Android app with package **`com.serva.users`** (if missing)
3. Download **`google-services.json`** → save as `customer_app/google-services.json` (see `google-services.json.example`)
4. Rebuild the native app (Expo Go will **not** match the backend sender ID):

```powershell
npx expo prebuild --clean
npm run android
```

5. Log in again so `fcmToken` is saved on the customer profile

**SenderId mismatch** means the stored `fcmToken` was created by a different Firebase project or build (e.g. Expo Go, wrong `google-services.json`, or provider app `com.serva.services_pro`). Fix the app config, reinstall, and re-login.

Provider quote notifications go to the **customer** on that booking — ensure the **customer** app token is correct, not only the provider device.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| FCM `SenderId mismatch` | Use `google-services.json` from **home-serve-customer** for `com.serva.users`, rebuild native app, customer re-login |
| Network error / API unreachable on phone | Use LAN IP in `.env.development`, same Wi‑Fi, backend running |
| Wrong API key / 403 | Match `EXPO_PUBLIC_API_LICENCE` to backend `X_API_KEY` |
| Env changes not applied | `npx expo start -c` |
| `JAVA_HOME` not set | Install JDK 17, set `JAVA_HOME`, reopen terminal |
| `ANDROID_HOME` / SDK not found | Install Android Studio SDK; set `ANDROID_HOME` (no leading/trailing spaces) |
| No device for `npm run android` | Enable USB debugging or start an emulator; run `adb devices` |
| Cleartext HTTP blocked in release | Expected in production — use HTTPS in `.env.production` |
| OTP not received | Check backend SMS/log config; use dev OTP bypass if configured |

---

## Related documentation

- [Service Manage — root README](../README.md) — backend, seeders, Postman
- [Expo environment variables](https://docs.expo.dev/guides/environment-variables/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
