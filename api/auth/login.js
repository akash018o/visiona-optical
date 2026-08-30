import { bad, send, readBody, verifyPassword, sign, clientIp } from "../../lib/http.js";
import { checkRateLimit } from "../../lib/store.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return bad(res, 405, "Method not allowed.");
  try {
    if (!(await checkRateLimit(clientIp(req)))) {
      return bad(res, 429, "Too many attempts. Please wait a few minutes and try again.");
    }
    const value = await readBody(req);
    const password = String(value.password || "");
    if (!verifyPassword(password)) {
      return bad(res, 401, "That password isn't correct, or admin authentication has not been configured.");
    }
    return send(res, 200, { token: sign({ role: "admin", exp: Date.now() + 12 * 60 * 60 * 1000 }) });
  } catch (error) {
    console.error(error);
    if (error.message?.includes("not configured correctly")) return bad(res, 500, error.message);
    return bad(res, 500, "We couldn't complete that request. Please try again.");
  }
}
