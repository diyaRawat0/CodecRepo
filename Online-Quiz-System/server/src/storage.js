import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const DATA = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../data",
);
export async function readJson(file) {
  try {
    return JSON.parse(await fs.readFile(path.join(DATA, file), "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}
export async function writeJson(file, value) {
  const target = path.join(DATA, file);
  const temp = `${target}.tmp`;
  await fs.writeFile(temp, JSON.stringify(value, null, 2));
  await fs.rename(temp, target);
  return value;
}
export function repository(file) {
  return {
    all: () => readJson(file),
    findById: async (id) =>
      (await readJson(file)).find((item) => item.id === id),
    find: async (predicate) => (await readJson(file)).filter(predicate),
    insert: async (item) => {
      const values = await readJson(file);
      values.push(item);
      await writeJson(file, values);
      return item;
    },
    update: async (id, patch) => {
      const values = await readJson(file);
      const index = values.findIndex((item) => item.id === id);
      if (index < 0) return null;
      values[index] = {
        ...values[index],
        ...patch,
        updatedAt: new Date().toISOString(),
      };
      await writeJson(file, values);
      return values[index];
    },
    remove: async (id) => {
      const values = await readJson(file);
      const next = values.filter((item) => item.id !== id);
      await writeJson(file, next);
      return next.length !== values.length;
    },
  };
}
export const users = repository("users.json");
export const quizzes = repository("quizzes.json");
export const questions = repository("questions.json");
export const attempts = repository("attempts.json");
