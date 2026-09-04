import { bad, json, readBody, text, email, phone, requestId, clientIp, submissionEmail, notify } from "../../lib/http.js";
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
      id: requestId("apt"),
      name: text(input.name, 80),
      phone: phone(input.phone),
      email: input.email ? email(input.email) : "",
      preferredDate: text(input.preferredDate, 20),
      preferredTime: text(input.preferredTime, 50),
      ageGroup: text(input.ageGroup, 30),
      message: text(input.message, 1600),
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    if (!entry.name || !entry.phone || (input.email && !entry.email) || !/^\d{4}-\d{2}-\d{2}$/.test(entry.preferredDate) || !entry.preferredTime || !entry.ageGroup) {
      return bad(400, "Please complete the required fields with a valid phone number and date.");
    }
    const appointments = [entry, ...state.appointments];
    await setKey(env, "appointments", appointments);
    context.waitUntil(notify(submissionEmail("New eye-test request", entry, state.store), env));
    return json({ message: "Your eye-test request has been received. We'll contact you to confirm your appointment." }, 201);
  } catch (error) {
    console.error(error);
    return bad(500, "We couldn't complete that request. Please try again.");
  }
}
