# Smart Office Management System

An enterprise office management platform built with **Next.js 15 (App Router)**,
**TypeScript**, **Tailwind CSS**, **Shadcn UI**, and **Supabase** (PostgreSQL,
Auth, Storage). Employees can submit maintenance requests, request equipment,
borrow IT assets, and book meeting rooms; admins get a full oversight
dashboard with approval workflows and analytics.

![Primary](https://img.shields.io/badge/primary-%23FF6B00-FF6B00) ![Secondary](https://img.shields.io/badge/secondary-%23121212-121212)

---

## Features

| Module | Employee | Admin |
|---|---|---|
| **Auth** | Login, register, forgot/reset password, profile | Everything employees have + full data access |
| **Maintenance Requests** | Create, upload photo, add location/description, view own requests | View all, filter, change status (Pending → In Progress → Completed) |
| **Equipment Requests** | Request items with quantity + reason, view own requests | View all, Approve / Reject |
| **IT Borrowing** | Borrow Laptop/Mouse/Keyboard/Monitor/Projector, mark returned | View all, auto-flagged Overdue assets |
| **Meeting Rooms** | Book Room A/B/C with conflict prevention, cancel own bookings | View + cancel any booking |
| **Dashboard** | Personal stats + recent activity | Org-wide stats, monthly repairs chart, equipment status pie chart, room usage chart |
| **Notifications** | Real-time-style in-app notifications for all the above | Same, plus receives "new repair request" alerts |

## Tech Stack

- **Frontend:** Next.js 15 (App Router, Server Components + Server Actions), TypeScript, Tailwind CSS, Shadcn UI (Radix primitives), Recharts, Sonner (toasts)
- **Backend:** Next.js Server Actions (no separate API layer needed)
- **Database:** PostgreSQL via Supabase, with Row Level Security on every table
- **Auth:** Supabase Auth (email/password), with a Postgres trigger that auto-creates a `public.users` profile row on sign-up
- **Storage:** Supabase Storage for maintenance request photos and avatars
- **Deployment:** Vercel

## Project Structure

```
smart-office/
├── app/
│   ├── (auth)/                # Public auth pages (login, register, forgot/reset password)
│   ├── (app)/                 # Authenticated app shell (sidebar + topbar)
│   │   ├── dashboard/         # Employee dashboard + /admin sub-route
│   │   ├── maintenance/       # Module 2
│   │   ├── equipment/         # Module 3
│   │   ├── it-borrowing/      # Module 4
│   │   ├── meeting-rooms/     # Module 5
│   │   ├── notifications/     # Module 7
│   │   └── profile/
│   ├── auth/callback/         # Supabase email confirmation callback
│   ├── layout.tsx / page.tsx / error.tsx / not-found.tsx
│   └── globals.css
├── actions/                   # Server Actions (one file per module)
├── components/
│   ├── ui/                    # Shadcn primitives
│   ├── layout/                # Sidebar, topbar, page header, empty state
│   └── <module>/               # Module-specific client components
├── lib/
│   ├── supabase/               # client.ts, server.ts, middleware.ts
│   ├── validations/schemas.ts # Zod schemas
│   ├── auth.ts                # getCurrentUser / requireUser / requireAdmin
│   └── utils.ts
├── types/database.ts          # Hand-written Supabase types
├── supabase/
│   ├── migrations/             # 4 SQL migration files, run in order
│   └── seed/seed.ts            # Dummy data seed script
└── middleware.ts               # Route protection + session refresh
```

## Quick Start

See **[INSTALLATION.md](./INSTALLATION.md)** for full setup steps, and
**[DEPLOYMENT.md](./DEPLOYMENT.md)** for deploying to Vercel.

```bash
npm install
cp .env.example .env.local   # fill in your Supabase credentials
npm run dev
```

## Demo Accounts (after seeding)

| Role | Email | Password |
|---|---|---|
| Admin | admin@smartoffice.com | Admin123! |
| Employee | employee1@smartoffice.com | Employee123! |
| Employee | employee2@smartoffice.com | Employee123! |
| Employee | employee3@smartoffice.com | Employee123! |

## Security Notes

- Every table has **Row Level Security** enabled. Employees can only see/modify their own rows; admins bypass via an `is_admin()` policy helper.
- The Supabase **service role key** is only used server-side (seed script, `createAdminClient()`) and is never exposed to the browser.
- Passwords are handled entirely by Supabase Auth — the app never stores or sees plaintext passwords beyond the initial form submission over HTTPS.
- Booking conflicts are enforced **twice**: once in the server action (fast feedback) and once in a Postgres trigger (`check_booking_conflict`) so concurrent requests can never double-book a room.
