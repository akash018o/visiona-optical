import { bad, json, requireAdmin } from "../../../lib/http.js";
import { getState } from "../../../lib/store.js";

export async function onRequestGet(context) {
  if (!(await requireAdmin(context.request, context.env))) return bad(401, "Your admin session has expired. Please sign in again.");
  try {
    const state = await getState(context.env);
    return json(state);
  } catch (error) {
    console.error(error);
    return bad(500, "We couldn't load the dashboard right now.");
  }
}
