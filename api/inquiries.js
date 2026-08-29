import { bad, send, readBody, text, email, phone, requestId, clientIp, submissionEmail, notify } from "../lib/http.js";
import { getState, setKey, checkRateLimit } from "../lib/store.js";
import { INQUIRY_TYPES } from "../public/config/store.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return bad(res, 405, "Method not allowed.");
  try {
    if (!(await checkRateLimit(clientIp(req)))) {
      return bad(res, 429, "Too many submissions from this connection. Please wait a few minutes and try again.");
    }
    const input = await readBody(req);
    const state = await getState();
    const entry = {
      id: requestId("inq"),
      name: text(input.name, 80),
      phone: phone(input.phone),
      email: email(input.email),
      type: text(input.type, 60),
      product: text(input.product, 120),
      message: text(input.message, 2000),
      status: "new",
      createdAt: new Date().toISOString(),
    };
    if (!entry.name || !entry.phone || !entry.email || !entry.message || !INQUIRY_TYPES.includes(entry.type)) {
      return bad(res, 400, "Please enter a name, valid phone and email, inquiry type, and message.");
    }
    const inquiries = [entry, ...state.inquiries];
    await setKey("inquiries", inquiries);
    void notify(submissionEmail("New website inquiry", entry, state.store));
    return send(res, 201, { message: "Thanks! Your inquiry has been received. Our team will contact you soon." });
  } catch (error) {
    console.error(error);
    return bad(res, 500, "We couldn't complete that request. Please try again.");
  }
}
