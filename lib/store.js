import { supabaseAdmin } from "./supabase.js";
import { STORE_CONFIG, PRODUCTS, SERVICES } from "../public/config/store.js";

// Pragmatic persistence: each top-level slice of the old JSON file becomes
// one row (key + jsonb value) in a Postgres table. This keeps the exact same
// shape the rest of the app already expects, while being safe to read/write
// from stateless serverless functions. See database/app-state-schema.sql.
const KEYS = ["store", "products", "services", "inquiries", "appointments", "reviews", "gallery"];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}
function defaults() {
  return {
    store: clone(STORE_CONFIG),
    products: clone(PRODUCTS),
    services: clone(SERVICES),
    inquiries: [],
    appointments: [],
    reviews: [],
    gallery: [],
  };
}

export async function getState() {
  const sb = supabaseAdmin();
  const { data, error } = await sb.from("app_state").select("key, value");
  if (error) throw error;
  const found = Object.fromEntries((data || []).map((row) => [row.key, row.value]));
  const fallback = defaults();
  const state = {};
  for (const key of KEYS) state[key] = key in found ? found[key] : fallback[key];

  const missing = KEYS.filter((key) => !(key in found));
  if (missing.length) {
    await sb.from("app_state").upsert(missing.map((key) => ({ key, value: state[key] })));
  }
  return state;
}

export async function setKey(key, value) {
  const sb = supabaseAdmin();
  const { error } = await sb.from("app_state").upsert({ key, value, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export function publicPayload(state) {
  return {
    store: state.store,
    products: state.products,
    services: state.services,
    reviews: state.reviews.filter((review) => review.status === "approved"),
    gallery: state.gallery,
  };
}

const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_MAX = 6;

export async function checkRateLimit(ip) {
  const sb = supabaseAdmin();
  const now = Date.now();
  const { data } = await sb.from("rate_limits").select("hits").eq("ip", ip).maybeSingle();
  const hits = ((data && data.hits) || []).filter((time) => now - time < RATE_WINDOW_MS);
  if (hits.length >= RATE_MAX) return false;
  hits.push(now);
  await sb.from("rate_limits").upsert({ ip, hits, updated_at: new Date().toISOString() });
  return true;
}
