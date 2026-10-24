import { BANNER_TYPES, BANNER_PLACEMENTS } from "../models/Banner.js";
import {
  isPlainObject,
  findUnknownFields,
  getImageSourceError,
} from "../utils/validationHelpers.js";

const ALLOWED_FIELDS = [
  "title",
  "subtitle",
  "type",
  "placement",
  "pagePath",
  "src",
  "href",
  "active",
  "order",
];

const validateBanner = (bannerData, isUpdate = false) => {
  const errors = [];

  if (!isPlainObject(bannerData)) {
    return { isValid: false, errors: ["Banner data must be an object"] };
  }

  const unknownFields = findUnknownFields(bannerData, ALLOWED_FIELDS);

  if (unknownFields.length > 0) {
    errors.push(`Unsupported fields: ${unknownFields.join(", ")}`);
  }

  if (
    isUpdate &&
    !Object.keys(bannerData).some((field) => ALLOWED_FIELDS.includes(field))
  ) {
    errors.push("Provide at least one field to update");
  }

  // src is the only required field
  if (!isUpdate || bannerData.src !== undefined) {
    const srcError = getImageSourceError(bannerData.src, "Src");
    if (srcError) errors.push(srcError);
  }

  if (bannerData.title !== undefined) {
    if (typeof bannerData.title !== "string" || bannerData.title.length > 100) {
      errors.push("Title must be a string of 100 characters or fewer");
    }
  }

  if (bannerData.subtitle !== undefined) {
    if (
      typeof bannerData.subtitle !== "string" ||
      bannerData.subtitle.length > 200
    ) {
      errors.push("Subtitle must be a string of 200 characters or fewer");
    }
  }

  if (bannerData.type !== undefined && !BANNER_TYPES.includes(bannerData.type)) {
    errors.push(`Type must be one of: ${BANNER_TYPES.join(", ")}`);
  }

  if (bannerData.placement !== undefined && !BANNER_PLACEMENTS.includes(bannerData.placement)) {
    errors.push(`Placement must be one of: ${BANNER_PLACEMENTS.join(", ")}`);
  }
  if (bannerData.pagePath !== undefined && (typeof bannerData.pagePath !== "string" || (bannerData.pagePath && !bannerData.pagePath.startsWith("/")))) {
    errors.push("Page path must be empty or start with /");
  }
  if (!isUpdate && bannerData.placement === "pageHeader" && !bannerData.pagePath) {
    errors.push("A page path is required for page header banners");
  }

  if (bannerData.href !== undefined) {
    if (
      typeof bannerData.href !== "string" ||
      !bannerData.href.trim().startsWith("/") ||
      bannerData.href.length > 200
    ) {
      errors.push("Href must be a site path that starts with /");
    }
  }

  if (bannerData.active !== undefined && typeof bannerData.active !== "boolean") {
    errors.push("Active must be true or false");
  }

  if (
    bannerData.order !== undefined &&
    (!Number.isInteger(bannerData.order) || bannerData.order < 0)
  ) {
    errors.push("Order must be a non-negative integer");
  }

  return { isValid: errors.length === 0, errors };
};

export default validateBanner;
