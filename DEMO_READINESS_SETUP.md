# Demo Readiness Setup

Use this lightweight setup for client demos without changing core RLS architecture.

## 1) Required env vars

Add these values to `.env`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_DEMO_ADMIN_EMAIL`
- `NEXT_PUBLIC_DEMO_ADMIN_PASSWORD`
- `NEXT_PUBLIC_DEMO_USER_EMAIL`
- `NEXT_PUBLIC_DEMO_USER_PASSWORD`
- `DEMO_ADMIN_USER_ID` (Supabase Auth user UUID for demo admin)
- `DEMO_OPERATOR_USER_ID` (Supabase Auth user UUID for demo operator)

## 2) Create demo auth users

Create two users in Supabase Auth:

- Admin demo account (email should match `NEXT_PUBLIC_DEMO_ADMIN_EMAIL`)
- Operator demo account (email should match `NEXT_PUBLIC_DEMO_USER_EMAIL`)

Ensure their metadata/role matches your current app setup (`admin` and `operator`).

## 3) Seed demo data

Run:

`node scripts/migrate-simple.js`

This seeds venues, bookings, parking areas, and roads. It uses upsert by `id` so reruns are safe.

## 4) Use quick login buttons

Start app and open login page:

`npm run dev`

Use:

- `Login as Admin`
- `Login as User`

These buttons use the same normal Supabase login flow with your demo credentials from env vars.

## 5) Smoke test checklist

- Admin can view seeded bookings with mixed statuses.
- User can view bookings and create a new booking.
- Booking list/detail show readable date and time labels.
- Confirm/deny/cancel/delete actions show accurate success/error feedback.
