import { categoryRepository } from "../repositories/categoryRepository.js";
import * as service from "../services/categoryService.js";
import { fail } from "../middleware/errors.js";
const get = (id) => {
  const category = categoryRepository.findById(id);
  if (!category) throw fail("Category not found", 404);
  return category;
};
export function list(req, res) {
  res.json({ success: true, data: categoryRepository.findAll() });
}
export function detail(req, res) {
  res.json({ success: true, data: get(req.params.id) });
}
export async function create(req, res) {
  res
    .status(201)
    .json({ success: true, data: await service.createCategory(req.body) });
}
export async function update(req, res) {
  res.json({
    success: true,
    data: await service.updateCategory(get(req.params.id), req.body),
  });
}
export async function remove(req, res) {
  await service.deleteCategory(get(req.params.id));
  res.status(204).send();
}
