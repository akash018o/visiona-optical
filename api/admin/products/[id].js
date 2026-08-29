import { bad, send, readBody, requireAdmin, text } from "../../../lib/http.js";
import { getState, setKey } from "../../../lib/store.js";

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  try {
    const { id } = req.query;
    const state = await getState();
    if (req.method === "PATCH") {
      const input = await readBody(req);
      const item = state.products.find((entry) => entry.id === id);
      if (!item) return bad(res, 404, "Product not found.");
      if (typeof input.featured === "boolean") item.featured = input.featured;
      if (typeof input.availability === "string") item.availability = text(input.availability, 40) || item.availability;
      await setKey("products", state.products);
      return send(res, 200, { item });
    }
    if (req.method === "DELETE") {
      const index = state.products.findIndex((entry) => entry.id === id);
      if (index < 0) return bad(res, 404, "Product not found.");
      state.products.splice(index, 1);
      await setKey("products", state.products);
      return send(res, 200, { message: "Deleted." });
    }
    return bad(res, 405, "Method not allowed.");
  } catch (error) {
    console.error(error);
    return bad(res, 500, "We couldn't complete that request. Please try again.");
  }
}
