# Service Manage (Admin Panel + API)

Production-style platform using Next.js (frontend) and Express + MongoDB (backend): public marketing pages, customer and service-provider accounts, booking lifecycle, and a full admin panel (permissions, settings, master data, and content).

## Tech Stack

- Frontend: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4
- Frontend libs: Redux Toolkit, Axios, Formik, Yup, React Select, SweetAlert2, React Toastify, Moment
- Backend: Node.js, Express, Mongoose, Express Validator, Multer, Socket.io (booking room chat / typing)
- Database: MongoDB
- Auth: JWT + cookie-based admin auth; JWT for customer / service-provider APIs as applicable

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
npm run seed -- serviceCategories               # only service category seeder
npm run seed -- serviceCategories serviceTypes  # multiple by name
npm run seed -- --only=settings                 # comma-separated via --only=
```

Registered seeder names: `defaultAdmin`, `settings`, `serviceCategories`, `serviceTypes` (see `SEEDER_REGISTRY` in `databaseSeeder.js`).

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

- FAQs, banners, enquiries, testimonials, CMS pages, “our values” / milestones, and related CRUD where implemented

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
