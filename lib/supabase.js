import { createClient } from "@supabase/supabase-js";

// Server-only client. Uses the SECRET service role key, which bypasses Row
// Level Security — never expose this key to the browser. The browser only
// ever talks to our own /api/* functions, never to Supabase directly.
// Cloudflare Workers inject environment variables/secrets via `env`, not
// `process.env` (there is no `process` global in the Workers runtime).
export function supabaseAdmin(env) {
  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (Cloudflare Pages project -> Settings -> Environment variables)."
    );
  }
  // Cloudflare Workers provide native fetch, which supabase-js uses directly.
  return createClient(url, key, { auth: { persistSession: false } });
}
