import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../data",
);
const defaults = {
  students: [],
  departments: [],
  courses: [],
  enrollments: [],
};
export async function ensureData() {
  await fs.mkdir(root, { recursive: true });
  for (const [name, value] of Object.entries(defaults)) {
    const file = path.join(root, `${name}.json`);
    try {
      JSON.parse(await fs.readFile(file, "utf8"));
    } catch {
      await fs.writeFile(file, JSON.stringify(value, null, 2));
    }
  }
}
export async function readCollection(name) {
  await ensureData();
  return JSON.parse(await fs.readFile(path.join(root, `${name}.json`), "utf8"));
}
export async function writeCollection(name, value) {
  await ensureData();
  await fs.writeFile(
    path.join(root, `${name}.json`),
    JSON.stringify(value, null, 2),
  );
  return value;
}
