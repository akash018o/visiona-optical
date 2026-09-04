import { bad, json, readBody, requireAdmin, text, requestId } from "../../../lib/http.js";
import { getState, setKey } from "../../../lib/store.js";
import { uploadGalleryImage } from "../../../lib/storage.js";

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!(await requireAdmin(request, env))) return bad(401, "Your admin session has expired. Please sign in again.");
  try {
    const input = await readBody(request);
    if (!input.imageData) return bad(400, "Please choose a photo to upload.");

    let image;
    try {
      image = await uploadGalleryImage(env, input.imageData);
    } catch (uploadError) {
      return bad(400, uploadError.message);
    }

    const entry = {
      id: requestId("gal"),
      image,
      title: text(input.title, 90),
      description: text(input.description, 400),
      category: text(input.category, 40),
      createdAt: new Date().toISOString(),
    };

    const state = await getState(env);
    const gallery = [entry, ...state.gallery];
    await setKey(env, "gallery", gallery);
    return json({ item: entry }, 201);
  } catch (error) {
    console.error(error);
    return bad(500, "We couldn't complete that request. Please try again.");
  }
}
