# Serva Services — Customer App

React Native mobile app for **Service Manage** customers. Built with **Expo SDK 54**, TypeScript, React Navigation, Formik + Yup, and Socket.IO for booking chat.

| | |
|---|---|
| **App name** | Serva Services |
| **Android package** | `com.serva.services` |
| **iOS bundle ID** | `com.serva.services` |
| **Backend** | [`../backend`](../backend) — Express API on port `5000` |
| **Web frontend** | [`../frontend`](../frontend) — Next.js customer site |

The app uses **Bearer token** auth stored in SecureStore (the web app uses cookies). All API requests include `Authorization: Bearer <token>` and `x-api-key`.

---

## Table of contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Environment variables](#environment-variables)
- [Setup (first time)](#setup-first-time)
- [Run the app (development)](#run-the-app-development)
- [Production builds — overview](#production-builds--overview)
- [Build APK (share with testers)](#build-apk-share-with-testers)
- [Build AAB (Google Play Store)](#build-aab-google-play-store)
- [EAS cloud builds (optional)](#eas-cloud-builds-optional)
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

## Setup (first time)

Complete these steps once on a new machine.

### 1. Install tools

| Tool | Purpose |
|------|---------|
| **Node.js 20+** | JavaScript runtime |
| **npm** | Package manager (comes with Node) |
| **Android Studio** | Android SDK, emulator, platform tools |
| **JDK 17** | Required for native Android builds |

Windows environment variables (adjust paths):

```powershell
setx JAVA_HOME "C:\Program Files\Java\jdk-17"
setx ANDROID_HOME "C:\Users\<you>\AppData\Local\Android\Sdk"
```

Add `%ANDROID_HOME%\platform-tools` to `PATH`, then **restart the terminal**.

Verify:

```powershell
node -v
java -version
adb version
```

### 2. Install app dependencies

```powershell
cd customer_app
npm install
```

### 3. Create environment files

```powershell
copy .env.example .env.development
copy .env.example .env.production
```

Edit **`.env.development`** — use your PC **LAN IP**, not `localhost`, for physical phone testing:

```powershell
ipconfig
# Use IPv4 Address, e.g. 192.168.1.56
```

```env
EXPO_PUBLIC_APP_ENV=development
EXPO_PUBLIC_API_URL=http://192.168.1.56:5000/api
EXPO_PUBLIC_UPLOAD_URL=http://192.168.1.56:5000/uploads
EXPO_PUBLIC_SOCKET_URL=http://192.168.1.56:5000
EXPO_PUBLIC_WEB_URL=http://192.168.1.56:3000
EXPO_PUBLIC_API_LICENCE=your-x-api-key-from-backend-env
EXPO_PUBLIC_LOG_ERRORS_IN_CONSOLE=true
```

Edit **`.env.production`** — live HTTPS URLs for release builds:

```env
EXPO_PUBLIC_APP_ENV=production
EXPO_PUBLIC_API_URL=https://serva-server.technolite.in/api
EXPO_PUBLIC_UPLOAD_URL=https://serva-server.technolite.in/uploads
EXPO_PUBLIC_SOCKET_URL=https://serva-server.technolite.in
EXPO_PUBLIC_WEB_URL=https://serva.technolite.in
EXPO_PUBLIC_API_LICENCE=your-production-x-api-key
EXPO_PUBLIC_LOG_ERRORS_IN_CONSOLE=false
```

Rules:

- No spaces around `=` — use `KEY=value`.
- `EXPO_PUBLIC_API_LICENCE` must match backend `X_API_KEY`.

### 4. Firebase (push notifications)

1. Firebase Console → project **home-serve-customer** → **Project settings** → **Your apps**
2. Android app package: **`com.serva.services`**
3. Download **`google-services.json`** → save as `customer_app/google-services.json`

Push notifications **do not work in Expo Go**. Use a native build (`npm run android`).

### 5. Play Store signing (one time, if you use EAS or already published)

If your first Play upload used EAS, export the upload keystore once:

```powershell
cd customer_app
npx eas login
npx eas credentials
```

**Android** → **production** → **Keystore** → **Download** (or **Download credentials to credentials.json**).

Then:

1. Copy keystore to `android/app/serva-upload.keystore`
2. Add four lines to `android/gradle.properties` (see `android/gradle.properties.release.example`)
3. Back up keystore + passwords securely — **never commit them**

`credentials.json`, `*.jks`, and `google-services.json` are gitignored.

### 6. Start the backend

From repo root:

```powershell
cd backend
npm install
npm run dev
```

Backend listens on `http://0.0.0.0:5000` (reachable on your LAN IP from a phone).

---

## Run the app (development)

### Option A — Native dev build (recommended)

USB phone or Android emulator. Generates `android/` on first run.

```powershell
cd customer_app
npm run android
```

- Phone: enable **USB debugging**, connect cable, run `adb devices`
- Emulator: start one from Android Studio first
- After env changes: `npx expo start -c` then re-run `npm run android`

Test **production URLs** without a release build:

```powershell
npm run android:prod
```

### Option B — Expo Go (quick UI check only)

```powershell
cd customer_app
npm start
```

Scan QR code with **Expo Go** (same Wi‑Fi as PC). No push notifications; some native features may differ.

### Option C — Metro only (already have dev build installed)

```powershell
npm start
# Press a to open on Android
```

### Typecheck

```powershell
npx tsc --noEmit
```

---

## Production builds — overview

| Goal | Command | Output | Signing |
|------|---------|--------|---------|
| Share APK with testers | `npm run apk:local` | `app-release.apk` | Upload keystore (if configured) |
| **Google Play update** | `npm run aab:local` | `app-release.aab` | Upload keystore (required) |
| Cloud build (optional) | `npm run apk:preview` / `aab:production` | Download from expo.dev | EAS keystore |

**Before every release build:**

1. Update `.env.production` with correct live URLs
2. Ensure `google-services.json` exists
3. Bump version in `app.json`:
   - `expo.version` — e.g. `"1.0.1"` (shown to users)
   - `expo.android.versionCode` — integer, **must increase** each Play upload (`2`, `3`, …)

**Regenerate native project** when you change plugins, `app.json`, or `google-services.json`:

```powershell
npm run prebuild:prod
```

After `prebuild --clean`, re-add `SERVA_UPLOAD_*` lines to `android/gradle.properties` if they were removed.

---

## Build APK (share with testers)

For internal testing via Drive, WhatsApp, or direct install — **not** for Google Play (Play requires AAB).

### Steps

```powershell
cd customer_app

# 1. Confirm .env.production + google-services.json

# 2. Regenerate android/ if native config changed
npm run prebuild:prod

# 3. Build release APK
npm run apk:local
```

### Output

```text
customer_app/android/app/build/outputs/apk/release/app-release.apk
```

### Install on a phone

1. Send the APK file to the device
2. Enable **Install unknown apps** for Chrome / Files / Drive
3. Open the APK and install

### APK troubleshooting

| Problem | Fix |
|---------|-----|
| App hits localhost / wrong API | Fix `.env.production` (no spaces around `=`); re-run `prebuild:prod` + `apk:local` |
| API 403 | Match `EXPO_PUBLIC_API_LICENCE` to backend `X_API_KEY` |
| `JAVA_HOME` / SDK errors | Set env vars; open Android Studio once to install SDK |
| Push not working | Add `google-services.json`, rebuild, user re-login |

---

## Build AAB (Google Play Store)

Google Play requires an **Android App Bundle (`.aab`)**. **Recommended: build locally** with your exported EAS upload keystore — no EAS cloud needed for updates.

### One-time signing setup

Already done if you exported from EAS. Otherwise:

```powershell
npx eas credentials
# Download keystore → save as android/app/serva-upload.keystore
```

Add to `android/gradle.properties`:

```properties
SERVA_UPLOAD_STORE_FILE=serva-upload.keystore
SERVA_UPLOAD_KEY_ALIAS=<from EAS or credentials.json>
SERVA_UPLOAD_STORE_PASSWORD=<from EAS>
SERVA_UPLOAD_KEY_PASSWORD=<from EAS>
```

Template: `android/gradle.properties.release.example`

### Every Play Store release

```powershell
cd customer_app

# 1. Bump app.json version + versionCode
# 2. Confirm .env.production

# 3. Regenerate android/ only if native config changed
npm run prebuild:prod
# Re-add SERVA_UPLOAD_* to gradle.properties if prebuild reset it

# 4. Build signed AAB
npm run aab:local
```

### Output

```text
customer_app/android/app/build/outputs/bundle/release/app-release.aab
```

### Upload to Play Console

1. Open [Google Play Console](https://play.google.com/console)
2. **Release** → **Production** (or **Internal testing** first)
3. **Create new release** → upload `app-release.aab`
4. Add release notes → **Review and roll out**

Use the **same upload keystore** for every update. Google rejects AABs signed with a different key.

---

## EAS cloud builds (optional)

Use only if you prefer building on Expo servers instead of local Gradle. Requires Expo account and [EAS env vars](https://docs.expo.dev/eas/environment-variables/) (`.env.production` is **not** uploaded).

```powershell
cd customer_app
npx eas login
npm run apk:preview      # test APK (production env)
npm run aab:production   # Play Store AAB (production env)
```

Monorepo note: root `.easignore` excludes `frontend/`, `backend/`, and large folders from the upload.

| Profile | Output |
|---------|--------|
| `preview` | Internal test APK |
| `production` | Play Store AAB (`buildType: app-bundle`) |

For ongoing Play updates after your first EAS upload, **local `aab:local` is simpler** and does not require EAS cloud.

---

### Test production config in Metro (before building)

```powershell
npm run start:prod
```

Loads `.env.production` in dev mode — verify API URLs before `apk:local` or `aab:local`.

---

## Scripts reference

| Script | When to use | Output |
|--------|-------------|--------|
| `npm install` | First-time setup | Installs dependencies |
| `npm start` | Daily development | Metro dev server (`.env.development`) |
| `npm run start:prod` | Test production URLs in dev | Metro with `.env.production` |
| `npm run android` | Dev on device/emulator | Debug build + installs app |
| `npm run android:prod` | Dev build with prod env | Same, production URLs |
| `npm run prebuild:prod` | Before release or after native config change | Regenerates `android/` |
| `npm run apk:local` | Share APK with testers | `android/.../app-release.apk` |
| `npm run aab:local` | **Google Play upload** | `android/.../app-release.aab` |
| `npm run apk:preview` | Optional EAS cloud test APK | Download from expo.dev |
| `npm run aab:production` | Optional EAS cloud Play AAB | Download from expo.dev |
| `npm run ios` | Dev on iOS (macOS only) | Xcode build |
| `npm run web` | Limited web preview | Browser |
| `npx tsc --noEmit` | Before commit | TypeScript check |

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

The customer app **must** use the **Android client** config for the same project and package **`com.serva.services`**:

1. Firebase Console → project **home-serve-customer** → **Project settings** → **Your apps**
2. Add Android app with package **`com.serva.services`** (if missing)
3. Download **`google-services.json`** → save as `customer_app/google-services.json`
4. Rebuild the native app (Expo Go will **not** match the backend sender ID):

```powershell
npm run prebuild:prod
npm run android
```

5. Log in again so `fcmToken` is saved on the customer profile

**SenderId mismatch** means the stored `fcmToken` was created by a different Firebase project or build (e.g. Expo Go, wrong `google-services.json`). Fix the app config, reinstall, and re-login.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| FCM `SenderId mismatch` | Use `google-services.json` for `com.serva.services`, rebuild, re-login |
| Network error / API unreachable on phone | LAN IP in `.env.development`, same Wi‑Fi, backend running |
| App uses `localhost` on physical phone | Use PC LAN IP in `.env.development`, not `localhost` |
| Wrong API key / 403 | Match `EXPO_PUBLIC_API_LICENCE` to backend `X_API_KEY` |
| Env changes not applied | `npx expo start -c` then rebuild |
| `JAVA_HOME` not set | Install JDK 17, set `JAVA_HOME`, reopen terminal |
| `ANDROID_HOME` / SDK not found | Install Android Studio SDK; set `ANDROID_HOME` |
| No device for `npm run android` | Enable USB debugging or start emulator; `adb devices` |
| Cleartext HTTP blocked in release | Use HTTPS in `.env.production` only |
| OTP not received | Check backend SMS config |
| EAS archive too big (>2 GB) | Root `.easignore` excludes monorepo folders; or use local `aab:local` |
| EAS `ENOSPC` disk full | Free disk space on `C:`; delete `android/app/build`, temp files |
| Play rejects AAB signing | Use same upload keystore as first upload (`SERVA_UPLOAD_*` in gradle.properties) |
| `prebuild:prod` reset signing | Re-add `SERVA_UPLOAD_*` lines to `android/gradle.properties` |

---

## Related documentation

- [Service Manage — root README](../README.md) — backend, seeders, Postman
- [Expo environment variables](https://docs.expo.dev/guides/environment-variables/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
