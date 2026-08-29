import { bad, send, readBody, requireAdmin, text, productId } from "../../lib/http.js";
import { getState, setKey } from "../../lib/store.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return bad(res, 405, "Method not allowed.");
  if (!requireAdmin(req, res)) return;
  try {
    const input = await readBody(req);
    const state = await getState();
    const name = text(input.name, 90);
    const shape = text(input.shape, 40);
    const material = text(input.material, 40);
    const color = text(input.color, 40);
    const ageGroup = text(input.ageGroup, 40);
    const description = text(input.description, 800);
    const category = text(input.category, 40);
    if (!name || !shape || !material || !color || !ageGroup || !description || !category) {
      return bad(res, 400, "Please complete every product field.");
    }
    const product = {
      id: productId(name, state.products),
      name,
      category,
      ageGroup,
      shape,
      material,
      color,
      style: `${shape} frame`,
      description,
      availability: "Ask in store",
      featured: false,
      imagePosition: "50% 50%",
    };
    const products = [...state.products, product];
    await setKey("products", products);
    return send(res, 201, { product });
  } catch (error) {
    console.error(error);
    return bad(res, 500, "We couldn't complete that request. Please try again.");
  }
}
