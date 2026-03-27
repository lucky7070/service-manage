# Service Provider System (Node + Next + MongoDB)

Starter project for a 3-role service booking platform:

- Admin
- Service Provider
- Customer

## Tech Stack

- Frontend: Next.js (App Router) + Tailwind CSS
- Frontend libs: Redux Toolkit, Formik, Yup, React Toastify, SweetAlert2, Socket.IO client, Moment
- Backend: Node.js + Express + Mongoose
- Backend libs: Socket.IO, Moment
- Database: MongoDB
- Auth: OTP + JWT

## Folder Structure

```text
frontend/
backend/
  src/
    config/
    controller/
    helpers/
    libraries/
    middlewares/
    models/
    routes/
```

## Quick Start

### 1) Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Backend runs on `http://localhost:5000`.

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`.

## Main API Groups

- `POST /api/auth/send-otp`
- `POST /api/auth/verify-otp`
- `GET /api/catalog/categories`
- `GET /api/catalog/service-types`
- `GET /api/catalog/providers`
- `POST /api/bookings`
- `PATCH /api/bookings/:id/provider-quote`
- `PATCH /api/bookings/:id/customer-confirm-price`
- `POST /api/bookings/:id/request-completion-otp`
- `POST /api/bookings/:id/complete`
- `POST /api/chat`
- `GET /api/chat/:bookingId`
- `GET /api/admin/providers/pending`
- `PATCH /api/admin/providers/:id/approve`
- `PATCH /api/admin/providers/:id/reject`

## Important Note

This is a clean starter foundation. For production use, add:

- Real SMS provider integration
- Payment gateway integration
- Socket-based real-time chat
- Rate limiting + security hardening
- Media storage (S3/Cloudinary)
- Comprehensive test coverage

## Conventions Applied

- Date/time calculations and formatting are handled with `moment`.
- All backend models are in separate files under `backend/src/models/`.
- `backend/src/models/index.js` is the single import/export entry point used across the app.
- All frontend forms use `Formik + Yup` validation.
