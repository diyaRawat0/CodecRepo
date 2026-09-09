export class AppError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}
export function notFound(req, res) {
  res
    .status(404)
    .json({
      success: false,
      message: `Route ${req.method} ${req.originalUrl} not found`,
    });
}
export function errorHandler(error, req, res, next) {
  console.error(error);
  res
    .status(error.status || 500)
    .json({
      success: false,
      message: error.status ? error.message : "Internal server error",
    });
}
