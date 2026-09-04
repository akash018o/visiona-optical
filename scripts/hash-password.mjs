// Generates a password hash for ADMIN_PASSWORD_HASH, using the same
// PBKDF2-via-Web-Crypto scheme the Cloudflare Worker verifies against
// (lib/http.js). Node 20+ has the same Web Crypto globals (crypto.subtle,
// atob/btoa) as the Workers runtime, so this produces an identical format.
//
// NOTE: this replaces the old Node-scrypt-based hash used before the
// Cloudflare move. A password hashed with the old script will NOT verify
// here — generate a fresh one and update ADMIN_PASSWORD_HASH in Cloudflare.

import { hashPassword } from "../lib/http.js";

const password = process.argv[2];
if (!password) {
  console.error('Usage: node scripts/hash-password.mjs "your admin password"');
  process.exit(1);
}

const hash = await hashPassword(password);
console.log(`ADMIN_PASSWORD_HASH=${hash}`);
