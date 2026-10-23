import { test } from "node:test";
import assert from "node:assert/strict";
import {
  checkCouponUsable,
  calculateCouponDiscount,
} from "../utils/couponCalculator.js";

const NOW = new Date("2026-10-23T10:00:00Z");

const makeCoupon = (overrides = {}) => ({
  code: "GLOW20",
  type: "percent",
  value: 20,
  active: true,
  minOrderAmount: 0,
  expiresAt: null,
  usageLimit: null,
  usedCount: 0,
  ...overrides,
});

// ---- calculateCouponDiscount ----

test("percent coupon takes the percentage off the subtotal", () => {
  const result = calculateCouponDiscount(makeCoupon(), 2000, 60);
  assert.deepEqual(result, { itemDiscount: 400, deliveryDiscount: 0, totalDiscount: 400 });
});

test("percent discount is rounded to a whole taka", () => {
  const result = calculateCouponDiscount(makeCoupon({ value: 10 }), 1255);
  assert.equal(result.itemDiscount, 126); // 125.5 rounds up
});

test("fixed coupon takes a fixed amount off", () => {
  const result = calculateCouponDiscount(makeCoupon({ type: "fixed", value: 150 }), 1000);
  assert.equal(result.itemDiscount, 150);
});

test("fixed discount can never be more than the subtotal", () => {
  const result = calculateCouponDiscount(makeCoupon({ type: "fixed", value: 500 }), 300);
  assert.equal(result.itemDiscount, 300);
});

test("shipping coupon removes the delivery charge only", () => {
  const result = calculateCouponDiscount(makeCoupon({ type: "shipping", value: 0 }), 1500, 120);
  assert.deepEqual(result, { itemDiscount: 0, deliveryDiscount: 120, totalDiscount: 120 });
});

test("bad subtotal or delivery numbers give zero discount", () => {
  const result = calculateCouponDiscount(makeCoupon(), NaN, -5);
  assert.deepEqual(result, { itemDiscount: 0, deliveryDiscount: 0, totalDiscount: 0 });
});

// ---- checkCouponUsable ----

test("a normal active coupon is usable", () => {
  assert.deepEqual(checkCouponUsable(makeCoupon(), 1000, NOW), { usable: true, reason: "" });
});

test("a missing coupon is not usable", () => {
  assert.equal(checkCouponUsable(null, 1000, NOW).usable, false);
});

test("an inactive coupon is not usable", () => {
  const result = checkCouponUsable(makeCoupon({ active: false }), 1000, NOW);
  assert.equal(result.usable, false);
  assert.match(result.reason, /not active/);
});

test("an expired coupon is not usable", () => {
  const result = checkCouponUsable(makeCoupon({ expiresAt: new Date("2026-10-01T00:00:00Z") }), 1000, NOW);
  assert.equal(result.usable, false);
  assert.match(result.reason, /expired/);
});

test("a coupon that expires in the future is usable", () => {
  const result = checkCouponUsable(makeCoupon({ expiresAt: new Date("2026-12-01T00:00:00Z") }), 1000, NOW);
  assert.equal(result.usable, true);
});

test("a coupon at its usage limit is not usable", () => {
  const result = checkCouponUsable(makeCoupon({ usageLimit: 5, usedCount: 5 }), 1000, NOW);
  assert.equal(result.usable, false);
  assert.match(result.reason, /usage limit/);
});

test("a coupon below its usage limit is usable", () => {
  assert.equal(checkCouponUsable(makeCoupon({ usageLimit: 5, usedCount: 4 }), 1000, NOW).usable, true);
});

test("a subtotal below the minimum order amount is not usable", () => {
  const result = checkCouponUsable(makeCoupon({ minOrderAmount: 1500 }), 1000, NOW);
  assert.equal(result.usable, false);
  assert.match(result.reason, /1500/);
});

test("a subtotal equal to the minimum order amount is usable", () => {
  assert.equal(checkCouponUsable(makeCoupon({ minOrderAmount: 1000 }), 1000, NOW).usable, true);
});
