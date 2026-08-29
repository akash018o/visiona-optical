import { bad, send, readBody, requireAdmin, text, requestId } from "../../lib/http.js";
import { getState, setKey } from "../../lib/store.js";
import { uploadGalleryImage } from "../../lib/storage.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return bad(res, 405, "Method not allowed.");
  if (!requireAdmin(req, res)) return;
  try {
    const input = await readBody(req);
    if (!input.imageData) return bad(res, 400, "Please choose a photo to upload.");

    let image;
    try {
      image = await uploadGalleryImage(input.imageData);
    } catch (uploadError) {
      return bad(res, 400, uploadError.message);
    }

    // Only the photo itself is required — title, description, and category
    // are all genuinely optional, left blank if the owner doesn't fill them.
    const entry = {
      id: requestId("gal"),
      image,
      title: text(input.title, 90),
      description: text(input.description, 400),
      category: text(input.category, 40),
      createdAt: new Date().toISOString(),
    };

    const state = await getState();
    const gallery = [entry, ...state.gallery];
    await setKey("gallery", gallery);
    return send(res, 201, { item: entry });
  } catch (error) {
    console.error(error);
    return bad(res, 500, "We couldn't complete that request. Please try again.");
  }
}
