import { createClient } from "@supabase/supabase-js";

// Server-only client. Uses the SECRET service role key, which bypasses Row
// Level Security — never expose this key to the browser, and never import
// this file from anything under /public. The browser only ever talks to
// our own /api/* functions, never to Supabase directly.
let client;

export function supabaseAdmin() {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (Vercel project settings -> Environment Variables)."
    );
  }
  client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}
