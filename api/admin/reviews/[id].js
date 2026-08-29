import { bad, send, readBody, requireAdmin, validStatus } from "../../../lib/http.js";
import { getState, setKey } from "../../../lib/store.js";

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  try {
    const { id } = req.query;
    const state = await getState();
    if (req.method === "PATCH") {
      const input = await readBody(req);
      const item = state.reviews.find((entry) => entry.id === id);
      if (!item) return bad(res, 404, "Review not found.");
      const status = validStatus(input.status, ["pending", "approved", "rejected"]);
      if (!status) return bad(res, 400, "Invalid review status.");
      item.status = status;
      await setKey("reviews", state.reviews);
      return send(res, 200, { item });
    }
    if (req.method === "DELETE") {
      const index = state.reviews.findIndex((entry) => entry.id === id);
      if (index < 0) return bad(res, 404, "Review not found.");
      state.reviews.splice(index, 1);
      await setKey("reviews", state.reviews);
      return send(res, 200, { message: "Deleted." });
    }
    return bad(res, 405, "Method not allowed.");
  } catch (error) {
    console.error(error);
    return bad(res, 500, "We couldn't complete that request. Please try again.");
  }
}
