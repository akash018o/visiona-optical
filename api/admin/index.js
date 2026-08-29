import { bad, send, requireAdmin } from "../../lib/http.js";
import { getState } from "../../lib/store.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return bad(res, 405, "Method not allowed.");
  if (!requireAdmin(req, res)) return;
  try {
    const state = await getState();
    return send(res, 200, state);
  } catch (error) {
    console.error(error);
    return bad(res, 500, "We couldn't load the dashboard right now.");
  }
}
