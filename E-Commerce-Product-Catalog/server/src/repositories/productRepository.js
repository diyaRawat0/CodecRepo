import { JsonRepository } from "./jsonRepository.js";

export const productRepository = new JsonRepository("products.json");
export async function initProducts() {
  await productRepository.init(["categoryId", "brand", "availability"]);
}
export function findProducts(query) {
  let products = productRepository.findAll();
  if (query.category)
    products = products.filter((p) => p.categoryId === query.category);
  if (query.brand) products = products.filter((p) => p.brand === query.brand);
  if (query.availability)
    products = products.filter((p) => p.availability === query.availability);
  if (query.minPrice !== undefined)
    products = products.filter((p) => p.price >= query.minPrice);
  if (query.maxPrice !== undefined)
    products = products.filter((p) => p.price <= query.maxPrice);
  if (query.sort === "price_asc") products.sort((a, b) => a.price - b.price);
  if (query.sort === "price_desc") products.sort((a, b) => b.price - a.price);
  if (query.sort === "rating") products.sort((a, b) => b.rating - a.rating);
  if (query.sort === "newest")
    products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return products;
}
export function searchProducts(term) {
  const q = term.toLowerCase();
  return productRepository
    .findAll()
    .filter((p) =>
      [p.name, p.description, p.brand, ...p.tags]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
}
