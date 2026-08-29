import { bad, send, readBody, requireAdmin, validStatus, text } from "../../../lib/http.js";
import { getState, setKey } from "../../../lib/store.js";

// Consolidates what used to be 5 separate route files (one per resource)
// into one, to stay under Vercel Hobby's 12-serverless-function limit.
// Handles: /api/admin/{inquiries|appointments|reviews|products|services}/{id}

const STATUS_BY_KIND = {
  inquiries: ["new", "contacted", "resolved"],
  appointments: ["pending", "contacted", "confirmed", "completed", "cancelled"],
  reviews: ["pending", "approved", "rejected"],
};
const KNOWN_KINDS = ["inquiries", "appointments", "reviews", "products", "services"];
const DELETABLE_KINDS = ["reviews", "products"];

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  const { kind, id } = req.query;
  if (!KNOWN_KINDS.includes(kind)) return bad(res, 404, "Unknown resource.");

  try {
    const state = await getState();
    const list = state[kind];
    const item = list.find((entry) => entry.id === id);

    if (req.method === "PATCH") {
      if (!item) return bad(res, 404, "Not found.");
      const input = await readBody(req);

      if (kind === "products") {
        if (typeof input.featured === "boolean") item.featured = input.featured;
        if (typeof input.availability === "string") {
          item.availability = text(input.availability, 40) || item.availability;
        }
      } else if (kind === "services") {
        if (typeof input.enabled !== "boolean") return bad(res, 400, "Invalid service visibility.");
        item.enabled = input.enabled;
      } else {
        const status = validStatus(input.status, STATUS_BY_KIND[kind]);
        if (!status) return bad(res, 400, "Invalid status.");
        item.status = status;
      }

      await setKey(kind, list);
      return send(res, 200, { item });
    }

    if (req.method === "DELETE") {
      if (!DELETABLE_KINDS.includes(kind)) return bad(res, 405, "Method not allowed.");
      const index = list.findIndex((entry) => entry.id === id);
      if (index < 0) return bad(res, 404, "Not found.");
      list.splice(index, 1);
      await setKey(kind, list);
      return send(res, 200, { message: "Deleted." });
    }

    return bad(res, 405, "Method not allowed.");
  } catch (error) {
    console.error(error);
    return bad(res, 500, "We couldn't complete that request. Please try again.");
  }
}
