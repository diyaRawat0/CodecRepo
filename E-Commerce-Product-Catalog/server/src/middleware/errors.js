export function notFound(req, res) {
  res.status(404).json({ success: false, message: "Route not found" });
}
export function errorHandler(err, req, res, next) {
  console.error(err);
  res
    .status(err.status || 500)
    .json({ success: false, message: err.message || "Something went wrong" });
}
export const fail = (message, status = 400) =>
  Object.assign(new Error(message), { status });
export const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);
