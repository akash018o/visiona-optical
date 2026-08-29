import { bad, send, readBody, text, email, phone, requestId, clientIp, submissionEmail, notify } from "../lib/http.js";
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
      return bad(res, 400, "Please complete the required fields with a valid phone number and date.");
    }
    const appointments = [entry, ...state.appointments];
    await setKey("appointments", appointments);
    void notify(submissionEmail("New eye-test request", entry, state.store));
    return send(res, 201, { message: "Your eye-test request has been received. We'll contact you to confirm your appointment." });
  } catch (error) {
    console.error(error);
    return bad(res, 500, "We couldn't complete that request. Please try again.");
  }
}
