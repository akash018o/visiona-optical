import { createServer } from "node:http";
import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { STORE_CONFIG, PRODUCTS, SERVICES, INQUIRY_TYPES } from "./public/config/store.js";

const root = fileURLToPath(new URL(".", import.meta.url));
const publicDir = join(root, "public");
const dataDir = join(root, "data");
const dataFile = join(dataDir, "store-data.json");
const env = await loadEnv(join(root, ".env"));
const port = Number(env.PORT || process.env.PORT || 3000);
const tokenSecret = env.TOKEN_SECRET || process.env.TOKEN_SECRET || "development-only-token-secret-change-before-launch";
const developmentPassword = env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;
const passwordHash = env.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD_HASH || "";
const rateBuckets = new Map();

const mimeTypes = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".xml": "application/xml; charset=utf-8", ".txt": "text/plain; charset=utf-8",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml", ".ico": "image/x-icon"
};

async function loadEnv(file) {
  try {
    const raw = await readFile(file, "utf8");
    return Object.fromEntries(raw.split(/\r?\n/).map(line => line.trim()).filter(line => line && !line.startsWith("#")).map(line => {
      const separator = line.indexOf("=");
      return [line.slice(0, separator), line.slice(separator + 1).replace(/^['"]|['"]$/g, "")];
    }));
  } catch { return {}; }
}
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function initialData() { return { store: clone(STORE_CONFIG), products: clone(PRODUCTS), services: clone(SERVICES), inquiries: [], appointments: [], reviews: [] }; }
async function db() {
  await mkdir(dataDir, { recursive: true });
  try { return JSON.parse(await readFile(dataFile, "utf8")); }
  catch { const data = initialData(); await save(data); return data; }
}
async function save(data) { await writeFile(dataFile, JSON.stringify(data, null, 2), "utf8"); }
function send(res, status, body) {
  res.writeHead(status, securityHeaders({ "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" }));
  res.end(JSON.stringify(body));
}
function securityHeaders(headers = {}) { return { "Referrer-Policy": "strict-origin-when-cross-origin", "X-Frame-Options": "DENY", "Content-Security-Policy": "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; connect-src 'self'; base-uri 'self'; frame-ancestors 'none'", ...headers }; }
function bad(res, status, message) { return send(res, status, { message }); }
async function body(req) {
  let raw = "";
  for await (const chunk of req) { raw += chunk; if (raw.length > 150_000) throw new Error("Request body too large."); }
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { throw new Error("Invalid request data."); }
}
function text(value, length = 1000) { return typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, length) : ""; }
function email(value) { const valueText = text(value, 180).toLowerCase(); return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valueText) ? valueText : ""; }
function phone(value) { const valueText = text(value, 35); return valueText.replace(/\D/g, "").length >= 7 ? valueText : ""; }
function requestId(prefix) { return `${prefix}_${Date.now().toString(36)}${randomBytes(4).toString("hex")}`; }
function clientIp(req) { return (req.headers["x-forwarded-for"]?.toString().split(",")[0].trim() || req.socket.remoteAddress || "unknown").slice(0, 80); }
function rateLimit(req) {
  const ip = clientIp(req), now = Date.now(), windowMs = 15 * 60 * 1000;
  const bucket = (rateBuckets.get(ip) || []).filter(time => now - time < windowMs);
  if (bucket.length >= 6) return false;
  bucket.push(now); rateBuckets.set(ip, bucket); return true;
}
function sign(payload) { const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url"); return `${encoded}.${createHmac("sha256", tokenSecret).update(encoded).digest("base64url")}`; }
function verifyToken(header = "") {
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const [encoded, signature] = token.split("."); if (!encoded || !signature) return false;
  const expected = createHmac("sha256", tokenSecret).update(encoded).digest("base64url");
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
  try { return JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")).exp > Date.now(); } catch { return false; }
}
function verifyPassword(candidate) {
  if (passwordHash) {
    const [kind, salt, expected] = passwordHash.split("$");
    if (kind !== "scrypt" || !salt || !expected) return false;
    const computed = scryptSync(candidate, Buffer.from(salt, "base64url"), 64).toString("base64url");
    return computed.length === expected.length && timingSafeEqual(Buffer.from(computed), Buffer.from(expected));
  }
  // ADMIN_PASSWORD is allowed only as an explicit local-development convenience.
  if (developmentPassword && process.env.NODE_ENV !== "production") {
    return candidate.length === developmentPassword.length && timingSafeEqual(Buffer.from(candidate), Buffer.from(developmentPassword));
  }
  return false;
}
function requireAdmin(req, res) { if (!verifyToken(req.headers.authorization || "")) { bad(res, 401, "Your admin session has expired. Please sign in again."); return false; } return true; }
function publicPayload(data) { return { store: data.store, products: data.products, services: data.services, reviews: data.reviews.filter(review => review.status === "approved") }; }
function submissionEmail(type, value, store) {
  const details = Object.entries(value).filter(([key]) => !["id", "status", "createdAt"].includes(key)).map(([key, entry]) => `${key}: ${entry || "—"}`).join("\n");
  const subject = `${type}: ${value.name}`;
  return { subject, text: `${subject}\n\n${details}\n\nSubmitted: ${value.createdAt}`, html: `<h2>${escapeHtml(subject)}</h2><pre>${escapeHtml(details)}\n\nSubmitted: ${escapeHtml(value.createdAt)}</pre>`, to: store.email };
}
function escapeHtml(input) { return String(input).replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[char]); }
async function notify(emailData) {
  const apiKey = env.RESEND_API_KEY || process.env.RESEND_API_KEY;
  const from = env.EMAIL_FROM || process.env.EMAIL_FROM;
  if (!apiKey || !from) return { delivered: false, reason: "Email provider is not configured." };
  try {
    const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ from, to: [emailData.to], subject: emailData.subject, text: emailData.text, html: emailData.html }) });
    if (!response.ok) throw new Error("Email provider rejected the request.");
    return { delivered: true };
  } catch (error) { console.error("Email delivery failed:", error.message); return { delivered: false, reason: "Email delivery failed." }; }
}
function validStatus(value, allowed) { return allowed.includes(value) ? value : ""; }
function productId(name, products) { const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "frame"; let id = base, counter = 2; while (products.some(product => product.id === id)) id = `${base}-${counter++}`; return id; }

async function api(req, res, path) {
  const method = req.method || "GET";
  if (method === "GET" && path === "/api/public") return send(res, 200, publicPayload(await db()));
  if (method === "POST" && path === "/api/auth/login") {
    if (!rateLimit(req)) return bad(res, 429, "Too many attempts. Please wait a few minutes and try again.");
    const value = await body(req), password = String(value.password || "");
    if (!verifyPassword(password)) return bad(res, 401, "That password isn’t correct, or admin authentication has not been configured.");
    return send(res, 200, { token: sign({ role: "admin", exp: Date.now() + 12 * 60 * 60 * 1000 }) });
  }
  if (method === "POST" && ["/api/inquiries", "/api/appointments", "/api/reviews"].includes(path)) {
    if (!rateLimit(req)) return bad(res, 429, "Too many submissions from this connection. Please wait a few minutes and try again.");
    const input = await body(req), data = await db(), createdAt = new Date().toISOString();
    if (path === "/api/inquiries") {
      const entry = { id: requestId("inq"), name: text(input.name, 80), phone: phone(input.phone), email: email(input.email), type: text(input.type, 60), product: text(input.product, 120), message: text(input.message, 2000), status: "new", createdAt };
      if (!entry.name || !entry.phone || !entry.email || !entry.message || !INQUIRY_TYPES.includes(entry.type)) return bad(res, 400, "Please enter a name, valid phone and email, inquiry type, and message.");
      data.inquiries.unshift(entry); await save(data); void notify(submissionEmail("New website inquiry", entry, data.store));
      return send(res, 201, { message: "Thanks! Your inquiry has been received. Our team will contact you soon." });
    }
    if (path === "/api/appointments") {
      const entry = { id: requestId("apt"), name: text(input.name, 80), phone: phone(input.phone), email: input.email ? email(input.email) : "", preferredDate: text(input.preferredDate, 20), preferredTime: text(input.preferredTime, 50), ageGroup: text(input.ageGroup, 30), message: text(input.message, 1600), status: "pending", createdAt };
      if (!entry.name || !entry.phone || (input.email && !entry.email) || !/^\d{4}-\d{2}-\d{2}$/.test(entry.preferredDate) || !entry.preferredTime || !entry.ageGroup) return bad(res, 400, "Please complete the required fields with a valid phone number and date.");
      data.appointments.unshift(entry); await save(data); void notify(submissionEmail("New eye-test request", entry, data.store));
      return send(res, 201, { message: "Your eye-test request has been received. We’ll contact you to confirm your appointment." });
    }
    const entry = { id: requestId("rev"), name: text(input.name, 80), rating: Number(input.rating), review: text(input.review, 1600), status: "pending", createdAt };
    if (!entry.name || !Number.isInteger(entry.rating) || entry.rating < 1 || entry.rating > 5 || entry.review.length < 12) return bad(res, 400, "Please enter your name, a rating, and a review of at least 12 characters.");
    data.reviews.unshift(entry); await save(data); void notify(submissionEmail("New review awaiting approval", entry, data.store));
    return send(res, 201, { message: "Thanks for sharing your experience. Your review has been submitted for approval." });
  }
  if (!path.startsWith("/api/admin")) return bad(res, 404, "Not found.");
  if (!requireAdmin(req, res)) return;
  const data = await db();
  if (method === "GET" && path === "/api/admin") return send(res, 200, data);
  if (method === "PATCH" && /^\/api\/admin\/(inquiries|appointments)\//.test(path)) {
    const [, kind, id] = path.match(/^\/api\/admin\/(inquiries|appointments)\/(.+)$/), list = data[kind], item = list.find(entry => entry.id === id), input = await body(req);
    const allowed = kind === "inquiries" ? ["new", "contacted", "resolved"] : ["pending", "contacted", "confirmed", "completed", "cancelled"];
    if (!item) return bad(res, 404, "Submission not found."); const status = validStatus(input.status, allowed); if (!status) return bad(res, 400, "Invalid status.");
    item.status = status; await save(data); return send(res, 200, { item });
  }
  if (method === "PATCH" && /^\/api\/admin\/reviews\//.test(path)) {
    const id = decodeURIComponent(path.split("/").pop()), item = data.reviews.find(entry => entry.id === id), input = await body(req), status = validStatus(input.status, ["pending", "approved", "rejected"]);
    if (!item) return bad(res, 404, "Review not found."); if (!status) return bad(res, 400, "Invalid review status."); item.status = status; await save(data); return send(res, 200, { item });
  }
  if (method === "DELETE" && /^\/api\/admin\/reviews\//.test(path)) {
    const id = decodeURIComponent(path.split("/").pop()), index = data.reviews.findIndex(entry => entry.id === id); if (index < 0) return bad(res, 404, "Review not found."); data.reviews.splice(index, 1); await save(data); return send(res, 200, { message: "Deleted." });
  }
  if (method === "POST" && path === "/api/admin/products") {
    const input = await body(req), name = text(input.name, 90), shape = text(input.shape, 40), material = text(input.material, 40), color = text(input.color, 40), ageGroup = text(input.ageGroup, 40), description = text(input.description, 800), category = text(input.category, 40);
    if (!name || !shape || !material || !color || !ageGroup || !description || !category) return bad(res, 400, "Please complete every product field.");
    const product = { id: productId(name, data.products), name, category, ageGroup, shape, material, color, style: `${shape} frame`, description, availability: "Ask in store", featured: false, imagePosition: "50% 50%" }; data.products.push(product); await save(data); return send(res, 201, { product });
  }
  if (method === "PATCH" && /^\/api\/admin\/products\//.test(path)) {
    const id = decodeURIComponent(path.split("/").pop()), item = data.products.find(entry => entry.id === id), input = await body(req); if (!item) return bad(res, 404, "Product not found.");
    if (typeof input.featured === "boolean") item.featured = input.featured; if (typeof input.availability === "string") item.availability = text(input.availability, 40) || item.availability; await save(data); return send(res, 200, { item });
  }
  if (method === "DELETE" && /^\/api\/admin\/products\//.test(path)) { const id = decodeURIComponent(path.split("/").pop()), index = data.products.findIndex(entry => entry.id === id); if (index < 0) return bad(res, 404, "Product not found."); data.products.splice(index, 1); await save(data); return send(res, 200, { message: "Deleted." }); }
  if (method === "PATCH" && /^\/api\/admin\/services\//.test(path)) { const id = decodeURIComponent(path.split("/").pop()), item = data.services.find(entry => entry.id === id), input = await body(req); if (!item) return bad(res, 404, "Service not found."); if (typeof input.enabled !== "boolean") return bad(res, 400, "Invalid service visibility."); item.enabled = input.enabled; await save(data); return send(res, 200, { item }); }
  if (method === "PATCH" && path === "/api/admin/store") {
    const input = await body(req), allowed = ["name", "phone", "whatsapp", "email", "address", "mapUrl", "announcement", "heroTitle", "heroDescription"];
    for (const key of allowed) if (typeof input[key] === "string" && text(input[key], 600)) data.store[key] = text(input[key], 600);
    if (input.email && !email(data.store.email)) return bad(res, 400, "Please enter a valid store email."); await save(data); return send(res, 200, { store: data.store });
  }
  return bad(res, 404, "Not found.");
}

async function staticFile(req, res, pathname) {
  let target;
  if (pathname === "/" || pathname === "/index.html") target = join(publicDir, "index.html");
  else {
    const clean = normalize(pathname.replace(/^\/+/, ""));
    target = resolve(publicDir, clean);
    const publicRoot = resolve(publicDir);
    if (target !== publicRoot && !target.startsWith(`${publicRoot}${sep}`)) return bad(res, 403, "Forbidden.");
  }
  try { const file = await readFile(target); res.writeHead(200, securityHeaders({ "Content-Type": mimeTypes[extname(target).toLowerCase()] || "application/octet-stream", "X-Content-Type-Options": "nosniff", "Cache-Control": target.includes("assets") ? "public, max-age=604800" : "no-cache" })); res.end(file); }
  catch { if (!extname(pathname)) { const page = await readFile(join(publicDir, "index.html")); res.writeHead(200, securityHeaders({ "Content-Type": "text/html; charset=utf-8" })); res.end(page); } else bad(res, 404, "Not found."); }
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    if (url.pathname.startsWith("/api/")) await api(req, res, url.pathname);
    else await staticFile(req, res, url.pathname);
  } catch (error) { console.error(error); if (!res.headersSent) bad(res, error.message === "Request body too large." ? 413 : 500, "We couldn’t complete that request. Please try again."); }
});
server.listen(port, () => console.log(`Visiona Optical is running at http://localhost:${port}`));
