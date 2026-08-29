# Rudra Optical

A mobile-first, local optical store website — no cart, checkout, payment,
shipping, or online ordering. Runs entirely on Vercel: static pages in
`public/`, a small Postgres-backed backend as Vercel serverless functions
in `api/`.

## Start locally

1. Create a free project at [supabase.com](https://supabase.com) if you don't have one yet.
2. In the Supabase SQL editor, run [`database/app-state-schema.sql`](database/app-state-schema.sql), [`database/product-images-storage.sql`](database/product-images-storage.sql), and [`database/gallery-images-storage.sql`](database/gallery-images-storage.sql).
3. Copy `.env.example` to `.env` and fill in:
   - `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` — Project Settings -> API.
   - `SUPABASE_SERVICE_ROLE_KEY` — same page, the **secret** key. Server-only, never commit it.
4. Run `node scripts/hash-password.mjs "a strong admin password"` and paste the resulting `ADMIN_PASSWORD_HASH` line into `.env`. Add a long random `TOKEN_SECRET` too.
5. Install the Vercel CLI once: `npm i -g vercel`.
6. Run `npm run dev` (this runs `vercel dev`, which serves `public/` and the `api/` functions together, the same way production does).
7. Open the URL it prints (usually [http://localhost:3000](http://localhost:3000)).

For a local-only shortcut you can set `ADMIN_PASSWORD` in `.env` instead of step 4; it's deliberately refused whenever `NODE_ENV=production`. Production authentication only ever accepts `ADMIN_PASSWORD_HASH`.

## Deploying

Import the repo in Vercel as normal, then in the Vercel project's **Environment Variables**, set the same values from your `.env`: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD_HASH`, `TOKEN_SECRET`, and optionally `RESEND_API_KEY` / `EMAIL_FROM`. Don't set `ADMIN_PASSWORD` in production.

## What is configurable

- `public/config/store.js` is the central, safe-to-share source for the store name, contact details, hours, map link, homepage copy, product showcase, and services.
- **Product photos are owner-editable, no code needed.** In `/admin` → Products, "Add a showcase frame" or "Edit" on an existing one now includes a Photo field — upload a JPEG/PNG/WEBP (under 4MB; large phone photos are automatically shrunk in the browser before upload) and it's stored in Supabase Storage and shown on the site immediately.
- **Gallery photos work the same way.** In `/admin` → Gallery, "+ Add photo" only requires the photo itself — title, description, and category are all optional, left blank if skipped. Photos show up on the public Gallery page immediately, filterable by category if more than one category is in use.
- The **hero banner** (`public/assets/visiona-hero.png`) and **about/gallery images** (`public/assets/frame-collection.png`) are still static files replaced by editing the repo — they aren't per-product, so they didn't fit the same admin-upload flow. Worth giving these the same treatment later if the owner wants to update them without a deploy.
- Admin edits persist in Supabase (see [`database/app-state-schema.sql`](database/app-state-schema.sql) and [`database/product-images-storage.sql`](database/product-images-storage.sql)), so they survive redeploys and work correctly across serverless function invocations.

## Connected workflows

- Inquiry, appointment-request, and review forms validate on the client and server, are rate-limited (persisted per IP in the `rate_limits` table), and save to Supabase.
- Reviews remain pending until an admin approves them.
- The admin area supports status updates, review moderation, product showcase creation/removal, service visibility, store information, and homepage copy.
- When `RESEND_API_KEY` and `EMAIL_FROM` are supplied, new submissions are delivered to the configured store email through Resend. Without those settings they're still safely stored and visible in the admin dashboard.

## Before launch

- [ ] Resolve the store name: `public/config/store.js` currently has `name: "RUDRA OPTICAL"` — confirmed as the real name, now used consistently everywhere.
- [ ] Replace the temporary business details in `public/config/store.js` — the `about.story` text, `mapUrl`, and the phone/email currently there.
- [ ] Replace `public/assets/visiona-hero.png` and `public/assets/frame-collection.png` (hero banner + about/gallery imagery) with real photos — product photos themselves are now handled in `/admin`, no code change needed.
- [ ] Run `node scripts/hash-password.mjs` for a real admin password and set a real random `TOKEN_SECRET` in Vercel — don't ship the placeholder values from `.env.example`.
- [ ] Configure `RESEND_API_KEY` / `EMAIL_FROM` so you actually get emailed when someone submits a form.
- [ ] Consider migrating from `app_state`/`rate_limits` to the fully-normalized [`database/schema.sql`](database/schema.sql) once you need richer queries (e.g. filtering products by category in SQL) — not required to launch.
- [ ] Have the privacy and terms starter text checked for your local requirements.
