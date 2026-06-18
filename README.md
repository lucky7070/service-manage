# Serva Services — Service Manage

Home services platform (**Serva Services**): Next.js marketing site + admin panel, Express + MongoDB API, and React Native customer app. Covers public marketing pages, customer and service-provider accounts, booking lifecycle, and admin (permissions, settings, master data, CMS).

| App | Folder | Default URL |
|-----|--------|-------------|
| API + admin backend | [`backend/`](backend/) | `http://localhost:5000` |
| Web (customer + admin UI) | [`frontend/`](frontend/) | `http://localhost:3000` |
| Customer mobile app | [`customer_app/`](customer_app/) | Expo — see [`customer_app/README.md`](customer_app/README.md) |

## Tech Stack

- Frontend: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4
- Frontend libs: Redux Toolkit, Axios, Formik, Yup, React Select, SweetAlert2, React Toastify, Moment
- Backend: Node.js, Express, Mongoose, Express Validator, Multer, Socket.io (booking room chat / typing)
- Database: MongoDB
- Auth: JWT + httpOnly cookies for **web** (admin, customer site, provider portal); **Bearer token** for the React Native customer app (`customer_app/`)

## Auth & cookies

| Client | Session | Backend detection |
|--------|---------|-------------------|
| Admin panel (Next.js) | `admin_token` cookie | Browser — cookies set on login |
| Customer website | `customer_token` cookie | Browser — cookies set on login |
| Service provider portal | `service-provider-token` cookie | Browser |
| **Customer mobile app** | Bearer JWT in SecureStore | `X-Client-Platform: mobile` or `registerFrom: "mobile"` — **no cookies** |

Protected customer routes accept `Authorization: Bearer <token>` **or** `customer_token` cookie (`extractCustomerToken` in `backend/src/helpers/authToken.js`).

**Backend env** (`backend/.env.example`):

- `CROSS_ORIGIN_COOKIES` + `COOKIE_DOMAIN` — when web frontend and API are on different domains (requires HTTPS, `SameSite=None`).
See [`customer_app/README.md`](customer_app/README.md) for mobile env and build setup.

## Project Structure

```text
postman/
  Service-Manage.postman_collection.json   # Generated — run `node postman/generate-postman-collection.mjs`
  Local.postman_environment.json           # example environment vars (baseUrl, xApiKey)
  generate-postman-collection.mjs           # Source of truth for requests + descriptions
backend/
  scripts/
    seed.mjs          # CLI entry (npm run seed)
  src/
    controller/
    config/
    helpers/
    libraries/
    middlewares/
    models/
    routes/
      admin/         # modular admin routers (dashboard, bookings, geography, etc.)
      ...
    seeders/
      databaseSeeder.js       # SEEDER_REGISTRY orchestrator
      settings.seeder.js      # Serva branding + app config defaults
      serviceCategory.seeder.js
      serviceType.seeder.js
      indiaLocation.seeder.js
      ourMilestone.seeder.js
      ourValue.seeder.js
      faq.seeder.js
      predefinedRatingTag.seeder.js
      cmsPage.seeder.js           # Privacy, terms, cookies, our story
      defaultAdmin.seeder.js
    socket/          # Socket.io booking rooms (join/leave, messages, typing)
frontend/
  src/
    app/
    components/
    helpers/
    store/
```

Authenticated admin HTTP routes are composed in `backend/src/routes/admin/index.js` (one file per area under `routes/admin/*.routes.js`). Public routes are mounted from `backend/src/routes/open.routes.js` at the API root. Customer routes: `backend/src/routes/customer.routes.js`; service-provider: `backend/src/routes/service-provider.routes.js`.

**Keeping Postman accurate:** edit `postman/generate-postman-collection.mjs` (arrays `open`, `customer`, `serviceProvider`, `admin`, etc.), then regenerate:

```bash
node postman/generate-postman-collection.mjs
```

This overwrites `postman/Service-Manage.postman_collection.json` — do not hand-edit that file if you rely on the script.

## First-time setup (local)

1. **MongoDB** — running locally or Atlas; set `MONGO_URI` in `backend/.env` (copy from `backend/.env.example`).
2. **Backend** — `cd backend && npm install && npm run dev`
3. **Seed base data** (from `backend/`):

   ```bash
   npm run seed
   ```

   This loads default admin, **Serva Services** settings, India locations, service categories/types, FAQs, about-page content, and rating tags. Safe to re-run (upserts by key fields).
4. **Frontend** — `cd frontend && npm install && npm run dev`
5. **Admin login** — `admin@admin.com` / `123456789` (change after first login in production).
6. **Mobile app** (optional) — see [`customer_app/README.md`](customer_app/README.md); seed the backend before testing categories, settings, or CMS pages.

Replace placeholder secrets in admin **Settings** (SMTP, Razorpay, SMS API key) and upload logo/favicon under `/application/`.

## Run Locally

### Backend

```bash
cd backend
npm install
npm run dev
```

Backend default: `http://localhost:5000`

### Database seeders (CLI)

Seed scripts live under `backend/src/seeders/` and are orchestrated by `backend/src/seeders/databaseSeeder.js` (same idea as Laravel’s `DatabaseSeeder`). **Run seeding only via the CLI** from a developer machine or deployment pipeline—there are no admin HTTP endpoints for seeding.

From `backend/`:

```bash
npm run seed                                    # run all registered seeders in order
npm run seed -- settings                        # only settings
npm run seed -- serviceCategories serviceTypes  # multiple by name
npm run seed -- --only=ourValues,faqs           # comma-separated via --only=
```

**Registered seeder names** (see `SEEDER_REGISTRY` in `databaseSeeder.js`):

| Seeder | Source file | What it loads |
|--------|-------------|---------------|
| `defaultAdmin` | `defaultAdmin.seeder.js` | Super Admin role + default admin account |
| `settings` | `settings.seeder.js` | Branding, contact, SMTP, Razorpay, SMS, customer/pro app version & store URLs |
| `location` | `indiaLocation.seeder.js` | India country, states, cities |
| `serviceCategories` | `serviceCategory.seeder.js` | 10 trade categories from `SEED_CATEGORIES` (slug, name, image, description) |
| `serviceTypes` | `serviceType.seeder.js` | Service types from each category’s nested `services[]` in `SEED_CATEGORIES` |
| `ourMilestones` | `ourMilestone.seeder.js` | About page timeline (`SEED_OUR_MILESTONES`) |
| `ourValues` | `ourValue.seeder.js` | About page values with icon paths (`SEED_OUR_VALUES`) |
| `faqs` | `faq.seeder.js` | FAQ questions and answers (`SEED_FAQS`) |
| `predefinedRatingTags` | `predefinedRatingTag.seeder.js` | Quick feedback tags for customer ↔ provider ratings |
| `subscriptions` | `subscription.seeder.js` | Provider plans (weekly, monthly, yearly) |
| `cmsPages` | `cmsPage.seeder.js` | CMS pages: `privacy-policy`, `terms-and-conditions`, `cookies`, `our-story` (`data/cmsPages.seed.json`) |

All seeders are **idempotent** (upsert by stable keys such as `setting_name`, category `slug`, FAQ `question`, or `tagFor` + `tagName`). Re-running updates existing rows with the latest seed file values.

#### Default settings (`settings` seeder)

Branding defaults to **Serva Services** (`application_name`, tagline, copyright). Contact: `info@serva.technolite.in`, phone `9602570577`, Jodhpur office address. Customer app settings (type 6) use version `1.0.0`, Play Store `com.serva.services`, force-update off by default. SMTP/Razorpay/SMS keys use `change_me_*` placeholders — configure in admin or `.env` before production.

Category images in seed data use paths like `/service-categories/plumber.png` (upload matching files to `backend/uploads/` or replace via admin).

### Default admin seeder values

`defaultAdmin` seeder creates a Super Admin account (if it doesn't already exist by email/mobile):

```json
{
  "name": "Super Admin",
  "email": "admin@admin.com",
  "mobile": "9876543210",
  "password": "123456789"
}
```

Run only this seeder:

```bash
cd backend
npm run seed -- defaultAdmin
```

**Production:** the CLI refuses to run when `NODE_ENV=production` unless you set `ALLOW_DB_SEED=true` (intended for controlled one-off or staging deploys, not casual live DB writes).

**Adding a new seeder:** create `backend/src/seeders/<name>.seeder.js` exporting an async `seed<Name>()` function, then append an entry to `SEEDER_REGISTRY` in `databaseSeeder.js` in the correct dependency order.

Requirements: `.env` with a valid `MONGO_URI`, same as `npm run dev`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend default: `http://localhost:3000`

## Postman

Import `postman/Service-Manage.postman_collection.json` and optionally `postman/Local.postman_environment.json`. Set **`xApiKey`** to match backend **`X_API_KEY`**, and enable the cookie jar for customer / provider / admin sessions.

The collection documents **cookies**, **`x-api-key`**, booking and **service-lead** flows, **featured providers**, **provider self-service** (`/service-provider/services`), profile image upload for customers, and **Socket.IO** usage in the root description plus per-folder notes. Admin routes are grouped (dashboard & bookings, **service leads**, geography, CMS, …).

After API changes, update **`postman/generate-postman-collection.mjs`** and run:

```bash
node postman/generate-postman-collection.mjs
```

## Current Implemented Modules

### Admin Access and Profile

- Admin login flow and protected admin routes
- Admin profile fetch and update
- Admin profile image upload
- Admin-specific permissions support

### Role and Sub Admin Management

- Role CRUD
- Role permission assignment
- Sub Admin CRUD
- Sub Admin permission assignment
- Permission-based UI rendering (`PermissionBlock`)

### App Settings

- Settings model and APIs
- Settings update from admin panel (Formik + Yup on frontend, Express Validator on backend)
- Dynamic branding usage in admin UI and login UI (logo, app name, footer text)

### Location Management

- Country CRUD
- State CRUD (country linked)
- City CRUD (country + state linked)
- Async searchable selects for relational fields using `react-select/async`

### Dashboard

- Dedicated dashboard stats API (single call)
- Count cards for:
  - Roles
  - Sub Admins
  - Countries
  - States
  - Cities
- Clickable cards with permission-based visibility

### Bookings, customers, and service providers

- Customer-facing **bookings** and **service leads** (“open request” flows — admin assigns a provider), account area (`/user/...`)
- **`POST /customer/service-leads`** + **`GET /customer/service-leads`**; **`PUT /customer/profile`** and **`PUT /customer/profile/image`**
- **Public** **`GET /featured-service-providers`** — homepage grid; admins set **`isFeatured`** on a service provider (`POST`/`PUT /admin/service-providers` multipart field)
- **`GET /service-types-by-category/:categorySlug`** — list active service types for a category slug (booking / lead UIs)
- Service-provider bookings (quote, geofenced **start**, completion OTP, cancel) plus **self-service catalogue**: **`GET/POST/PUT/DELETE /service-provider/services`** (and **`GET /service-provider/service-types`** to search types in their category)
- Admin booking list and detail (includes chat history where applicable); **service leads**: list, detail, assign provider (**creates booking** `price_pending`), cancel open leads
- Post-service feedback: star ratings and quick tags on booking detail payloads (customer ↔ provider)

### CMS and marketing content (admin)

- FAQs, banners, enquiries, testimonials, CMS pages, “our values” / milestones, and related CRUD in admin
- **Base CMS data** (FAQs, our values, milestones, rating tags) ships in seeders — run `npm run seed` on a fresh DB or `npm run seed -- faqs ourValues ourMilestones predefinedRatingTags` to refresh

### Route Guarding

- Admin route auth checks using Next.js `proxy` convention
- Centralized route permission map for direct URL access control
- Unauthorized state UI for blocked routes

## Key Admin API Endpoints

### Profile

- `GET /api/admin/profile`
- `PUT /api/admin/profile`
- `PUT /api/admin/profile/image`
- `POST /api/admin/logout`

### Dashboard

- `GET /api/admin/dashboard-stats`

### Bookings

- `GET /api/admin/bookings`
- `GET /api/admin/bookings/:id`

### Service leads (admin)

Open customer requests filed via **`POST /api/customer/service-leads`**; assignment creates a **`Booking`** in **`price_pending`** when the chosen provider meets city, category, and service-type coverage.

- `GET /api/admin/service-leads`
- `GET /api/admin/service-leads/:id`
- `PUT /api/admin/service-leads/:id/assign` (body: `providerId`)
- `PUT /api/admin/service-leads/:id/cancel` (only while status is **`open`**)

### Public (no auth cookie; `x-api-key` required)

- `GET /api/featured-service-providers` — **`isFeatured`**, approved, verified, active providers (homepage / marketing)
- `GET /api/service-types-by-category/:categorySlug` — service types for search and lead/booking flows

### Roles

- `GET /api/admin/roles`
- `GET /api/admin/roles/:id`
- `POST /api/admin/roles`
- `PUT /api/admin/roles/:id`
- `DELETE /api/admin/roles/:id`
- `PUT /api/admin/roles/:id/permissions`

### Sub Admins

- `GET /api/admin/admins`
- `GET /api/admin/admins/:id`
- `POST /api/admin/admins`
- `PUT /api/admin/admins/:id`
- `DELETE /api/admin/admins/:id`
- `PUT /api/admin/admins/:id/permissions`

### Settings

- `GET /api/admin/settings`
- `GET /api/admin/settings/:type`
- `PUT /api/admin/settings/:type`
- `GET /api/general-settings` (public/general use)

### Location

- Countries:
  - `GET /api/admin/countries`
  - `GET /api/admin/countries/:id`
  - `POST /api/admin/countries`
  - `PUT /api/admin/countries/:id`
  - `DELETE /api/admin/countries/:id`
- States:
  - `GET /api/admin/states`
  - `GET /api/admin/states/:id`
  - `POST /api/admin/states`
  - `PUT /api/admin/states/:id`
  - `DELETE /api/admin/states/:id`
- Cities:
  - `GET /api/admin/cities`
  - `GET /api/admin/cities/:id`
  - `POST /api/admin/cities`
  - `PUT /api/admin/cities/:id`
  - `DELETE /api/admin/cities/:id`

## Development Conventions

- Forms: Formik + Yup
- Backend request validation: Express Validator
- Soft-delete pattern with `deletedAt`
- Date formatting uses `moment`
- Central model exports from `backend/src/models/index.js`
- Permission-aware UI and route-level protection in admin module
- New admin endpoints: add a route file under `backend/src/routes/admin/` and register it in `backend/src/routes/admin/index.js`; add matching entries to **`postman/generate-postman-collection.mjs`** and run **`node postman/generate-postman-collection.mjs`**
