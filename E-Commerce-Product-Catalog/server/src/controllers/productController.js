import { productRepository } from "../repositories/productRepository.js";
import { categoryRepository } from "../repositories/categoryRepository.js";
import * as service from "../services/productService.js";
import { cleanString } from "../utils/sanitize.js";
import { fail } from "../middleware/errors.js";
const get = (id) => {
  const product = productRepository.findById(id);
  if (!product) throw fail("Product not found", 404);
  return product;
};
export function list(req, res) {
  const result =
    req.path === "/search"
      ? service.search(cleanString(req.query.q, 80), req.query)
      : service.listProducts(req.query);
  if (req.path === "/search" && !cleanString(req.query.q, 80))
    throw fail("Search query is required");
  res.json({ success: true, data: result });
}
export function detail(req, res) {
  res.json({ success: true, data: get(req.params.id) });
}
export async function create(req, res) {
  const product = await service.createProduct(req.body);
  res.status(201).json({ success: true, data: product });
}
export async function update(req, res) {
  const product = await service.updateProduct(get(req.params.id), req.body);
  res.json({ success: true, data: product });
}
export async function remove(req, res) {
  await productRepository.remove(get(req.params.id).id);
  res.status(204).send();
}
export function brands(req, res) {
  res.json({
    success: true,
    data: [...new Set(productRepository.findAll().map((p) => p.brand))].sort(),
  });
}
export function stats(req, res) {
  const products = productRepository.findAll();
  res.json({
    success: true,
    data: {
      totalProducts: products.length,
      inStock: products.filter((p) => p.availability === "in-stock").length,
      outOfStock: products.filter((p) => p.availability === "out-of-stock")
        .length,
    },
  });
}
