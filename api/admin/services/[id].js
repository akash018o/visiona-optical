import { bad, send, readBody, requireAdmin } from "../../../lib/http.js";
import { getState, setKey } from "../../../lib/store.js";

export default async function handler(req, res) {
  if (req.method !== "PATCH") return bad(res, 405, "Method not allowed.");
  if (!requireAdmin(req, res)) return;
  try {
    const { id } = req.query;
    const input = await readBody(req);
    const state = await getState();
    const item = state.services.find((entry) => entry.id === id);
    if (!item) return bad(res, 404, "Service not found.");
    if (typeof input.enabled !== "boolean") return bad(res, 400, "Invalid service visibility.");
    item.enabled = input.enabled;
    await setKey("services", state.services);
    return send(res, 200, { item });
  } catch (error) {
    console.error(error);
    return bad(res, 500, "We couldn't complete that request. Please try again.");
  }
}
