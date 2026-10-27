export function errorHandler(err, req, res, next) {
  // Catch bad JSON bodies from express.json()
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      message: "Malformed JSON payload in request body",
    });
  }

  // Catch payload too large (e.g. > 1mb)
  if (err.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message: "Request payload exceeds size limit",
    });
  }

  // Log error safely without leaking sensitive details
  console.error("[ServerError]", {
    message: err.message,
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Database unavailable handler
  if (err.message && (err.message.includes("Database not connected") || err.name === "MongoServerSelectionError")) {
    return res.status(503).json({
      success: false,
      message: "Database service is currently unavailable",
    });
  }

  const statusCode = err.statusCode || 500;
  const message =
    statusCode === 500
      ? "An unexpected internal server error occurred"
      : err.message;

  return res.status(statusCode).json({
    success: false,
    message,
  });
}
