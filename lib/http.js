import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const securityHeaders = {
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "DENY",
  "Content-Security-Policy":
    "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; connect-src 'self'; base-uri 'self'; frame-ancestors 'none'",
};

export function send(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    ...securityHeaders,
  });
  res.end(JSON.stringify(body));
}

export function bad(res, status, message) {
  return send(res, status, { message });
}

// Vercel's Node runtime auto-parses JSON bodies into req.body, but we fall
// back to reading the stream ourselves so this works locally too either way.
export async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 150_000) throw new Error("Request body too large.");
  }
  if (!raw) return {};
  try {
    return JSON.parse(raw);
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
  return `${prefix}_${Date.now().toString(36)}${randomBytes(4).toString("hex")}`;
}
export function clientIp(req) {
  return (
    req.headers["x-forwarded-for"]?.toString().split(",")[0].trim() ||
    req.socket?.remoteAddress ||
    "unknown"
  ).slice(0, 80);
}

export function sign(payload) {
  const tokenSecret = process.env.TOKEN_SECRET || "development-only-token-secret-change-before-launch";
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${createHmac("sha256", tokenSecret).update(encoded).digest("base64url")}`;
}

export function verifyToken(header = "") {
  const tokenSecret = process.env.TOKEN_SECRET || "development-only-token-secret-change-before-launch";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return false;
  const expected = createHmac("sha256", tokenSecret).update(encoded).digest("base64url");
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return false;
  }
  try {
    return JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")).exp > Date.now();
  } catch {
    return false;
  }
}

export function verifyPassword(candidate) {
  const passwordHash = process.env.ADMIN_PASSWORD_HASH || "";
  if (passwordHash) {
    const [kind, salt, expected] = passwordHash.split("$");
    if (kind !== "scrypt" || !salt || !expected) return false;
    const computed = scryptSync(candidate, Buffer.from(salt, "base64url"), 64).toString("base64url");
    return computed.length === expected.length && timingSafeEqual(Buffer.from(computed), Buffer.from(expected));
  }
  // ADMIN_PASSWORD is allowed only as an explicit local-development convenience.
  const developmentPassword = process.env.ADMIN_PASSWORD;
  if (developmentPassword && process.env.NODE_ENV !== "production") {
    return candidate.length === developmentPassword.length && timingSafeEqual(Buffer.from(candidate), Buffer.from(developmentPassword));
  }
  return false;
}

export function requireAdmin(req, res) {
  if (!verifyToken(req.headers.authorization || "")) {
    bad(res, 401, "Your admin session has expired. Please sign in again.");
    return false;
  }
  return true;
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

export async function notify(emailData) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
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
