import { test } from "node:test";
import assert from "node:assert/strict";
import Coupon from "../models/Coupon.js";
import Banner from "../models/Banner.js";
import Review from "../models/Review.js";

// These tests check the schemas only (validateSync). No database needed.

const OBJECT_ID = "64b7f0c2a1b2c3d4e5f60718";

test("coupon: code is saved in uppercase with defaults", () => {
  const coupon = new Coupon({ code: " glow20 ", type: "percent", value: 20 });
  assert.equal(coupon.validateSync(), undefined);
  assert.equal(coupon.code, "GLOW20");
  assert.equal(coupon.active, true);
  assert.equal(coupon.usedCount, 0);
  assert.equal(coupon.usageLimit, null);
  assert.equal(coupon.expiresAt, null);
});

test("coupon: unknown type is rejected", () => {
  const error = new Coupon({ code: "BAD", type: "bogo" }).validateSync();
  assert.ok(error.errors.type);
});

test("coupon: usage limit of 0 is rejected", () => {
  const error = new Coupon({ code: "LIM", type: "shipping", usageLimit: 0 }).validateSync();
  assert.ok(error.errors.usageLimit);
});

test("banner: only src is required, and defaults are applied", () => {
  const banner = new Banner({ src: "/media/hero/offers.png" });
  assert.equal(banner.validateSync(), undefined);
  assert.equal(banner.type, "image");
  assert.equal(banner.href, "/shop");
  assert.equal(banner.active, true);
  assert.equal(banner.order, 0);
});

test("banner: missing src is rejected", () => {
  assert.ok(new Banner({ title: "x" }).validateSync().errors.src);
});

test("review: a valid review starts as pending", () => {
  const review = new Review({
    customer: OBJECT_ID, customerName: "Sadia M.", product: OBJECT_ID,
    rating: 5, text: "Absolutely lives up to the hype.",
  });
  assert.equal(review.validateSync(), undefined);
  assert.equal(review.status, "pending");
  assert.equal(review.image, "");
});

test("review: rating must be a whole number from 1 to 5", () => {
  const make = (rating) => new Review({
    customer: OBJECT_ID, customerName: "A", product: OBJECT_ID, rating, text: "Long enough text here.",
  }).validateSync();

  assert.ok(make(0).errors.rating);
  assert.ok(make(6).errors.rating);
  assert.ok(make(3.5).errors.rating);
  assert.equal(make(4), undefined);
});

test("review: text under 10 characters is rejected", () => {
  const error = new Review({
    customer: OBJECT_ID, customerName: "A", product: OBJECT_ID, rating: 5, text: "short",
  }).validateSync();
  assert.ok(error.errors.text);
});

test("review: unknown status is rejected", () => {
  const error = new Review({
    customer: OBJECT_ID, customerName: "A", product: OBJECT_ID, rating: 5,
    text: "Long enough text here.", status: "banana",
  }).validateSync();
  assert.ok(error.errors.status);
});
