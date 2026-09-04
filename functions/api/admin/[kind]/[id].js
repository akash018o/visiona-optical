import { bad, json, readBody, requireAdmin, validStatus, text } from "../../../../lib/http.js";
import { getState, setKey } from "../../../../lib/store.js";
import { uploadProductImage, deleteProductImage, uploadGalleryImage, deleteGalleryImage } from "../../../../lib/storage.js";

// Consolidates what would otherwise be several separate route files into
// one, matching the same pattern used on Vercel to stay under function-count
// limits (Cloudflare's free tier doesn't have this limit, but there's no
// reason to split it back apart — this works cleanly either way).
// Handles: /api/admin/{inquiries|appointments|reviews|products|services|gallery}/{id}

const STATUS_BY_KIND = {
  inquiries: ["new", "contacted", "resolved"],
  appointments: ["pending", "contacted", "confirmed", "completed", "cancelled"],
  reviews: ["pending", "approved", "rejected"],
};
const KNOWN_KINDS = ["inquiries", "appointments", "reviews", "products", "services", "gallery"];
const DELETABLE_KINDS = ["reviews", "products", "gallery"];
const PRODUCT_TEXT_FIELDS = { name: 90, category: 40, ageGroup: 40, shape: 40, material: 40, color: 40, description: 800, availability: 40 };
const GALLERY_TEXT_FIELDS = { title: 90, description: 400, category: 40 };

async function handlePatch(context, kind, id) {
  const { request, env } = context;
  const state = await getState(env);
  const list = state[kind];
  const item = list.find((entry) => entry.id === id);
  if (!item) return bad(404, "Not found.");
  const input = await readBody(request);

  if (kind === "products") {
    for (const [field, maxLength] of Object.entries(PRODUCT_TEXT_FIELDS)) {
      if (typeof input[field] === "string") item[field] = text(input[field], maxLength);
    }
    item.style = item.shape ? `${item.shape} frame` : "";
    if (typeof input.featured === "boolean") item.featured = input.featured;
    if (input.imageData) {
      try {
        const newImage = await uploadProductImage(env, input.imageData);
        const oldImage = item.image;
        item.image = newImage;
        context.waitUntil(deleteProductImage(env, oldImage));
      } catch (uploadError) {
        return bad(400, uploadError.message);
      }
    }
  } else if (kind === "services") {
    if (typeof input.enabled !== "boolean") return bad(400, "Invalid service visibility.");
    item.enabled = input.enabled;
  } else if (kind === "gallery") {
    for (const [field, maxLength] of Object.entries(GALLERY_TEXT_FIELDS)) {
      if (typeof input[field] === "string") item[field] = text(input[field], maxLength);
    }
    if (input.imageData) {
      try {
        const newImage = await uploadGalleryImage(env, input.imageData);
        const oldImage = item.image;
        item.image = newImage;
        context.waitUntil(deleteGalleryImage(env, oldImage));
      } catch (uploadError) {
        return bad(400, uploadError.message);
      }
    }
  } else {
    const status = validStatus(input.status, STATUS_BY_KIND[kind]);
    if (!status) return bad(400, "Invalid status.");
    item.status = status;
  }

  await setKey(env, kind, list);
  return json({ item });
}

async function handleDelete(context, kind, id) {
  const { env } = context;
  if (!DELETABLE_KINDS.includes(kind)) return bad(405, "Method not allowed.");
  const state = await getState(env);
  const list = state[kind];
  const index = list.findIndex((entry) => entry.id === id);
  if (index < 0) return bad(404, "Not found.");
  const [removed] = list.splice(index, 1);
  await setKey(env, kind, list);
  if (kind === "products" && removed.image) context.waitUntil(deleteProductImage(env, removed.image));
  if (kind === "gallery" && removed.image) context.waitUntil(deleteGalleryImage(env, removed.image));
  return json({ message: "Deleted." });
}

async function guard(context) {
  const { request, env, params } = context;
  if (!(await requireAdmin(request, env))) return bad(401, "Your admin session has expired. Please sign in again.");
  if (!KNOWN_KINDS.includes(params.kind)) return bad(404, "Unknown resource.");
  return null;
}

export async function onRequestPatch(context) {
  const guardResponse = await guard(context);
  if (guardResponse) return guardResponse;
  try {
    return await handlePatch(context, context.params.kind, context.params.id);
  } catch (error) {
    console.error(error);
    return bad(500, "We couldn't complete that request. Please try again.");
  }
}

export async function onRequestDelete(context) {
  const guardResponse = await guard(context);
  if (guardResponse) return guardResponse;
  try {
    return await handleDelete(context, context.params.kind, context.params.id);
  } catch (error) {
    console.error(error);
    return bad(500, "We couldn't complete that request. Please try again.");
  }
}
