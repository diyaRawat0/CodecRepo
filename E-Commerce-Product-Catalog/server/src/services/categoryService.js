import { categoryRepository } from "../repositories/categoryRepository.js";
import { productRepository } from "../repositories/productRepository.js";
import { cleanString, slugify, id } from "../utils/sanitize.js";
import { fail } from "../middleware/errors.js";
export function createCategory(input) {
  const name = cleanString(input.name, 80);
  if (!name) throw fail("Category name is required");
  if (categoryRepository.findAll().some((c) => c.slug === slugify(name)))
    throw fail("Category already exists", 409);
  return categoryRepository.create({
    id: id("cat"),
    name,
    description: cleanString(input.description, 300) || "",
    slug: slugify(name),
  });
}
export function updateCategory(category, input) {
  const name = cleanString(input.name ?? category.name, 80);
  if (!name) throw fail("Category name is required");
  return categoryRepository.update(category.id, {
    name,
    description: cleanString(input.description ?? category.description, 300),
    slug: slugify(name),
  });
}
export function deleteCategory(category) {
  if (productRepository.findAll().some((p) => p.categoryId === category.id))
    throw fail("Cannot delete a category used by products", 409);
  return categoryRepository.remove(category.id);
}
