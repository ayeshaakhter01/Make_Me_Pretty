// Small reusable checks used by the validators (DRY).

export const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

export const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

export const findUnknownFields = (data, allowedFields) =>
  Object.keys(data).filter((field) => !allowedFields.includes(field));

export const isObjectIdString = (value) =>
  typeof value === "string" && /^[a-f\d]{24}$/i.test(value);

// Images are stored as a URL or a path, never as a huge base64 string.
// Returns an error message, or null when the value is fine.
export const getImageSourceError = (value, label = "Image") => {
  if (!isNonEmptyString(value)) {
    return `${label} must be a non-empty string`;
  }

  const source = value.trim();

  if (source.startsWith("data:")) {
    return `${label} must be a URL or a path, not an embedded base64 image`;
  }

  if (source.length > 2048) {
    return `${label} is too long`;
  }

  if (!source.startsWith("/") && !/^https?:\/\//i.test(source)) {
    return `${label} must start with / or http(s)://`;
  }

  return null;
};
