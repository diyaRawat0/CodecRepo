import { AppError } from "../middleware/errors.js";
export const clean = (value) =>
  typeof value === "string" ? value.trim() : value;
export const required = (value, label) => {
  if (value === undefined || value === null || clean(value) === "")
    throw new AppError(`${label} is required`);
  return clean(value);
};
export const id = (value, label) => {
  required(value, label);
  if (!/^[a-f0-9-]{10,}$/i.test(value))
    throw new AppError(`${label} is invalid`);
  return value;
};
export function email(value) {
  const normalized = required(value, "Email").toLowerCase();
  if (!/^([^\s@]+)@([^\s@]+)\.([^\s@]+)$/.test(normalized))
    throw new AppError("Email format is invalid");
  return normalized;
}
export const oneOf = (value, values, label) => {
  const cleaned = required(value, label);
  if (!values.includes(cleaned))
    throw new AppError(`${label} must be one of: ${values.join(", ")}`);
  return cleaned;
};
