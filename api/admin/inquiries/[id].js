import { bad, send, readBody, requireAdmin, validStatus } from "../../../lib/http.js";
import { getState, setKey } from "../../../lib/store.js";

const ALLOWED = ["new", "contacted", "resolved"];

export default async function handler(req, res) {
  if (req.method !== "PATCH") return bad(res, 405, "Method not allowed.");
  if (!requireAdmin(req, res)) return;
  try {
    const { id } = req.query;
    const input = await readBody(req);
    const state = await getState();
    const item = state.inquiries.find((entry) => entry.id === id);
    if (!item) return bad(res, 404, "Submission not found.");
    const status = validStatus(input.status, ALLOWED);
    if (!status) return bad(res, 400, "Invalid status.");
    item.status = status;
    await setKey("inquiries", state.inquiries);
    return send(res, 200, { item });
  } catch (error) {
    console.error(error);
    return bad(res, 500, "We couldn't complete that request. Please try again.");
  }
}
