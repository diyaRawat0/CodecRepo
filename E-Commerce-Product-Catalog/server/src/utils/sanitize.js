export const cleanString = (value, max = 500) =>
  typeof value === "string"
    ? value.replace(/[<>]/g, "").trim().slice(0, max)
    : value;
export const cleanTags = (value) =>
  Array.isArray(value)
    ? value
        .map((tag) => cleanString(tag, 40))
        .filter(Boolean)
        .slice(0, 12)
    : [];
export const slugify = (value) =>
  cleanString(value, 80)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
export const id = (prefix) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
