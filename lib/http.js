// Rewritten for Cloudflare Workers: uses Web-standard Request/Response and
// the Web Crypto API throughout instead of Node's http/crypto modules,
// neither of which exist in the Workers runtime.

const securityHeaders = {
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "DENY",
  "Content-Security-Policy":
    "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; connect-src 'self'; base-uri 'self'; frame-ancestors 'none'",
};

export function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...securityHeaders,
    },
  });
}
export function bad(status, message) {
  return json({ message }, status);
}

// Cloudflare's account-level platform limit is 100MB; this app-level limit
// exists to give a friendly error rather than let something huge or
// malformed through. 4.2MB comfortably fits a resized product/gallery photo.
const MAX_BODY_BYTES = 4_200_000;

export async function readBody(request) {
  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) {
    throw new Error("That request is too large. If you're uploading a photo, please use one under 4MB.");
  }
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Invalid request data.");
  }
}

export function text(value, length = 1000) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, length) : "";
}
export function email(value) {
  const valueText = text(value, 180).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valueText) ? valueText : "";
}
export function phone(value) {
  const valueText = text(value, 35);
  return valueText.replace(/\D/g, "").length >= 7 ? valueText : "";
}
export function requestId(prefix) {
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${prefix}_${Date.now().toString(36)}${hex}`;
}
// cf-connecting-ip is Cloudflare's own trusted header — Cloudflare sets it
// from the real TCP connection and it cannot be spoofed by the client.
export function clientIp(request) {
  return (request.headers.get("cf-connecting-ip") || "unknown").slice(0, 80);
}

/* ---------- Web Crypto helpers ---------- */
function toBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function fromBase64Url(str) {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/").padEnd(str.length + ((4 - (str.length % 4)) % 4), "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}
function toBase64(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}
function fromBase64(str) {
  return Uint8Array.from(atob(str), (c) => c.charCodeAt(0));
}
function timingSafeEqualBytes(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}
function timingSafeEqualStr(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function hmacSign(data, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return toBase64Url(new Uint8Array(signature));
}

function requireEnv(env, name) {
  const value = env[name];
  if (!value) throw new Error("Server is not configured correctly. Please contact the site owner.");
  return value;
}

export async function sign(payload, env) {
  const tokenSecret = requireEnv(env, "TOKEN_SECRET");
  const encoded = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const signature = await hmacSign(encoded, tokenSecret);
  return `${encoded}.${signature}`;
}

export async function verifyToken(header, env) {
  let tokenSecret;
  try {
    tokenSecret = requireEnv(env, "TOKEN_SECRET");
  } catch {
    return false;
  }
  const token = header && header.startsWith("Bearer ") ? header.slice(7) : "";
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return false;
  const expected = await hmacSign(encoded, tokenSecret);
  if (!timingSafeEqualStr(signature, expected)) return false;
  try {
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(encoded)));
    return payload.exp > Date.now();
  } catch {
    return false;
  }
}

export async function requireAdmin(request, env) {
  return verifyToken(request.headers.get("authorization") || "", env);
}

// PBKDF2-SHA256 via the Web Crypto API. Node's scrypt (used before the
// Cloudflare move) has no equivalent in the Workers runtime, so passwords
// hashed with the old scheme will NOT verify here — a new admin password
// must be set using scripts/hash-password.mjs after this migration.
//
// 100,000 iterations is a deliberate choice for Cloudflare Workers' free
// tier, which caps CPU time (not wall-clock time) at 10ms per request —
// high enough to resist brute-forcing, low enough to comfortably finish
// within that budget. Network waits (e.g. the Supabase rate-limit check)
// don't count against that budget, only actual computation does.
const PBKDF2_ITERATIONS = 100_000;

async function deriveBits(password, saltBytes, iterations) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: saltBytes, iterations }, key, 256);
  return new Uint8Array(bits);
}

export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await deriveBits(password, salt, PBKDF2_ITERATIONS);
  return `PBKDF2$${PBKDF2_ITERATIONS}$${toBase64(salt)}$${toBase64(hash)}`;
}

export async function verifyPassword(candidate, storedHash) {
  if (!storedHash) return false;
  const parts = storedHash.split("$");
  if (parts.length !== 4 || parts[0] !== "PBKDF2") return false;
  const iterations = parseInt(parts[1], 10);
  if (!Number.isInteger(iterations) || iterations < 1) return false;
  const salt = fromBase64(parts[2]);
  const expected = fromBase64(parts[3]);
  const actual = await deriveBits(candidate, salt, iterations);
  return timingSafeEqualBytes(actual, expected);
}

export function validStatus(value, allowed) {
  return allowed.includes(value) ? value : "";
}

export function productId(name, products) {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "frame";
  let id = base;
  let counter = 2;
  while (products.some((product) => product.id === id)) id = `${base}-${counter++}`;
  return id;
}

function escapeHtml(input) {
  return String(input).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

export function submissionEmail(type, value, store) {
  const details = Object.entries(value)
    .filter(([key]) => !["id", "status", "createdAt"].includes(key))
    .map(([key, entry]) => `${key}: ${entry || "—"}`)
    .join("\n");
  const subject = `${type}: ${value.name}`;
  return {
    subject,
    text: `${subject}\n\n${details}\n\nSubmitted: ${value.createdAt}`,
    html: `<h2>${escapeHtml(subject)}</h2><pre>${escapeHtml(details)}\n\nSubmitted: ${escapeHtml(value.createdAt)}</pre>`,
    to: store.email,
  };
}

export async function notify(emailData, env) {
  const apiKey = env.RESEND_API_KEY;
  const from = env.EMAIL_FROM;
  if (!apiKey || !from) return { delivered: false, reason: "Email provider is not configured." };
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [emailData.to], subject: emailData.subject, text: emailData.text, html: emailData.html }),
    });
    if (!response.ok) throw new Error("Email provider rejected the request.");
    return { delivered: true };
  } catch (error) {
    console.error("Email delivery failed:", error.message);
    return { delivered: false, reason: "Email delivery failed." };
  }
}
