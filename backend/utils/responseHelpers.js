// Shared response shapes, so controllers stay short and consistent (DRY).

export const sendValidationError = (res, message, errors) =>
  res.status(400).json({
    success: false,
    message,
    errors,
  });

export const sendNotFound = (res, message) =>
  res.status(404).json({
    success: false,
    message,
  });
