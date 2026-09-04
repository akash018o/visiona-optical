import { bad, json, readBody, text, requestId, clientIp, submissionEmail, notify } from "../../lib/http.js";
import { getState, setKey, checkRateLimit } from "../../lib/store.js";

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    if (!(await checkRateLimit(env, clientIp(request)))) {
      return bad(429, "Too many submissions from this connection. Please wait a few minutes and try again.");
    }
    const input = await readBody(request);
    const state = await getState(env);
    const entry = {
      id: requestId("rev"),
      name: text(input.name, 80),
      rating: Number(input.rating),
      review: text(input.review, 1600),
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    if (!entry.name || !Number.isInteger(entry.rating) || entry.rating < 1 || entry.rating > 5 || entry.review.length < 12) {
      return bad(400, "Please enter your name, a rating, and a review of at least 12 characters.");
    }
    const reviews = [entry, ...state.reviews];
    await setKey(env, "reviews", reviews);
    context.waitUntil(notify(submissionEmail("New review awaiting approval", entry, state.store), env));
    return json({ message: "Thanks for sharing your experience. Your review has been submitted for approval." }, 201);
  } catch (error) {
    console.error(error);
    return bad(500, "We couldn't complete that request. Please try again.");
  }
}
