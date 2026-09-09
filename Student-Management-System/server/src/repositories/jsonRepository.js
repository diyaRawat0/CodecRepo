import { readCollection, writeCollection } from "../utils/jsonStore.js";
import crypto from "node:crypto";
export function createRepository(collection) {
  return {
    findAll: () => readCollection(collection),
    findById: async (id) =>
      (await readCollection(collection)).find((item) => item.id === id),
    create: async (data) => {
      const item = { id: crypto.randomUUID(), ...data };
      await writeCollection(collection, [
        ...(await readCollection(collection)),
        item,
      ]);
      return item;
    },
    update: async (id, data) => {
      const items = await readCollection(collection);
      const index = items.findIndex((item) => item.id === id);
      if (index < 0) return undefined;
      items[index] = { ...items[index], ...data };
      await writeCollection(collection, items);
      return items[index];
    },
    delete: async (id) => {
      const items = await readCollection(collection);
      const next = items.filter((item) => item.id !== id);
      await writeCollection(collection, next);
      return next.length !== items.length;
    },
  };
}
