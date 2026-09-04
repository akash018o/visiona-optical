import { bad, json, readBody, text, email, phone, requestId, clientIp, submissionEmail, notify } from "../../lib/http.js";
import { getState, setKey, checkRateLimit } from "../../lib/store.js";
import { INQUIRY_TYPES } from "../../public/config/store.js";

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    if (!(await checkRateLimit(env, clientIp(request)))) {
      return bad(429, "Too many submissions from this connection. Please wait a few minutes and try again.");
    }
    const input = await readBody(request);
    const state = await getState(env);
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
      return bad(400, "Please enter a name, valid phone and email, inquiry type, and message.");
    }
    const inquiries = [entry, ...state.inquiries];
    await setKey(env, "inquiries", inquiries);
    context.waitUntil(notify(submissionEmail("New website inquiry", entry, state.store), env));
    return json({ message: "Thanks! Your inquiry has been received. Our team will contact you soon." }, 201);
  } catch (error) {
    console.error(error);
    return bad(500, "We couldn't complete that request. Please try again.");
  }
}
