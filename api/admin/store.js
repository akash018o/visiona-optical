import { bad, send, readBody, requireAdmin, text, email } from "../../lib/http.js";
import { getState, setKey } from "../../lib/store.js";

const EDITABLE_FIELDS = ["name", "email", "address", "mapUrl", "announcement", "heroTitle", "heroDescription"];

export default async function handler(req, res) {
  if (req.method !== "PATCH") return bad(res, 405, "Method not allowed.");
  if (!requireAdmin(req, res)) return;
  try {
    const input = await readBody(req);
    const state = await getState();
    const store = { ...state.store };
    for (const key of EDITABLE_FIELDS) {
      if (typeof input[key] === "string" && text(input[key], 600)) store[key] = text(input[key], 600);
    }
    if (input.email && !email(store.email)) return bad(res, 400, "Please enter a valid store email.");
    if (input.mapUrl && !/^https:\/\//i.test(store.mapUrl)) {
      return bad(res, 400, "Map link must be a valid https:// URL.");
    }
    if (typeof input.phone === "string" && input.phone.trim()) {
      const cleaned = input.phone.replace(/[^\d+]/g, "");
      if (cleaned.replace(/\D/g, "").length < 7) return bad(res, 400, "Please enter a valid store phone number.");
      store.phone = cleaned;
    }
    if (typeof input.whatsapp === "string" && input.whatsapp.trim()) {
      const cleaned = input.whatsapp.replace(/\D/g, "");
      if (cleaned.length < 7) return bad(res, 400, "Please enter a valid WhatsApp number, digits only with country code (e.g. 918218841976).");
      store.whatsapp = cleaned;
    }
    await setKey("store", store);
    return send(res, 200, { store });
  } catch (error) {
    console.error(error);
    return bad(res, 500, "We couldn't complete that request. Please try again.");
  }
}
