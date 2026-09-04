import { json, bad } from "../../lib/http.js";
import { getState, publicPayload } from "../../lib/store.js";

export async function onRequestGet(context) {
  try {
    const state = await getState(context.env);
    return json(publicPayload(state));
  } catch (error) {
    console.error(error);
    return bad(500, "We couldn't load the store right now. Please try again.");
  }
}
