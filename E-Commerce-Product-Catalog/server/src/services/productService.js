import {
  findProducts,
  searchProducts,
  productRepository,
} from "../repositories/productRepository.js";
import { categoryRepository } from "../repositories/categoryRepository.js";
import { id } from "../utils/sanitize.js";
import { fail } from "../middleware/errors.js";
import { validateProduct } from "../validators/productValidator.js";
export function listProducts(params, source = null) {
  const page = Number(params.page || 1);
  const limit = Number(params.limit || 12);
  if (!Number.isInteger(page) || page < 1) throw fail("Invalid page");
  if (!Number.isInteger(limit) || limit < 1 || limit > 48)
    throw fail("Limit must be between 1 and 48");
  if (
    params.minPrice !== undefined &&
    (!Number.isFinite(Number(params.minPrice)) || Number(params.minPrice) < 0)
  )
    throw fail("Invalid minimum price");
  if (
    params.maxPrice !== undefined &&
    (!Number.isFinite(Number(params.maxPrice)) || Number(params.maxPrice) < 0)
  )
    throw fail("Invalid maximum price");
  if (
    params.minPrice !== undefined &&
    params.maxPrice !== undefined &&
    Number(params.minPrice) > Number(params.maxPrice)
  )
    throw fail("Minimum price cannot exceed maximum price");
  const all = source
    ? source
    : findProducts({
        ...params,
        minPrice:
          params.minPrice === undefined ? undefined : Number(params.minPrice),
        maxPrice:
          params.maxPrice === undefined ? undefined : Number(params.maxPrice),
      });
  const totalProducts = all.length;
  const products = all.slice((page - 1) * limit, page * limit);
  return {
    products,
    pagination: {
      page,
      limit,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
      hasNextPage: page * limit < totalProducts,
      hasPreviousPage: page > 1,
    },
  };
}
export function search(term, params) {
  return listProducts(params, searchProducts(term));
}
export function createProduct(input) {
  const product = validateProduct(input, categoryRepository.findAll());
  return productRepository.create({
    ...product,
    id: id("p"),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}
export function updateProduct(product, input) {
  const changes = validateProduct(input, categoryRepository.findAll(), true);
  return productRepository.update(product.id, {
    ...changes,
    updatedAt: new Date().toISOString(),
  });
}
