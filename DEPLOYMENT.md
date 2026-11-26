# Deployment Guide (Vercel)

## Prerequisites

- A GitHub (or GitLab/Bitbucket) repository containing this project
- A [Vercel](https://vercel.com) account
- A production-ready Supabase project (can be the same one used for development, or a separate prod project)

---

## 1. Push the project to Git

```bash
git init
git add .
git commit -m "Initial commit: Smart Office Management System"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

## 2. Import into Vercel

1. Go to [vercel.com/new](https://vercel.com/new).
2. Import your Git repository.
3. Framework preset: **Next.js** (auto-detected).
4. Leave build settings as default:
   - Build command: `next build`
   - Output directory: `.next`
   - Install command: `npm install`

## 3. Add environment variables

In the Vercel project → **Settings → Environment Variables**, add (for both
**Production** and **Preview** environments):

| Key | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key (mark as **Sensitive**) |
| `NEXT_PUBLIC_SITE_URL` | Your production URL, e.g. `https://smart-office.vercel.app` |

## 4. Deploy

Click **Deploy**. Vercel will build and deploy automatically. Subsequent
pushes to `main` will trigger new production deployments; other branches get
preview deployments.

## 5. Update Supabase Auth settings for production

In your Supabase project → **Authentication → URL Configuration**:

- **Site URL:** `https://your-app.vercel.app`
- **Redirect URLs:** add:
  - `https://your-app.vercel.app/auth/callback`
  - `https://your-app.vercel.app/reset-password`
  - (keep the `localhost:3000` ones too if you still develop locally)

## 6. Run migrations against production

If you used a separate Supabase project for production, repeat the steps in
`INSTALLATION.md` (sections 3–4) against that project before or right after
your first deploy.

## 7. (Recommended) Schedule the overdue-asset check

The app already re-checks overdue assets whenever the IT Borrowing page
loads, but for a production system you should also run it on a schedule so
notifications and dashboard counts stay accurate even without page visits.

**Option A — pg_cron (inside Supabase SQL Editor):**

```sql
select cron.schedule(
  'mark-overdue-assets-daily',
  '0 1 * * *', -- every day at 01:00 UTC
  $$ select public.mark_overdue_assets(); $$
);
```

**Option B — Vercel Cron + a Route Handler**

Create `app/api/cron/overdue/route.ts` that calls
`supabase.rpc('mark_overdue_assets')` using the service role client, then add
to `vercel.json`:

```json
{
  "crons": [{ "path": "/api/cron/overdue", "schedule": "0 1 * * *" }]
}
```

Protect the route with a shared secret header checked against a
`CRON_SECRET` environment variable.

## 8. Custom domain (optional)

Vercel → **Settings → Domains** → add your domain and follow the DNS
instructions. Remember to update `NEXT_PUBLIC_SITE_URL` and your Supabase
redirect URLs to match the final domain.

## Post-deploy checklist

- [ ] Can register + confirm email + log in on the production URL
- [ ] Password reset email link redirects correctly
- [ ] Image upload works (check the Supabase Storage bucket CORS/public settings)
- [ ] Admin dashboard loads with real data
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is marked **Sensitive** in Vercel and never appears in client bundles (it's only referenced in `lib/supabase/server.ts` and the seed script, both server-only)
