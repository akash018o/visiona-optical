-- Run this once in the Supabase SQL editor, alongside the other two SQL
-- files (app-state-schema.sql and product-images-storage.sql).
--
-- Same idea as product-images: a public bucket for gallery photos the owner
-- uploads from the admin panel (store exterior/interior, eye-testing room,
-- staff, new collections, events, etc). Public read; uploads/deletes only
-- ever happen server-side via the secret service_role key.

insert into storage.buckets (id, name, public)
values ('gallery-images', 'gallery-images', true)
on conflict (id) do nothing;
