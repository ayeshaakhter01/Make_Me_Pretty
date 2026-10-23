import { test } from "node:test";
import assert from "node:assert/strict";
import validateCoupon, {
  validateCouponCheck,
  validateCouponValueForType,
} from "../validators/couponValidator.js";
import validateBanner from "../validators/bannerValidator.js";
import {
  validateReviewSubmission,
  validateReviewModeration,
} from "../validators/reviewValidator.js";

const futureDate = () => new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
const pastDate = () => new Date(Date.now() - 24 * 3600 * 1000).toISOString();
const PRODUCT_ID = "64b7f0c2a1b2c3d4e5f60718";

// ---------------- Coupon ----------------

test("a valid percent coupon passes", () => {
  const result = validateCoupon({ code: "eid15", type: "percent", value: 15, note: "Eid sale" });
  assert.equal(result.isValid, true);
});

test("a valid shipping coupon passes without a value", () => {
  assert.equal(validateCoupon({ code: "FREESHIP", type: "shipping" }).isValid, true);
});

test("coupon needs a code and a type", () => {
  const result = validateCoupon({});
  assert.equal(result.isValid, false);
  assert.ok(result.errors.some((e) => e.startsWith("Code")));
  assert.ok(result.errors.some((e) => e.startsWith("Type")));
});

test("coupon code format is checked", () => {
  assert.equal(validateCoupon({ code: "ab", type: "shipping" }).isValid, false);
  assert.equal(validateCoupon({ code: "HAS SPACE", type: "shipping" }).isValid, false);
});

test("percent value must be a whole number from 1 to 100", () => {
  assert.equal(validateCoupon({ code: "BIG", type: "percent", value: 150 }).isValid, false);
  assert.equal(validateCoupon({ code: "ZERO", type: "percent", value: 0 }).isValid, false);
  assert.equal(validateCoupon({ code: "HALF", type: "percent", value: 12.5 }).isValid, false);
});

test("fixed value must be greater than 0", () => {
  assert.equal(validateCoupon({ code: "OFF", type: "fixed", value: 0 }).isValid, false);
  assert.equal(validateCoupon({ code: "OFF", type: "fixed", value: 200 }).isValid, true);
});

test("usedCount cannot be set by the client", () => {
  const result = validateCoupon({ code: "SNEAKY", type: "shipping", usedCount: 0 });
  assert.equal(result.isValid, false);
  assert.ok(result.errors[0].includes("usedCount"));
});

test("expiry date must be valid and in the future when creating", () => {
  assert.equal(validateCoupon({ code: "SOON", type: "shipping", expiresAt: futureDate() }).isValid, true);
  assert.equal(validateCoupon({ code: "OLD", type: "shipping", expiresAt: pastDate() }).isValid, false);
  assert.equal(validateCoupon({ code: "BAD", type: "shipping", expiresAt: "tomorrow-ish" }).isValid, false);
});

test("usage limit must be a whole number of 1 or more", () => {
  assert.equal(validateCoupon({ code: "LIM", type: "shipping", usageLimit: 0 }).isValid, false);
  assert.equal(validateCoupon({ code: "LIM", type: "shipping", usageLimit: 50 }).isValid, true);
});

test("coupon update needs at least one field", () => {
  assert.equal(validateCoupon({}, true).isValid, false);
  assert.equal(validateCoupon({ active: false }, true).isValid, true);
});

test("coupon update can clear the expiry with null", () => {
  assert.equal(validateCoupon({ expiresAt: null }, true).isValid, true);
});

test("validateCouponValueForType checks each type", () => {
  assert.equal(validateCouponValueForType("percent", 20), null);
  assert.ok(validateCouponValueForType("percent", 101));
  assert.equal(validateCouponValueForType("shipping", 0), null);
});

test("coupon check needs a code and a subtotal", () => {
  assert.equal(validateCouponCheck({ code: "GLOW20", subtotal: 1200 }).isValid, true);
  assert.equal(validateCouponCheck({ code: "GLOW20", subtotal: 1200, deliveryCharge: 60 }).isValid, true);
  assert.equal(validateCouponCheck({ subtotal: 1200 }).isValid, false);
  assert.equal(validateCouponCheck({ code: "GLOW20", subtotal: -5 }).isValid, false);
  assert.equal(validateCouponCheck({ code: "GLOW20", subtotal: "1200" }).isValid, false);
});

// ---------------- Banner ----------------

test("a valid banner passes", () => {
  const result = validateBanner({ title: "Glow for less", type: "image", src: "/media/hero/offers.png", href: "/offers" });
  assert.equal(result.isValid, true);
});

test("banner needs a src", () => {
  assert.equal(validateBanner({ title: "No picture" }).isValid, false);
});

test("banner src cannot be a base64 image", () => {
  const result = validateBanner({ src: "data:image/png;base64,AAAA" });
  assert.equal(result.isValid, false);
  assert.ok(result.errors[0].includes("base64"));
});

test("banner src must be a path or an http(s) URL", () => {
  assert.equal(validateBanner({ src: "media/hero/offers.png" }).isValid, false);
  assert.equal(validateBanner({ src: "https://example.com/offers.png" }).isValid, true);
});

test("banner type, href, active and order are checked", () => {
  assert.equal(validateBanner({ src: "/a.png", type: "gif" }).isValid, false);
  assert.equal(validateBanner({ src: "/a.png", href: "shop" }).isValid, false);
  assert.equal(validateBanner({ src: "/a.png", active: "yes" }).isValid, false);
  assert.equal(validateBanner({ src: "/a.png", order: -1 }).isValid, false);
});

test("banner update does not need src, but needs one field", () => {
  assert.equal(validateBanner({ active: false }, true).isValid, true);
  assert.equal(validateBanner({}, true).isValid, false);
});

// ---------------- Review ----------------

test("a valid review submission passes", () => {
  const result = validateReviewSubmission({
    product: PRODUCT_ID, rating: 5, title: "Love it", text: "My skin drinks it up.",
  });
  assert.equal(result.isValid, true);
});

test("review needs a valid product id", () => {
  const result = validateReviewSubmission({ product: "123", rating: 5, text: "Nice and light on skin." });
  assert.equal(result.isValid, false);
});

test("review rating must be a whole number from 1 to 5", () => {
  for (const rating of [0, 6, 4.5, "5", undefined]) {
    const result = validateReviewSubmission({ product: PRODUCT_ID, rating, text: "Nice and light on skin." });
    assert.equal(result.isValid, false, `rating ${rating} should fail`);
  }
});

test("review text must be at least 10 characters", () => {
  const result = validateReviewSubmission({ product: PRODUCT_ID, rating: 4, text: "Too short" });
  assert.equal(result.isValid, false);
});

test("a customer cannot send status, customer or customerName", () => {
  const result = validateReviewSubmission({
    product: PRODUCT_ID, rating: 5, text: "Nice and light on skin.", status: "approved", customer: "x",
  });
  assert.equal(result.isValid, false);
  assert.ok(result.errors[0].includes("status"));
});

test("review image is optional, empty string is fine, base64 is not", () => {
  const base = { product: PRODUCT_ID, rating: 5, text: "Nice and light on skin." };
  assert.equal(validateReviewSubmission({ ...base, image: "" }).isValid, true);
  assert.equal(validateReviewSubmission({ ...base, image: "/images/reviews/review1.jpg" }).isValid, true);
  assert.equal(validateReviewSubmission({ ...base, image: "data:image/png;base64,AAAA" }).isValid, false);
});

test("moderation accepts only a valid status", () => {
  assert.equal(validateReviewModeration({ status: "approved" }).isValid, true);
  assert.equal(validateReviewModeration({ status: "rejected" }).isValid, true);
  assert.equal(validateReviewModeration({ status: "banana" }).isValid, false);
  assert.equal(validateReviewModeration({}).isValid, false);
  assert.equal(validateReviewModeration({ status: "approved", rating: 1 }).isValid, false);
});
