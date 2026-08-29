import { bad, send, readBody, requireAdmin, text, email } from "../../lib/http.js";
import { getState, setKey } from "../../lib/store.js";

const EDITABLE_FIELDS = ["name", "phone", "whatsapp", "email", "address", "mapUrl", "announcement", "heroTitle", "heroDescription"];

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
    await setKey("store", store);
    return send(res, 200, { store });
  } catch (error) {
    console.error(error);
    return bad(res, 500, "We couldn't complete that request. Please try again.");
  }
}
