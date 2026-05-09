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
  Service-Manage.postman_collection.json   # API collection (import into Postman)
  Local.postman_environment.json           # example environment vars
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

Authenticated admin HTTP routes are composed in `backend/src/routes/admin/index.js` (one file per area under `routes/admin/*.routes.js`). Public, customer, and service-provider routes live alongside under `backend/src/routes/`.

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

Import `postman/Service-Manage.postman_collection.json` and optionally `postman/Local.postman_environment.json`. Open the **collection** description (or folder descriptions under Customer / Service provider) for **mobile app auth, booking lifecycle, cookies, and Socket.IO** notes. **Admin (authenticated)** requests are grouped into folders (dashboard, bookings, geography, etc.) for easier navigation. Keep the collection in sync with the code when you add or change APIs.

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

- Customer-facing booking flow (service selection, scheduling) and account area (`/user/...`)
- Service-provider APIs for assigned bookings (start job, completion with customer OTP, etc.)
- Admin booking list and detail (includes chat history where applicable)
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
- New admin endpoints: add a route file under `backend/src/routes/admin/` and register it in `backend/src/routes/admin/index.js`; mirror calls in the Postman collection when useful for QA
