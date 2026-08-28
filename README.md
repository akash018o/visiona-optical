# Visiona Optical

A mobile-first, local optical store website with a real Node backend—no cart, checkout, payment, shipping, or online ordering.

## Start locally

1. Copy `.env.example` to `.env`.
2. Before a production launch, run `node scripts/hash-password.mjs "a strong admin password"` and paste the resulting line into `.env`. Add a long random `TOKEN_SECRET` too.
3. Run `npm start`.
4. Open [http://localhost:3000](http://localhost:3000).

For a local preview only, you can set `ADMIN_PASSWORD` in `.env`; it is deliberately refused when `NODE_ENV=production`. Production authentication accepts only `ADMIN_PASSWORD_HASH` created by the included scrypt script.

## What is configurable

- `config/store.js` is the central, safe-to-share source for the temporary name, contact details, hours, map link, homepage copy, product showcase, and services.
- Replace `public/assets/visiona-hero.png` and `public/assets/frame-collection.png` with real store photography while keeping the same names—or update the two image paths in `config/store.js`.
- Admin edits persist in `data/store-data.json`, which is created when the server first runs.

## Connected workflows

- Inquiry, appointment-request, and review forms validate on the client and server, are rate-limited, and save to the local data store.
- Reviews remain pending until an admin approves them.
- The admin area supports status updates, review moderation, product showcase creation/removal, service visibility, store information, and homepage copy.
- When `RESEND_API_KEY` and `EMAIL_FROM` are supplied, new submissions are delivered to the configured store email through Resend. Without those settings they are still safely stored in the dashboard.

## Before launch

- Replace the temporary business details, location, wording, and generated images.
- Apply [`database/schema.sql`](database/schema.sql) to PostgreSQL and replace the isolated JSON store adapter in `server.mjs` with the chosen PostgreSQL client before launch. The schema covers products, services, inquiries, appointments, reviews, gallery images, store details, and admin users.
- Configure a custom email sender/domain and production environment variables.
- Have the privacy and terms starter text checked for your local requirements.
