import { bad, send, readBody, text, requestId, clientIp, submissionEmail, notify } from "../lib/http.js";
import { getState, setKey, checkRateLimit } from "../lib/store.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return bad(res, 405, "Method not allowed.");
  try {
    if (!(await checkRateLimit(clientIp(req)))) {
      return bad(res, 429, "Too many submissions from this connection. Please wait a few minutes and try again.");
    }
    const input = await readBody(req);
    const state = await getState();
    const entry = {
      id: requestId("rev"),
      name: text(input.name, 80),
      rating: Number(input.rating),
      review: text(input.review, 1600),
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    if (!entry.name || !Number.isInteger(entry.rating) || entry.rating < 1 || entry.rating > 5 || entry.review.length < 12) {
      return bad(res, 400, "Please enter your name, a rating, and a review of at least 12 characters.");
    }
    const reviews = [entry, ...state.reviews];
    await setKey("reviews", reviews);
    void notify(submissionEmail("New review awaiting approval", entry, state.store));
    return send(res, 201, { message: "Thanks for sharing your experience. Your review has been submitted for approval." });
  } catch (error) {
    console.error(error);
    return bad(res, 500, "We couldn't complete that request. Please try again.");
  }
}
