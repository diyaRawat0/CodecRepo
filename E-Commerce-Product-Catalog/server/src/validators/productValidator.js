import { cleanString, cleanTags } from "../utils/sanitize.js";
const availability = ["in-stock", "out-of-stock", "pre-order"];
export function validateProduct(input, categories, partial = false) {
  const data = { ...input };
  if (!partial || input.name !== undefined) {
    data.name = cleanString(input.name, 100);
    if (!data.name || data.name.length < 2)
      throw new Error("Name is required and must be at least 2 characters");
  }
  if (!partial || input.description !== undefined) {
    data.description = cleanString(input.description, 700);
    if (!data.description) throw new Error("Description is required");
  }
  if (!partial || input.price !== undefined) {
    data.price = Number(input.price);
    if (!Number.isFinite(data.price) || data.price <= 0)
      throw new Error("Price must be a positive number");
  }
  if (!partial || input.stock !== undefined) {
    data.stock = Number(input.stock);
    if (!Number.isInteger(data.stock) || data.stock < 0)
      throw new Error("Stock must be a non-negative integer");
  }
  if (!partial || input.categoryId !== undefined) {
    if (!categories.some((category) => category.id === input.categoryId))
      throw new Error("Category does not exist");
  }
  if (!partial || input.availability !== undefined) {
    if (!availability.includes(input.availability))
      throw new Error("Invalid availability");
  }
  if (input.rating !== undefined) {
    data.rating = Number(input.rating);
    if (!Number.isFinite(data.rating) || data.rating < 0 || data.rating > 5)
      throw new Error("Rating must be between 0 and 5");
  }
  if (input.brand !== undefined) data.brand = cleanString(input.brand, 60);
  if (input.image !== undefined) data.image = cleanString(input.image, 500);
  if (input.tags !== undefined) data.tags = cleanTags(input.tags);
  return data;
}
