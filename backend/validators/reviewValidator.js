import { REVIEW_STATUSES } from "../models/Review.js";
import {
  isPlainObject,
  isNonEmptyString,
  isObjectIdString,
  findUnknownFields,
  getImageSourceError,
} from "../utils/validationHelpers.js";

// What a customer sends. customer and customerName come from the login token,
// and status is always "pending", so they are NOT accepted here.
const SUBMISSION_FIELDS = ["product", "rating", "title", "text", "image"];

export const validateReviewSubmission = (reviewData) => {
  const errors = [];

  if (!isPlainObject(reviewData)) {
    return { isValid: false, errors: ["Review data must be an object"] };
  }

  const unknownFields = findUnknownFields(reviewData, SUBMISSION_FIELDS);

  if (unknownFields.length > 0) {
    errors.push(`Unsupported fields: ${unknownFields.join(", ")}`);
  }

  if (!isObjectIdString(reviewData.product)) {
    errors.push("product must be a valid product id");
  }

  if (
    !Number.isInteger(reviewData.rating) ||
    reviewData.rating < 1 ||
    reviewData.rating > 5
  ) {
    errors.push("Rating must be a whole number from 1 to 5");
  }

  if (!isNonEmptyString(reviewData.text)) {
    errors.push("Review text is required");
  } else if (reviewData.text.trim().length < 10) {
    errors.push("Review text must be at least 10 characters");
  } else if (reviewData.text.trim().length > 1000) {
    errors.push("Review text must be 1000 characters or fewer");
  }

  if (reviewData.title !== undefined) {
    if (typeof reviewData.title !== "string" || reviewData.title.length > 80) {
      errors.push("Title must be a string of 80 characters or fewer");
    }
  }

  // An empty string means "no photo".
  if (reviewData.image !== undefined && reviewData.image !== "") {
    const imageError = getImageSourceError(reviewData.image, "Image");
    if (imageError) errors.push(imageError);
  }

  return { isValid: errors.length === 0, errors };
};

// What an admin sends to approve or reject a review.
export const validateReviewModeration = (data) => {
  const errors = [];

  if (!isPlainObject(data)) {
    return { isValid: false, errors: ["Moderation data must be an object"] };
  }

  const unknownFields = findUnknownFields(data, ["status"]);

  if (unknownFields.length > 0) {
    errors.push(`Unsupported fields: ${unknownFields.join(", ")}`);
  }

  if (!REVIEW_STATUSES.includes(data.status)) {
    errors.push(`Status must be one of: ${REVIEW_STATUSES.join(", ")}`);
  }

  return { isValid: errors.length === 0, errors };
};
