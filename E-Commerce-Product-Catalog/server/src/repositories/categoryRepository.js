import { JsonRepository } from "./jsonRepository.js";
export const categoryRepository = new JsonRepository("categories.json");
export async function initCategories() {
  await categoryRepository.init(["slug"]);
}
