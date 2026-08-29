-- Run this once in the Supabase SQL editor (Project -> SQL Editor -> New query),
-- in addition to database/app-state-schema.sql if you haven't already.
--
-- Creates a public storage bucket for product photos the owner uploads from
-- the admin panel. "Public" means anyone with the file's URL can view it
-- (that's how the photos show up on the public site) — but uploading and
-- deleting only ever happens server-side, via the secret service_role key,
-- never from the browser.

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;
