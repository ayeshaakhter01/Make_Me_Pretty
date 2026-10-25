
const errorMiddleware = (err, req, res, next) => {
  // Do not serialize request bodies, provider responses, or arbitrary error
  // messages into logs; payment callbacks can contain sensitive data.
  const diagnosticFrames = process.env.NODE_ENV === "production" || typeof err?.stack !== "string"
    ? undefined
    : err.stack.split("\n").slice(1, 4).map((frame) => frame.trim());
  console.error("API request failed", {
    name: typeof err?.name === "string" ? err.name : "Error",
    code: typeof err?.code === "number" || typeof err?.code === "string" ? err.code : undefined,
    statusCode: Number.isInteger(err?.statusCode) ? err.statusCode : 500,
    method: req.method,
    path: req.path,
    ...(diagnosticFrames?.length ? { stack: diagnosticFrames } : {}),
  });

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "A record with this value already exists",
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format",
    });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Database validation failed",
    });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message:
      err.statusCode && err.statusCode < 500
        ? err.message
        : "Internal server error",
  });
};

export default errorMiddleware;
