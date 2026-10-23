// An error with an HTTP status code.
// errorMiddleware shows err.message to the client when statusCode is below 500.
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
  }
}

export default AppError;
