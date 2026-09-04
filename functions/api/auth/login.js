import { bad, json, readBody, verifyPassword, sign, clientIp } from "../../../lib/http.js";
import { checkRateLimit } from "../../../lib/store.js";

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    if (!(await checkRateLimit(env, clientIp(request)))) {
      return bad(429, "Too many attempts. Please wait a few minutes and try again.");
    }
    const value = await readBody(request);
    const password = String(value.password || "");
    const ok = await verifyPassword(password, env.ADMIN_PASSWORD_HASH || "");
    if (!ok) {
      return bad(401, "That password isn't correct, or admin authentication has not been configured.");
    }
    const token = await sign({ role: "admin", exp: Date.now() + 12 * 60 * 60 * 1000 }, env);
    return json({ token });
  } catch (error) {
    console.error(error);
    if (error.message?.includes("not configured correctly")) return bad(500, error.message);
    return bad(500, "We couldn't complete that request. Please try again.");
  }
}
