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
- [Google Play Store (AAB)](#google-play-store-aab)
- [Play Store updates without EAS cloud](#play-store-updates-without-eas-cloud)
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

Use **Option A (local APK)** to build a release APK on your PC with live URLs from `.env.production`, then share the file with testers (Drive, WhatsApp, email). No Expo cloud upload required.

### Option A — Local release APK (recommended for sharing with users)

Build on your machine. Reads `.env.production` from disk. Best for sharing with a small group of testers.

#### Before you build

1. **Create `.env.production`** (copy from `.env.example`) with your **live HTTPS URLs** and API key:

```env
EXPO_PUBLIC_APP_ENV=production
EXPO_PUBLIC_API_URL=https://serva-server.technolite.in/api
EXPO_PUBLIC_UPLOAD_URL=https://serva-server.technolite.in/uploads
EXPO_PUBLIC_SOCKET_URL=https://serva-server.technolite.in
EXPO_PUBLIC_WEB_URL=https://serva.technolite.in
EXPO_PUBLIC_API_LICENCE=your-production-x-api-key
EXPO_PUBLIC_LOG_ERRORS_IN_CONSOLE=false
```

- Do **not** put spaces around `=` — use `KEY=value`.
- `EXPO_PUBLIC_API_LICENCE` must match backend `X_API_KEY`.
- Confirm the backend is reachable at your API URL before building.

2. **Add `google-services.json`** (required for push notifications in release builds):

   - Firebase Console → project **home-serve-customer** → Android app `com.serva.users`
   - Download `google-services.json` → save as `customer_app/google-services.json`
   - See [Push notifications (FCM)](#push-notifications-fcm)

3. **Install build tools** (one-time):

   - **Node.js 20+** and `npm install` in `customer_app`
   - **Android Studio** (SDK + platform tools)
   - **JDK 17**

   Windows environment variables (adjust paths to your machine):

```powershell
setx JAVA_HOME "C:\Program Files\Java\jdk-17"
setx ANDROID_HOME "C:\Users\<you>\AppData\Local\Android\Sdk"
```

   Add `%ANDROID_HOME%\platform-tools` to `PATH`, then **restart the terminal**.

   Verify:

```powershell
java -version
adb version
```

#### Step 1 — Test live URLs before building (optional)

```powershell
cd customer_app
npm run start:prod
```

In another terminal, run on a device:

```powershell
npm run android:prod
```

Confirm login and API calls work against production URLs.

#### Step 2 — Generate native Android project

Regenerates `android/` with production env (`NODE_ENV=production`):

```powershell
cd customer_app
npm run prebuild:prod
```

Run this again if you change plugins, `app.config.js`, or `google-services.json`.

#### Step 3 — Build the release APK

```powershell
npm run apk:local
```

This runs Gradle `assembleRelease` with production env variables baked in.

#### Step 4 — Locate the APK

```text
customer_app/android/app/build/outputs/apk/release/app-release.apk
```

#### Step 5 — Share with users

1. Upload `app-release.apk` to Google Drive, WhatsApp, or email.
2. On the phone: enable **Install unknown apps** for the app used to open the file (Chrome, Files, Drive, etc.).
3. Open the APK and install.

> **Note:** The default local release build uses the debug keystore — fine for internal testing. For Google Play, configure a release keystore in `android/app/build.gradle` and store credentials securely.

#### Option A — Quick command summary

```powershell
cd customer_app
npm install
# Edit .env.production + add google-services.json first
npm run prebuild:prod
npm run apk:local
# Share: android/app/build/outputs/apk/release/app-release.apk
```

#### Option A — Common issues

| Problem | Fix |
|---------|-----|
| App still hits LAN / localhost in release | Fix `.env.production` (no spaces around `=`); re-run `prebuild:prod` and `apk:local` |
| API 403 | Match `EXPO_PUBLIC_API_LICENCE` to backend `X_API_KEY` |
| Push not working | Add correct `google-services.json`, re-run `prebuild:prod` + `apk:local`, user re-login |
| `JAVA_HOME` not set | Install JDK 17, set env var, reopen terminal |
| Gradle / SDK errors | Open Android Studio once to install SDK; confirm `ANDROID_HOME` |
| Cleartext HTTP blocked | Expected in production — use HTTPS URLs only in `.env.production` |

---

### Option B — EAS Build (cloud)

Use when you do **not** want Android Studio / Gradle on your PC. Requires [EAS CLI](https://docs.expo.dev/build/setup/) (`eas-cli` is in `devDependencies`) and an Expo account.

```powershell
cd customer_app
npx eas login
npm run apk:preview      # internal test APK (production env)
npm run aab:production   # Play Store AAB (production env)
```

**Important:** `.env.production` is **not uploaded** (see `.easignore`). Set all `EXPO_PUBLIC_*` variables in the [EAS project environment](https://docs.expo.dev/eas/environment-variables/) for the `production` environment. Upload `google-services.json` via EAS file secrets if you need push in cloud builds.

Profiles in `eas.json`:

| Profile | Output | Env |
|---------|--------|-----|
| `development` | Dev client APK | `EXPO_PUBLIC_APP_ENV=development` |
| `preview` | Internal APK | `EXPO_PUBLIC_APP_ENV=production` |
| `production` | **Play Store AAB** | `EXPO_PUBLIC_APP_ENV=production` |

The project includes `.easignore` to exclude `node_modules/`, local `android/`, and monorepo folders from the upload (EAS archive limit is 2 GB).

---

## Play Store updates without EAS cloud

If your **first** AAB was uploaded via EAS, you can build all **future updates locally**. You do not need EAS cloud, an Expo account, or `eas build` for each release.

You **must** keep using the **same upload keystore** EAS created — Google Play rejects updates signed with a different key.

### One-time setup (export keystore from EAS)

1. Download the keystore (while you still have Expo access):

```powershell
cd customer_app
npx eas login
npx eas credentials
```

Choose **Android** → **production** → **Keystore** → **Download**.

2. Save the file as:

```text
customer_app/android/app/serva-upload.keystore
```

3. Copy signing properties into `android/gradle.properties` (see `android/gradle.properties.release.example`):

```properties
SERVA_UPLOAD_STORE_FILE=serva-upload.keystore
SERVA_UPLOAD_KEY_ALIAS=<alias from EAS>
SERVA_UPLOAD_STORE_PASSWORD=<password from EAS>
SERVA_UPLOAD_KEY_PASSWORD=<key password from EAS>
```

4. **Back up** the keystore + passwords somewhere safe (password manager, encrypted backup). If you lose them, you cannot publish updates to the same Play listing.

`android/app/build.gradle` is already configured to use these properties for release builds.

### Every Play Store update (local workflow)

1. Update `.env.production` (live URLs / API key).
2. Bump version in `app.json`:
   - `expo.version` → e.g. `1.0.1`
   - `expo.android.versionCode` → must increase (e.g. `2`, `3`, …)
3. Rebuild native project **only if** you changed plugins, `app.json`, or `google-services.json`:

```powershell
npm run prebuild:prod
```

After `prebuild --clean`, re-copy the four `SERVA_UPLOAD_*` lines into `android/gradle.properties` (prebuild can reset that file).

4. Build the signed AAB:

```powershell
npm run aab:local
```

5. Upload to [Google Play Console](https://play.google.com/console):

```text
android/app/build/outputs/bundle/release/app-release.aab
```

Release → Production (or Internal testing) → Create release → upload AAB → roll out.

### What you still use Expo for (locally only)

| Tool | Still needed? | Purpose |
|------|----------------|---------|
| **EAS cloud** (`eas build`) | No | Optional |
| **Expo SDK** (npm packages) | Yes | Your app code |
| **`expo prebuild`** | Sometimes | Regenerate `android/` after native config changes |
| **Gradle** (`aab:local`) | Yes | Produces the Play Store AAB on your PC |

### Google Play App Signing

If you enrolled in **Play App Signing**, Google holds the app signing key. Your EAS/local keystore is the **upload key**. You still must sign every new AAB with that same upload key — exporting it from EAS once is enough.

---

Google Play requires an **Android App Bundle (`.aab`)**, not an APK. Use the **`production`** EAS profile (already set to `buildType: app-bundle`).

### Before each Play upload

1. **Bump version** in `app.json`:
   - `expo.version` — user-visible version (e.g. `1.0.1`)
   - `expo.android.versionCode` — integer, must increase every upload (e.g. `2`, `3`, …)

2. **Set EAS production env vars** (Expo dashboard → project **serva-services** → Environment variables → **production**):

   | Variable | Example |
   |----------|---------|
   | `EXPO_PUBLIC_APP_ENV` | `production` |
   | `EXPO_PUBLIC_API_URL` | `https://serva-server.technolite.in/api` |
   | `EXPO_PUBLIC_UPLOAD_URL` | `https://serva-server.technolite.in/uploads` |
   | `EXPO_PUBLIC_SOCKET_URL` | `https://serva-server.technolite.in` |
   | `EXPO_PUBLIC_WEB_URL` | `https://serva.technolite.in` |
   | `EXPO_PUBLIC_API_LICENCE` | same as backend `X_API_KEY` |
   | `EXPO_PUBLIC_LOG_ERRORS_IN_CONSOLE` | `false` |

3. **`google-services.json`** — add via [EAS file env var](https://docs.expo.dev/eas/environment-variables/#file-environment-variables) if not bundled locally.

### Build AAB (recommended — EAS)

EAS manages the **Play signing keystore** (you already created one on first build).

```powershell
cd customer_app
npx eas login
npm run aab:production
```

When the build finishes, open the link in the terminal (or [expo.dev](https://expo.dev) → **Builds**) and **Download** the `.aab` file.

Submit manually in [Google Play Console](https://play.google.com/console):

1. **Release** → **Production** (or **Internal testing** first)
2. **Create new release** → upload the `.aab`
3. Complete store listing, content rating, privacy policy, etc.
4. **Review and roll out**

Optional — submit from CLI after linking the Play app:

```powershell
npx eas submit -p android --latest
```

### Build AAB locally (alternative)

Requires a **release keystore** configured in `android/` (not the debug keystore). EAS is easier for first Play upload.

```powershell
npm run prebuild:prod
npm run aab:local
```

Output:

```text
android/app/build/outputs/bundle/release/app-release.aab
```

---

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
| `npm run aab:local` | Gradle `bundleRelease` → local AAB |
| `npm run apk:preview` | EAS preview APK (testers) |
| `npm run aab:production` | EAS production **AAB** for Google Play |

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
