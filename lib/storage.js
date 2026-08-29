import { supabaseAdmin } from "./supabase.js";

const MAX_BYTES = 4_000_000;

async function uploadImage(dataUrl, bucket) {
  const match = /^data:image\/(png|jpe?g|webp);base64,([a-zA-Z0-9+/=]+)$/.exec(dataUrl || "");
  if (!match) throw new Error("Please upload a JPEG, PNG, or WEBP photo.");
  const [, extRaw, base64] = match;
  const ext = extRaw === "jpg" ? "jpeg" : extRaw;
  const buffer = Buffer.from(base64, "base64");
  if (buffer.length > MAX_BYTES) throw new Error("That photo is too large. Please use one under 4MB.");

  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const sb = supabaseAdmin();
  const { error } = await sb.storage.from(bucket).upload(path, buffer, {
    contentType: `image/${ext}`,
    upsert: false,
  });
  if (error) {
    console.error(error);
    throw new Error("We couldn't upload that photo. Please try again.");
  }
  return sb.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

// Best-effort cleanup so replaced/deleted photos don't pile up forever in
// storage. Never throws — a failed cleanup shouldn't block the save/delete.
async function deleteImage(url, bucket) {
  if (!url) return;
  const marker = `/${bucket}/`;
  const index = url.indexOf(marker);
  if (index === -1) return;
  const path = decodeURIComponent(url.slice(index + marker.length));
  try {
    await supabaseAdmin().storage.from(bucket).remove([path]);
  } catch (error) {
    console.error("Image cleanup failed:", error.message);
  }
}

export const uploadProductImage = (dataUrl) => uploadImage(dataUrl, "product-images");
export const deleteProductImage = (url) => deleteImage(url, "product-images");
export const uploadGalleryImage = (dataUrl) => uploadImage(dataUrl, "gallery-images");
export const deleteGalleryImage = (url) => deleteImage(url, "gallery-images");
