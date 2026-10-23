import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateRatingSummary } from "../utils/ratingCalculator.js";

test("no ratings gives zero average and zero count", () => {
  assert.deepEqual(calculateRatingSummary([]), {
    average: 0,
    count: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
});

test("average is rounded to one decimal place", () => {
  // (5 + 4 + 4) / 3 = 4.333...
  assert.equal(calculateRatingSummary([5, 4, 4]).average, 4.3);
});

test("distribution counts each star level", () => {
  const { distribution, count } = calculateRatingSummary([5, 5, 4, 1]);
  assert.deepEqual(distribution, { 1: 1, 2: 0, 3: 0, 4: 1, 5: 2 });
  assert.equal(count, 4);
});

test("invalid ratings are ignored", () => {
  const summary = calculateRatingSummary([5, 0, 6, 3.5, "4", null, undefined, 3]);
  assert.equal(summary.count, 2);
  assert.equal(summary.average, 4);
});

test("no argument at all does not crash", () => {
  assert.equal(calculateRatingSummary().count, 0);
});
