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
- [Build iOS (App Store / TestFlight / internal)](#build-ios-app-store--testflight--internal)
- [EAS cloud builds](#eas-cloud-builds)
- [Scripts reference](#scripts-reference)
- [Auth flow](#auth-flow)
- [Project structure](#project-structure)
- [Navigation](#navigation)
- [Push notifications (FCM)](#push-notifications-fcm)
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

### iOS development / release

| Goal | What you need |
|------|----------------|
| Local `npm run ios` / Xcode | **macOS** + **Xcode** (not available on Windows) |
| Release / TestFlight / internal IPA | **EAS Build** (works from Windows or macOS) |
| App Store / TestFlight upload | **Apple Developer Program** ($99/year) |
| Push on iOS | Firebase iOS app + `GoogleService-Info.plist` + APNs key in Firebase |

Windows developers: use **EAS cloud builds** for all iOS binaries. You cannot produce a device IPA with Xcode on Windows.

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
| `.env.production` | `NODE_ENV=production`, release APK/AAB, EAS builds | HTTPS URLs, production API key |

For **EAS**, keep `.env.production` on the machine that runs `eas build`. Root `.easignore` uploads that file (other `.env*` files stay excluded). Do not commit it — it is gitignored.

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

Ensure the [backend is running and seeded](../README.md#first-time-setup-local) so categories, settings, and CMS pages are available.

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
2. **Android:** package **`com.serva.services`** → download **`google-services.json`** → save as `customer_app/google-services.json`
3. **iOS:** bundle ID **`com.serva.services`** → download **`GoogleService-Info.plist`** → save as `customer_app/GoogleService-Info.plist`
4. For iOS push: Apple Developer → create an **APNs Auth Key** (`.p8`) → upload it in Firebase → **Cloud Messaging** → Apple app configuration

Push notifications **do not work in Expo Go**. Use a native build (`npm run android`, `npm run ios`, or an EAS IPA/APK).

Both Firebase files are **gitignored** but **included in EAS uploads** when present locally (see root `.easignore`). Without them, the app builds but push will fail on that platform.

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

| Goal | Command | Output | How to install |
|------|---------|--------|----------------|
| Share Android APK | `npm run apk:local` | `app-release.apk` | Sideload on Android |
| **Google Play** | `npm run aab:local` | `app-release.aab` | Play Console |
| iOS internal test IPA | `npm run ios:preview` | EAS IPA (ad hoc) | Register device UDID, then install link |
| **iOS App Store / TestFlight** | `npm run ios:production` | EAS store IPA | **TestFlight** or App Store only |
| Submit iOS to App Store Connect | `npm run ios:submit` | Uploaded build | TestFlight / review |

**Before every release build:**

1. Update `.env.production` with correct live HTTPS URLs + API key  
   - Local Android Gradle: Expo loads this file at build time  
   - EAS: keep `.env.production` on the machine that runs `eas build` (it is uploaded; other `.env*` files are not)
2. Ensure Firebase client files exist for the platforms you ship:
   - Android → `google-services.json`
   - iOS → `GoogleService-Info.plist`
3. Bump version in `app.json`:
   - `expo.version` — e.g. `"1.0.4"` (shown to users on both stores)
   - `expo.android.versionCode` — integer, **must increase** each Play upload
   - `expo.ios.buildNumber` — string, **must increase** each App Store / TestFlight upload (production EAS profile can auto-increment this)

**Regenerate native Android project** when you change plugins, `app.json`, or `google-services.json`:

```powershell
npm run prebuild:prod
```

After `prebuild --clean`, re-add `SERVA_UPLOAD_*` lines to `android/gradle.properties` if they were removed.

> **Windows note:** Local iOS Xcode builds are not supported. Use EAS (`ios:preview` / `ios:production`) for all iOS binaries.

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

## Build iOS (App Store / TestFlight / internal)

iOS release builds run on **Expo EAS** (cloud Mac). Bundle ID: **`com.serva.services`**.

### What every developer should know

1. **Store IPAs cannot be sideloaded.**  
   A production (`distribution: store`) build installed via Files / Drive / link shows:  
   *"This app cannot be installed because its integrity could not be verified."*  
   Install store builds only through **TestFlight** or the **App Store**.

2. **Internal / ad hoc IPAs need the device UDID registered** before the build (or rebuild after registering).

3. **Apple Developer Program** is required for device installs, TestFlight, and App Store.

4. First EAS iOS build: choose **Let EAS manage credentials** when prompted (distribution cert + provisioning profile).

5. Keep `.env.production` and `GoogleService-Info.plist` on the machine that runs `eas build`.

### One-time setup

```powershell
cd customer_app
npx eas login
```

Confirm Apple team access and that App Store Connect has an app with bundle ID `com.serva.services` (create it if missing).

### Option A — TestFlight / App Store (recommended for testers & release)

```powershell
cd customer_app

# 1. Confirm .env.production + GoogleService-Info.plist
# 2. Bump expo.version if shipping a user-visible release
#    (ios.buildNumber auto-increments on the production profile)

npm run ios:production
npm run ios:submit
```

Then in [App Store Connect](https://appstoreconnect.apple.com):

1. Wait until the build finishes processing  
2. **TestFlight** → add internal/external testers → install via the **TestFlight** app on iPhone  
3. For store release: create a version → select the build → submit for review  

### Option B — Internal / ad hoc IPA (direct install, limited devices)

Use when you need a quick install link without TestFlight. Device must be registered.

```powershell
cd customer_app

# Register this iPhone (opens a registration page / QR — one-time per device)
npx eas device:create

# Build after the device is registered (old IPAs do not pick up new UDIDs)
npm run ios:preview
```

Install from the Expo build page link/QR. On the phone:

**Settings → General → VPN & Device Management** → trust the developer certificate if prompted.

### Local iOS dev (macOS only)

```powershell
cd customer_app
npm run ios
```

Requires Xcode, CocoaPods, and a simulator or signed device. On Windows this command is not a substitute for EAS release builds.

### iOS troubleshooting

| Problem | Fix |
|---------|-----|
| *Integrity could not be verified* | You installed a **store** IPA outside TestFlight/App Store, or an **ad hoc** IPA on an unregistered device. Use TestFlight for `ios:production`, or `eas device:create` + rebuild for `ios:preview`. |
| Wrong / empty API URLs in the IPA | Ensure `.env.production` exists locally before `eas build` (root `.easignore` allows it) |
| Push not working on iOS | Add `GoogleService-Info.plist`, APNs key in Firebase, rebuild, user re-login |
| Provisioning / credentials errors | `npx eas credentials` → iOS → let EAS regenerate, or fix Apple team membership |
| Build number rejected by App Store | Increase `expo.ios.buildNumber` in `app.json` (or rely on production `autoIncrement`) |

---

## EAS cloud builds

Cloud builds are **required for iOS on Windows**, and optional for Android (local Gradle is preferred for Play updates).

Requires an Expo account. Profiles live in `eas.json`.

```powershell
cd customer_app
npx eas login

# Android
npm run apk:preview       # internal test APK
npm run aab:production    # Play Store AAB

# iOS
npm run ios:preview       # ad hoc / internal IPA
npm run ios:production    # App Store / TestFlight IPA
npm run ios:submit        # upload last iOS production build to App Store Connect
```

Monorepo note: root `.easignore` excludes `frontend/`, `backend/`, and large folders from the upload. It **allows** `.env.production`, `google-services.json`, and `GoogleService-Info.plist` so EAS can bake production config and FCM.

| Profile | Android | iOS |
|---------|---------|-----|
| `preview` | Internal APK | Ad hoc IPA (`distribution: internal`) |
| `production` | Play AAB | Store IPA (`distribution: store`) + auto-increment `buildNumber` |

For ongoing Play updates after your first upload, **local `aab:local` is simpler** and does not require EAS cloud.

---

### Test production config in Metro (before building)

```powershell
npm run start:prod
```

Loads `.env.production` in dev mode — verify API URLs before `apk:local`, `aab:local`, or any EAS build.

---

## Scripts reference

| Script | When to use | Output |
|--------|-------------|--------|
| `npm install` | First-time setup | Installs dependencies |
| `npm start` | Daily development | Metro (`.env.development`) |
| `npm run start:prod` | Test production URLs in dev | Metro with `.env.production` |
| `npm run android` | Dev on Android device/emulator | Debug build + install |
| `npm run android:prod` | Dev build with prod env | Same, production URLs |
| `npm run ios` | Dev on iOS (macOS + Xcode only) | Debug build + install |
| `npm run prebuild:prod` | Before Android release / after native config change | Regenerates `android/` |
| `npm run apk:local` | Share APK with testers | `android/.../app-release.apk` |
| `npm run aab:local` | **Google Play upload** | `android/.../app-release.aab` |
| `npm run apk:preview` | Optional EAS Android test APK | Download from expo.dev |
| `npm run aab:production` | Optional EAS Play AAB | Download from expo.dev |
| `npm run ios:preview` | Internal / ad hoc iOS IPA (EAS) | Download / install link from expo.dev |
| `npm run ios:production` | **App Store / TestFlight IPA** (EAS) | Download from expo.dev |
| `npm run ios:submit` | Upload iOS production build to App Store Connect | Appears in TestFlight after processing |
| `npm run web` | Limited web preview | Browser |
| `npx tsc --noEmit` | Before commit | TypeScript check |
| `npx eas device:create` | Register an iPhone for ad hoc installs | Device added to Apple portal / EAS |

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

The customer app must use the **same Firebase project** with client configs for package / bundle ID **`com.serva.services`**:

### Android

1. Firebase Console → **Project settings** → **Your apps** → Android `com.serva.services`
2. Download **`google-services.json`** → `customer_app/google-services.json`
3. Rebuild (`npm run prebuild:prod` then `npm run android`, or a release/EAS build)

### iOS

1. Firebase Console → add iOS app with bundle ID **`com.serva.services`** (if missing)
2. Download **`GoogleService-Info.plist`** → `customer_app/GoogleService-Info.plist`
3. Upload an **APNs Auth Key** (`.p8`) from Apple Developer into Firebase Cloud Messaging
4. Rebuild with EAS (`ios:preview` / `ios:production`) or local `npm run ios` on macOS

### After any push config change

1. Install the new build (Expo Go will **not** match the backend sender ID)
2. Log in again so `fcmToken` is saved on the customer profile

**SenderId mismatch** means the stored `fcmToken` was created by a different Firebase project or build (e.g. Expo Go, wrong client file). Fix the config, reinstall, and re-login.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| FCM `SenderId mismatch` | Use Firebase client files for `com.serva.services`, rebuild, re-login |
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
| iOS *integrity could not be verified* | Install store builds via **TestFlight** only; for ad hoc run `eas device:create` then rebuild `ios:preview` |
| iOS push silent / missing | `GoogleService-Info.plist` + APNs key in Firebase, then rebuild and re-login |
| Empty API URL in EAS iOS/Android build | Place `.env.production` in `customer_app/` before `eas build` |

---

## Related documentation

- [Service Manage — root README](../README.md) — backend, seeders, Postman
- [Expo environment variables](https://docs.expo.dev/guides/environment-variables/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [EAS Submit (iOS)](https://docs.expo.dev/submit/ios/)
- [Register devices for internal distribution](https://docs.expo.dev/build/internal-distribution/)
