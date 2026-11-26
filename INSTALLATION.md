# Installation Guide

## Prerequisites

- Node.js 18.18+ (Node 20 LTS recommended)
- npm 9+ (or pnpm/yarn if you prefer — adjust commands accordingly)
- A free [Supabase](https://supabase.com) account
- Git

---

## 1. Clone / extract the project

```bash
cd smart-office
npm install
```

## 2. Create a Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**.
2. Choose a name (e.g. `smart-office`), a strong database password, and a region close to your users.
3. Wait for provisioning to finish (~2 minutes).

## 3. Run the database migrations

You can do this either via the SQL Editor (fastest for getting started) or the Supabase CLI (recommended for teams).

### Option A — SQL Editor (quickest)

1. Open your project → **SQL Editor** → **New query**.
2. Copy the contents of each file in `supabase/migrations/` **in order** and run them one at a time:
   - `0001_initial_schema.sql`
   - `0002_row_level_security.sql`
   - `0003_storage.sql`
   - `0004_seed_rooms.sql`
   - `0005_secure_roles.sql`  (ปิดช่องโหว่ยกระดับสิทธิ์ — ห้ามข้าม)
   (หรือรันไฟล์เดียว `supabase/all-in-one.sql` ที่รวมไว้ให้แล้ว)

### Option B — Supabase CLI

```bash
npm install -g supabase
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
```

## 4. Get your API credentials

In your Supabase project → **Settings → API**, copy:

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret — server-side only)

## 5. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 6. Configure Supabase Auth redirect URLs

In **Authentication → URL Configuration**:

- **Site URL:** `http://localhost:3000`
- **Redirect URLs:** add `http://localhost:3000/auth/callback` and `http://localhost:3000/reset-password`

(When you deploy, add your production URLs here too — see `DEPLOYMENT.md`.)

## 7. Seed demo data (optional but recommended)

The seed script creates demo accounts and sample data using the service role key, bypassing RLS and email confirmation.

```bash
npm run seed
```

This creates:
- 1 admin + 3 employee accounts (see credentials in `README.md`)
- Sample repair requests, equipment requests, borrow records, and room bookings

> If you skip seeding, you can still register a new account through the UI —
> it will be created with the `employee` role by default. To make yourself an
> admin, run this in the SQL Editor:
> ```sql
> update public.users set role = 'admin' where email = 'you@example.com';
> ```

## 8. Run the app

```bash
npm run dev
```

Visit **http://localhost:3000** — you should be redirected to `/login`.

## 9. Verify everything works

- [ ] Log in with a seeded account (or register a new one)
- [ ] Create a maintenance request with a photo upload
- [ ] As admin, change its status and confirm the employee sees a notification
- [ ] Submit and approve/reject an equipment request
- [ ] Borrow an IT asset and mark it returned
- [ ] Book a meeting room, then try to double-book the same slot (should be blocked)
- [ ] Check the admin dashboard charts render with data

## Troubleshooting

| Problem | Fix |
|---|---|
| `Invalid API key` on login | Double-check `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`, restart `npm run dev` |
| New sign-ups don't get a profile row | Confirm `0001_initial_schema.sql` ran fully (the `handle_new_user` trigger must exist) |
| "row-level security policy" errors | Confirm `0002_row_level_security.sql` ran; check you're querying as an authenticated user |
| Image upload fails | Confirm `0003_storage.sql` ran and the `maintenance-images` bucket exists and is public |
| Overdue assets not flagged | The `mark_overdue_assets()` function runs automatically when the IT Borrowing page loads; for production, also schedule it via `pg_cron` or a scheduled Edge Function |
