
## 1. Local development

```bash
npm install
cp .env.example .env.local   # fill in the Supabase + Turnstile values, see below
npm run dev
```

The app runs at http://localhost:3000. The calculator itself works with no
environment variables at all — only auth/save features need Supabase, and
only auth *forms* need Turnstile.

## 2. Supabase setup

1. Create a project at https://supabase.com.
2. In **Project Settings → API**, copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY` (server-only —
     see the security notes below)
3. Run the migration in `supabase/migrations/0001_saved_calculations.sql`
   using the SQL editor in the Supabase dashboard (or `supabase db push` if
   you use the Supabase CLI with this repo's `supabase/` folder).
4. In **Authentication → URL Configuration**, set your Site URL and add
   `<your-site>/auth/callback` to the redirect allow list (and
   `http://localhost:3000/auth/callback` for local dev). Double-check this
   matches your deployed domain exactly — a mismatch here is the most common
   cause of "This page doesn't exist" / `DEPLOYMENT_NOT_FOUND` errors on
   password-reset and confirmation links.
5. To allow accounts to be created without email verification, turn off
   **Confirm email** in **Authentication → Providers → Email**. Password-reset
   emails remain enabled through the reset-password flow.
6. Under **Authentication → Attack Protection**, enable CAPTCHA protection
   and select **Turnstile**, pasting in your Turnstile **Secret Key** (see
   Turnstile setup below). This applies to sign-up, sign-in, and password
   recovery together — if you enable it here, all three forms must send a
   `captchaToken`, or those flows will start failing.

## 3. Email sending (SMTP)

Supabase's default built-in email sending is rate-limited (intended for
testing only, roughly a handful of emails per hour) and will produce
`over_email_send_rate_limit` errors under any real usage. Configure a custom
SMTP provider under **Authentication → Emails → SMTP Settings**:

- **Dedicated transactional provider (recommended for real users)** — e.g.
  Resend, Postmark, SendGrid. Requires verifying a domain you own; free
  shared sending domains (like `resend.dev`) can only deliver to the
  provider account's own email address, not arbitrary recipients.
- **Gmail SMTP (`smtp.gmail.com`, port 587, an App Password as the
  credential)** — works for sending to any recipient without owning a
  domain, useful as a stopgap during development or low-volume personal use.
  Use a dedicated Google account for this rather than a primary personal
  one, keep volume low, and treat it as temporary: Gmail's personal-tier
  limits and abuse detection aren't designed for automated app traffic, and
  triggering them can suspend the sending account. Migrate to a dedicated
  provider with a verified domain before any real launch.

## 4. Turnstile setup (bot/abuse protection)

1. Create a site at https://dash.cloudflare.com/ → **Turnstile**.
2. Add your deployed domain (bare hostname, no protocol, no path) to the
   widget's allowed hostnames — e.g. `your-app.vercel.app`. A mismatched or
   missing hostname here is the cause of Turnstile error `110200`.
3. Copy the **Site Key** → `NEXT_PUBLIC_TURNSTILE_SITE_KEY`.
4. Copy the **Secret Key** → paste directly into Supabase's Attack Protection
   settings (step 6 above). It is never stored in this app's environment
   variables or code.
5. Turnstile widgets are used in `login-form.tsx`, `register-form.tsx`, and
   the `RequestResetForm` half of `reset-password-form.tsx`. Each submit
   button is disabled until its widget resolves, so a request is never sent
   without a token.

## 5. Environment variables

See `.env.example`. In short:

| Variable | Exposed to browser? | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Public key; RLS enforces access, not this key |
| `NEXT_PUBLIC_SITE_URL` | Yes | Used for metadata + email redirect links |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Yes | Public Turnstile site key; safe to embed client-side |
| `SUPABASE_SERVICE_ROLE_KEY` | **No — server only** | Bypasses RLS; only used to delete accounts |

The Turnstile **Secret Key** is not an app environment variable at all — it
lives only in Supabase's dashboard.

Set these in Vercel under **Project Settings → Environment Variables** for
production, using **Config** type (not Secret) for every `NEXT_PUBLIC_*`
value, since those are visible in the browser anyway and Secret-typed values
can't be viewed again later. Never commit `.env.local`.

After adding or changing any environment variable on Vercel, trigger a new
deployment — `NEXT_PUBLIC_*` values are baked in at build time and won't
take effect on an already-built deployment.

## 6. Database schema & RLS

`supabase/migrations/0001_saved_calculations.sql` creates `saved_calculations`
with:

- `user_id` referencing `auth.users`, `on delete cascade` (deleting a user
  removes their saved calculations automatically).
- An index on `(user_id, created_at desc)` for fast dashboard queries.
- Row Level Security **enabled and forced**, with a separate policy per
  operation (`select`, `insert`, `update`, `delete`), each checking
  `auth.uid() = user_id`.
- No grants for the `anon` role at all — guest calculator use never touches
  this table, by design.

## 7. Running tests

```bash
npm test
```

Covers the calculation engine (single/multiple subjects, different unit
weights, decimal grades and units, invalid input, zero units, empty input,
rounding behavior) and a static check that the RLS migration enforces
per-user ownership on every operation. For a full authorization test against
a live database, create two test users against a real Supabase project and
confirm user A's session cannot read/update/delete user B's saved
calculation — the policies in the migration are what make that fail safely.

## 8. Deploying to Vercel

1. Push this repo to GitHub/GitLab/Bitbucket.
2. Import it in Vercel.
3. Add the environment variables from `.env.example` in Vercel's project
   settings (Production, and Preview if you want preview deployments to work
   against a Supabase project too).
4. Confirm your exact assigned domain under **Settings → Domains** and use
   that precise value (watch for typos, e.g. missing hyphens) for
   `NEXT_PUBLIC_SITE_URL`, Supabase's Site URL / Redirect URLs, and the
   Turnstile hostname allow-list — all three must match exactly, or auth
   redirects and/or the Turnstile widget will fail.
5. Add `https://<your-domain>/auth/callback` to Supabase's redirect allow
   list.
6. Deploy, then redeploy once after confirming all environment variables are
   set, since they only take effect on a build that runs after they're added.

## 9. Production security checklist

- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set only as a server-side Vercel env var,
      never with a `NEXT_PUBLIC_` prefix, and isn't referenced from any file
      imported by a client component (`lib/supabase/admin.ts` guards this
      with the `server-only` package).
- [ ] RLS migration has been applied to the production database, and
      `select * from pg_policies where tablename = 'saved_calculations';`
      shows all four policies.
- [ ] Supabase Auth redirect URLs, `NEXT_PUBLIC_SITE_URL`, and the Turnstile
      hostname allow-list all reference the exact same production domain.
- [ ] **Confirm email** is disabled in Supabase Auth if accounts should be
   usable immediately after registration; password-reset emails remain
   enabled.
- [ ] Custom SMTP is configured with a provider suited for actual production
      volume (not Supabase's default limiter, and not a personal Gmail
      account long-term).
- [ ] CAPTCHA protection is enabled in Supabase's Attack Protection settings,
      and all three auth forms (login, register, reset-password request)
      send a `captchaToken`, since enabling it applies to all auth endpoints
      at once.
- [ ] The in-memory rate limiter in `lib/rate-limit.ts` is a per-instance,
      best-effort limiter — fine for a demo, but for real traffic replace it
      with a shared store (e.g. Upstash Redis) so limits hold across
      serverless instances.
- [ ] `npm audit` / Dependabot is set up, since dependency versions drift.
- [ ] Error responses returned to the client never include raw database
      errors or stack traces (checked throughout `app/api/*`).

## Notes on grading systems

Grading policies vary by school: passing marks, honors cutoffs, and how
subjects like PE or NSTP are treated all differ. This calculator computes a
straightforward weighted average from the numbers you enter — treat the
result as a close estimate and confirm anything that matters (scholarships,
latin honors, probation) against your registrar's own computation. New
grading scales can be added in `lib/calculator/grading-systems.ts` without
touching the calculation engine or the UI.

## Feedback

Questions or issues can be sent via the Facebook page linked in the site
footer.