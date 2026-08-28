import { randomBytes, scryptSync } from "node:crypto";

const password = process.argv[2];
if (!password) {
  console.error("Usage: node scripts/hash-password.mjs \"your admin password\"");
  process.exit(1);
}
const salt = randomBytes(16).toString("base64url");
const hash = scryptSync(password, Buffer.from(salt, "base64url"), 64).toString("base64url");
console.log(`ADMIN_PASSWORD_HASH=scrypt$${salt}$${hash}`);
