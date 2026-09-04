import { bad, json, readBody, requireAdmin, text, email } from "../../../lib/http.js";
import { getState, setKey } from "../../../lib/store.js";

const EDITABLE_FIELDS = ["name", "email", "address", "mapUrl", "announcement", "heroTitle", "heroDescription"];

export async function onRequestPatch(context) {
  const { request, env } = context;
  if (!(await requireAdmin(request, env))) return bad(401, "Your admin session has expired. Please sign in again.");
  try {
    const input = await readBody(request);
    const state = await getState(env);
    const store = { ...state.store };
    for (const key of EDITABLE_FIELDS) {
      if (typeof input[key] === "string" && text(input[key], 600)) store[key] = text(input[key], 600);
    }
    if (input.email && !email(store.email)) return bad(400, "Please enter a valid store email.");
    if (input.mapUrl && !/^https:\/\//i.test(store.mapUrl)) {
      return bad(400, "Map link must be a valid https:// URL.");
    }
    if (typeof input.phone === "string" && input.phone.trim()) {
      const cleaned = input.phone.replace(/[^\d+]/g, "");
      if (cleaned.replace(/\D/g, "").length < 7) return bad(400, "Please enter a valid store phone number.");
      store.phone = cleaned;
    }
    if (typeof input.whatsapp === "string" && input.whatsapp.trim()) {
      const cleaned = input.whatsapp.replace(/\D/g, "");
      if (cleaned.length < 7) return bad(400, "Please enter a valid WhatsApp number, digits only with country code (e.g. 918218841976).");
      store.whatsapp = cleaned;
    }
    if (Array.isArray(input.openingHours)) {
      store.openingHours = input.openingHours
        .filter((row) => Array.isArray(row) && row.length === 2)
        .map(([day, hours]) => [text(day, 40), text(hours, 60)]);
    }
    await setKey(env, "store", store);
    return json({ store });
  } catch (error) {
    console.error(error);
    return bad(500, "We couldn't complete that request. Please try again.");
  }
}
