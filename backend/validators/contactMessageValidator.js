import { CONTACT_MESSAGE_STATUSES } from "../models/ContactMessage.js";
import { findUnknownFields, isNonEmptyString, isPlainObject } from "../utils/validationHelpers.js";

const SUBMISSION_FIELDS = ["name", "email", "phone", "subject", "message", "website"];

export function validateContactMessageSubmission(data) {
  const errors = [];
  if (!isPlainObject(data)) return { isValid: false, errors: ["Contact message must be an object"] };

  const unknown = findUnknownFields(data, SUBMISSION_FIELDS);
  if (unknown.length) errors.push(`Unsupported fields: ${unknown.join(", ")}`);

  if (!isNonEmptyString(data.name) || data.name.trim().length > 80) errors.push("Name is required and must be 80 characters or fewer");
  if (!isNonEmptyString(data.email) || data.email.trim().length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) errors.push("A valid email address is required");
  if (data.phone !== undefined && (typeof data.phone !== "string" || data.phone.trim().length > 30 || (data.phone.trim() && !/^\+?[0-9\s().-]{7,30}$/.test(data.phone.trim())))) errors.push("Phone must contain 7 to 30 valid phone characters");
  if (data.subject !== undefined && (typeof data.subject !== "string" || data.subject.trim().length > 120)) errors.push("Subject must be 120 characters or fewer");
  if (!isNonEmptyString(data.message) || data.message.trim().length < 10 || data.message.trim().length > 3000) errors.push("Message must be between 10 and 3000 characters");
  if (data.website !== undefined && typeof data.website !== "string") errors.push("Invalid form data");

  return { isValid: errors.length === 0, errors };
}

export function validateContactMessageStatus(data) {
  const errors = [];
  if (!isPlainObject(data)) return { isValid: false, errors: ["Status update must be an object"] };
  const unknown = findUnknownFields(data, ["status"]);
  if (unknown.length) errors.push(`Unsupported fields: ${unknown.join(", ")}`);
  if (!CONTACT_MESSAGE_STATUSES.includes(data.status)) errors.push(`Status must be one of: ${CONTACT_MESSAGE_STATUSES.join(", ")}`);
  return { isValid: errors.length === 0, errors };
}
