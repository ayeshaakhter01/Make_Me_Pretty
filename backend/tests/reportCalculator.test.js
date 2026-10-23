import { test } from "node:test";
import assert from "node:assert/strict";
import {
  toDateKey,
  summarizeOrders,
  orderStatusBreakdown,
  salesByDate,
  bestSellingProducts,
  paymentMethodBreakdown,
  buildSalesReport,
} from "../utils/reportCalculator.js";

// Sample orders (the real Order model is built by Fayeza).
const orders = [
  {
    status: "delivered", paymentMethod: "bkash", paymentStatus: "paid",
    total: 2700, createdAt: "2026-10-20T08:00:00Z",
    items: [
      { product: "p1", name: "Silk Barrier Moisturizer", quantity: 1, price: 1250 },
      { product: "p2", name: "Niacinamide 10% Serum", quantity: 1, price: 1450 },
    ],
  },
  {
    status: "confirmed", paymentMethod: "cod", paymentStatus: "unpaid", // unpaid COD
    total: 1350, createdAt: "2026-10-20T10:00:00Z",
    items: [{ product: "p3", name: "SPF 50 Silk Shield", quantity: 1, price: 1350 }],
  },
  {
    status: "cancelled", paymentMethod: "bkash", paymentStatus: "paid", // cancelled
    total: 950, createdAt: "2026-10-21T10:00:00Z",
    items: [{ product: "p4", name: "Hydra Mist Toner", quantity: 1, price: 950 }],
  },
  {
    status: "delivered", paymentMethod: "cod", paymentStatus: "paid",
    total: 3100, createdAt: "2026-10-21T09:00:00Z",
    items: [
      { product: "p1", name: "Silk Barrier Moisturizer", quantity: 2, price: 1250 },
      { product: "p4", name: "Hydra Mist Toner", quantity: 1, price: 600 },
    ],
  },
];

test("summary counts orders and separates received money from pending money", () => {
  assert.deepEqual(summarizeOrders(orders), {
    totalOrders: 4,
    cancelledOrders: 1,
    activeOrders: 3,
    receivedRevenue: 5800, // 2700 + 3100. Unpaid COD and the cancelled order are excluded
    pendingPaymentAmount: 1350, // the unpaid COD order
  });
});

test("status breakdown counts orders per status", () => {
  assert.deepEqual(orderStatusBreakdown(orders), { delivered: 2, confirmed: 1, cancelled: 1 });
});

test("sales by date uses paid, non-cancelled orders only, oldest day first", () => {
  assert.deepEqual(salesByDate(orders), [
    { date: "2026-10-20", orders: 1, revenue: 2700 },
    { date: "2026-10-21", orders: 1, revenue: 3100 },
  ]);
});

test("sales by date uses Bangladesh time for the day", () => {
  // 20:00 UTC on Oct 20 is 02:00 on Oct 21 in Dhaka (UTC+6)
  assert.equal(toDateKey("2026-10-20T20:00:00Z"), "2026-10-21");
});

test("orders with an invalid date are skipped in sales by date", () => {
  const bad = [{ status: "delivered", paymentStatus: "paid", total: 500, createdAt: "not a date" }];
  assert.deepEqual(salesByDate(bad), []);
});

test("best sellers add up units across orders and skip cancelled orders", () => {
  const result = bestSellingProducts(orders);
  assert.equal(result[0].name, "Silk Barrier Moisturizer");
  assert.equal(result[0].unitsSold, 3);
  assert.equal(result[0].revenue, 3750);
  // Hydra Mist Toner only appears in the cancelled order and one paid order
  const toner = result.find((item) => item.name === "Hydra Mist Toner");
  assert.equal(toner.unitsSold, 1);
});

test("best sellers respects the limit", () => {
  assert.equal(bestSellingProducts(orders, 2).length, 2);
});

test("payment method breakdown excludes cancelled orders and shows received money", () => {
  assert.deepEqual(paymentMethodBreakdown(orders), [
    { method: "cod", orders: 2, totalAmount: 4450, receivedAmount: 3100 },
    { method: "bkash", orders: 1, totalAmount: 2700, receivedAmount: 2700 },
  ]);
});

test("empty or missing order lists give empty reports", () => {
  const report = buildSalesReport([]);
  assert.equal(report.summary.totalOrders, 0);
  assert.deepEqual(report.salesByDate, []);
  assert.deepEqual(report.bestSellingProducts, []);
  assert.equal(buildSalesReport(undefined).summary.totalOrders, 0);
});

test("full report has every section", () => {
  const report = buildSalesReport(orders);
  assert.deepEqual(Object.keys(report), [
    "summary", "statusBreakdown", "salesByDate", "bestSellingProducts", "paymentMethods",
  ]);
});
