import { bad, json, readBody, requireAdmin, text, productId } from "../../../lib/http.js";
import { getState, setKey } from "../../../lib/store.js";
import { uploadProductImage } from "../../../lib/storage.js";

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!(await requireAdmin(request, env))) return bad(401, "Your admin session has expired. Please sign in again.");
  try {
    const input = await readBody(request);
    const state = await getState(env);
    const name = text(input.name, 90);
    const shape = text(input.shape, 40);
    const material = text(input.material, 40);
    const color = text(input.color, 40);
    const ageGroup = text(input.ageGroup, 40);
    const description = text(input.description, 800);
    const category = text(input.category, 40);
    const availability = text(input.availability, 40) || "Ask in store";

    let image = null;
    if (input.imageData) {
      try {
        image = await uploadProductImage(env, input.imageData);
      } catch (uploadError) {
        return bad(400, uploadError.message);
      }
    }

    const product = {
      id: productId(name, state.products),
      name, category, ageGroup, shape, material, color,
      style: shape ? `${shape} frame` : "",
      description, availability,
      featured: false,
      imagePosition: "50% 50%",
      image,
    };
    const products = [...state.products, product];
    await setKey(env, "products", products);
    return json({ product }, 201);
  } catch (error) {
    console.error(error);
    return bad(500, "We couldn't complete that request. Please try again.");
  }
}
