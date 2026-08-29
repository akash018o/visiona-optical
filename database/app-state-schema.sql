-- Run this once in the Supabase SQL editor (Project -> SQL Editor -> New query).
--
-- This is a pragmatic persistence layer: each top-level slice of the old
-- data/store-data.json file (store, products, services, inquiries,
-- appointments, reviews) becomes one row here, keyed by name, holding the
-- same JSON shape the app already uses. It swaps "write a JSON file to disk"
-- for "write a row to Postgres" without changing any of the data shapes —
-- which is the fastest, lowest-risk way to get the site correctly persisted
-- and serverless-compatible.
--
-- database/schema.sql (already in the repo) is a more fully-normalized
-- design with separate tables per resource. It's worth migrating to later if
-- you outgrow this — e.g. once you want to filter/sort products by category
-- directly in SQL rather than in JS — but is not needed to launch.

create table if not exists app_state (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists rate_limits (
  ip text primary key,
  hits jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- RLS is enabled with NO policies on purpose: that denies all access to the
-- anon/public role. Only the SECRET service_role key (used server-side only,
-- in Vercel's environment variables, never in the browser) can read or write
-- these tables, since service_role bypasses RLS entirely. The browser never
-- talks to Supabase directly in this app — only to our own /api/* functions.
alter table app_state enable row level security;
alter table rate_limits enable row level security;
