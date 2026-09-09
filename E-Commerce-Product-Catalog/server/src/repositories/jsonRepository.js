import fs from "node:fs/promises";
import path from "node:path";

export class JsonRepository {
  constructor(fileName) {
    this.filePath = path.join(process.cwd(), "src", "data", fileName);
    this.items = [];
    this.indexes = new Map();
  }
  async init(indexFields = []) {
    this.items = JSON.parse(await fs.readFile(this.filePath, "utf8"));
    this.rebuildIndexes(indexFields);
  }
  rebuildIndexes(fields = []) {
    this.indexes.clear();
    for (const field of fields) {
      const index = new Map();
      for (const item of this.items) {
        const values = Array.isArray(item[field]) ? item[field] : [item[field]];
        values.forEach((value) =>
          index.set(value, [...(index.get(value) || []), item.id]),
        );
      }
      this.indexes.set(field, index);
    }
  }
  async persist() {
    await fs.writeFile(this.filePath, JSON.stringify(this.items, null, 2));
  }
  findById(id) {
    return this.items.find((item) => item.id === id) || null;
  }
  findAll() {
    return [...this.items];
  }
  async create(item) {
    this.items.push(item);
    await this.persist();
    return item;
  }
  async update(id, changes) {
    const index = this.items.findIndex((item) => item.id === id);
    if (index < 0) return null;
    this.items[index] = { ...this.items[index], ...changes };
    await this.persist();
    return this.items[index];
  }
  async remove(id) {
    const index = this.items.findIndex((item) => item.id === id);
    if (index < 0) return false;
    this.items.splice(index, 1);
    await this.persist();
    return true;
  }
}
