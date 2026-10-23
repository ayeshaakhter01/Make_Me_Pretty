import { COUPON_TYPES } from "../utils/couponCalculator.js";
import {
  isPlainObject,
  isNonEmptyString,
  findUnknownFields,
} from "../utils/validationHelpers.js";

const ALLOWED_FIELDS = [
  "code",
  "type",
  "value",
  "active",
  "note",
  "minOrderAmount",
  "expiresAt",
  "usageLimit",
];

const CODE_PATTERN = /^[A-Z0-9_-]{3,20}$/;

// Used by the validator and also by the service (after merging an update).
// Returns an error message, or null when the value fits the coupon type.
export const validateCouponValueForType = (type, value) => {
  if (type === "percent") {
    if (!Number.isInteger(value) || value < 1 || value > 100) {
      return "Percent coupons need a whole number value from 1 to 100";
    }
  }

  if (type === "fixed") {
    if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
      return "Fixed coupons need a value greater than 0";
    }
  }

  return null;
};

const validateCoupon = (couponData, isUpdate = false) => {
  const errors = [];

  if (!isPlainObject(couponData)) {
    return { isValid: false, errors: ["Coupon data must be an object"] };
  }

  const unknownFields = findUnknownFields(couponData, ALLOWED_FIELDS);

  if (unknownFields.length > 0) {
    errors.push(`Unsupported fields: ${unknownFields.join(", ")}`);
  }

  if (
    isUpdate &&
    !Object.keys(couponData).some((field) => ALLOWED_FIELDS.includes(field))
  ) {
    errors.push("Provide at least one field to update");
  }

  // code
  if (!isUpdate || couponData.code !== undefined) {
    if (
      !isNonEmptyString(couponData.code) ||
      !CODE_PATTERN.test(couponData.code.trim().toUpperCase())
    ) {
      errors.push(
        "Code must be 3-20 characters: letters, numbers, hyphen or underscore"
      );
    }
  }

  // type
  if (!isUpdate || couponData.type !== undefined) {
    if (!COUPON_TYPES.includes(couponData.type)) {
      errors.push(`Type must be one of: ${COUPON_TYPES.join(", ")}`);
    }
  }

  // value
  if (COUPON_TYPES.includes(couponData.type)) {
    // Type is in this request, so we can check the value against it.
    const valueError = validateCouponValueForType(
      couponData.type,
      couponData.value
    );

    if (valueError) {
      errors.push(valueError);
    }
  } else if (
    couponData.value !== undefined &&
    (typeof couponData.value !== "number" ||
      !Number.isFinite(couponData.value) ||
      couponData.value < 0)
  ) {
    // Update without a type: the service checks the value against the saved type.
    errors.push("Value must be a number that is 0 or more");
  }

  if (couponData.active !== undefined && typeof couponData.active !== "boolean") {
    errors.push("Active must be true or false");
  }

  if (couponData.note !== undefined) {
    if (typeof couponData.note !== "string" || couponData.note.length > 200) {
      errors.push("Note must be a string of 200 characters or fewer");
    }
  }

  if (
    couponData.minOrderAmount !== undefined &&
    (typeof couponData.minOrderAmount !== "number" ||
      !Number.isFinite(couponData.minOrderAmount) ||
      couponData.minOrderAmount < 0)
  ) {
    errors.push("Minimum order amount must be a number that is 0 or more");
  }

  if (couponData.expiresAt !== undefined && couponData.expiresAt !== null) {
    const time =
      typeof couponData.expiresAt === "string"
        ? Date.parse(couponData.expiresAt)
        : NaN;

    if (Number.isNaN(time)) {
      errors.push("Expiry date must be a valid date, or null for no expiry");
    } else if (!isUpdate && time <= Date.now()) {
      errors.push("Expiry date must be in the future");
    }
  }

  if (couponData.usageLimit !== undefined && couponData.usageLimit !== null) {
    if (!Number.isInteger(couponData.usageLimit) || couponData.usageLimit < 1) {
      errors.push("Usage limit must be a whole number of 1 or more, or null");
    }
  }

  return { isValid: errors.length === 0, errors };
};

// For POST /api/coupons/validate (called by checkout).
export const validateCouponCheck = (data) => {
  const errors = [];

  if (!isPlainObject(data)) {
    return { isValid: false, errors: ["Request data must be an object"] };
  }

  const unknownFields = findUnknownFields(data, [
    "code",
    "subtotal",
    "deliveryCharge",
  ]);

  if (unknownFields.length > 0) {
    errors.push(`Unsupported fields: ${unknownFields.join(", ")}`);
  }

  if (!isNonEmptyString(data.code)) {
    errors.push("code must be a non-empty string");
  }

  if (
    typeof data.subtotal !== "number" ||
    !Number.isFinite(data.subtotal) ||
    data.subtotal < 0
  ) {
    errors.push("subtotal must be a number that is 0 or more");
  }

  if (
    data.deliveryCharge !== undefined &&
    (typeof data.deliveryCharge !== "number" ||
      !Number.isFinite(data.deliveryCharge) ||
      data.deliveryCharge < 0)
  ) {
    errors.push("deliveryCharge must be a number that is 0 or more");
  }

  return { isValid: errors.length === 0, errors };
};

export default validateCoupon;
