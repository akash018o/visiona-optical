import { bad, send, readBody, requireAdmin, text } from "../../lib/http.js";
import { getState, setKey } from "../../lib/store.js";
import { uploadProductImage } from "../../lib/storage.js";

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
    const availability = text(input.availability, 40) || "Ask in store";

    let image = null;
    if (input.imageData) {
      try {
        image = await uploadProductImage(input.imageData);
      } catch (uploadError) {
        return bad(res, 400, uploadError.message);
      }
    }

    const product = {
      id: productId(name, state.products),
      name,
      category,
      ageGroup,
      shape,
      material,
      color,
      style: shape ? `${shape} frame` : "",
      description,
      availability,
      featured: false,
      imagePosition: "50% 50%",
      image,
    };
    const products = [...state.products, product];
    await setKey("products", products);
    return send(res, 201, { product });
  } catch (error) {
    console.error(error);
    return bad(res, 500, "We couldn't complete that request. Please try again.");
  }
}

function productId(name, products) {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "frame";
  let id = base;
  let counter = 2;
  while (products.some((product) => product.id === id)) id = `${base}-${counter++}`;
  return id;
}
