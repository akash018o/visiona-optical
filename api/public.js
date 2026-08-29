import { send, bad } from "../lib/http.js";
import { getState, publicPayload } from "../lib/store.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return bad(res, 405, "Method not allowed.");
  try {
    const state = await getState();
    return send(res, 200, publicPayload(state));
  } catch (error) {
    console.error(error);
    return bad(res, 500, "We couldn't load the store right now. Please try again.");
  }
}
