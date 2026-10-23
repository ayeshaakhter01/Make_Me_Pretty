// Pure report logic. It works on an array of order objects, so it can be tested
// now with sample data. Later the service loads real orders from MongoDB and
// passes them in.
//
// Expected order shape (PROPOSED - agree the exact names with Fayeza):
// {
//   status: "pending" | "confirmed" | "shipped" | "outForDelivery" | "delivered" | "cancelled",
//   paymentMethod: "cod" | "bkash" | ...,
//   paymentStatus: "unpaid" | "paid" | ...,
//   total: Number,
//   createdAt: Date | ISO string,
//   items: [{ product, name, quantity, price }]
// }
//
// Rules from the guide:
// - cancelled orders are excluded from sales
// - unpaid COD is NOT counted as received revenue

export const ORDER_STATUS_CANCELLED = "cancelled";
export const PAYMENT_STATUS_PAID = "paid";
const REPORT_TIME_ZONE = "Asia/Dhaka";

const isCancelled = (order) => order.status === ORDER_STATUS_CANCELLED;
const isPaid = (order) => order.paymentStatus === PAYMENT_STATUS_PAID;
const isReceivedRevenue = (order) => isPaid(order) && !isCancelled(order);

const toAmount = (value) => (Number.isFinite(value) ? value : 0);
const roundMoney = (value) => Math.round(value * 100) / 100;

const toOrderList = (orders) => (Array.isArray(orders) ? orders : []);

// "2026-10-23" in Bangladesh time, so a late-night order lands on the right day.
export const toDateKey = (dateInput) => {
  const date = new Date(dateInput);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString("en-CA", { timeZone: REPORT_TIME_ZONE });
};

export const summarizeOrders = (orders) => {
  const list = toOrderList(orders);

  let cancelledOrders = 0;
  let receivedRevenue = 0;
  let pendingPaymentAmount = 0;

  for (const order of list) {
    if (isCancelled(order)) {
      cancelledOrders += 1;
    } else if (isPaid(order)) {
      receivedRevenue += toAmount(order.total);
    } else {
      pendingPaymentAmount += toAmount(order.total);
    }
  }

  return {
    totalOrders: list.length,
    cancelledOrders,
    activeOrders: list.length - cancelledOrders,
    receivedRevenue: roundMoney(receivedRevenue),
    pendingPaymentAmount: roundMoney(pendingPaymentAmount),
  };
};

export const orderStatusBreakdown = (orders) => {
  const breakdown = {};

  for (const order of toOrderList(orders)) {
    const status = order.status ?? "unknown";
    breakdown[status] = (breakdown[status] ?? 0) + 1;
  }

  return breakdown;
};

// Received revenue per day, oldest day first.
export const salesByDate = (orders) => {
  const days = new Map();

  for (const order of toOrderList(orders)) {
    if (!isReceivedRevenue(order)) continue;

    const date = toDateKey(order.createdAt);
    if (!date) continue;

    const day = days.get(date) ?? { date, orders: 0, revenue: 0 };
    day.orders += 1;
    day.revenue += toAmount(order.total);
    days.set(date, day);
  }

  return [...days.values()]
    .map((day) => ({ ...day, revenue: roundMoney(day.revenue) }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

// Units sold per product. Cancelled orders are excluded.
export const bestSellingProducts = (orders, limit = 5) => {
  const products = new Map();

  for (const order of toOrderList(orders)) {
    if (isCancelled(order)) continue;

    for (const item of order.items ?? []) {
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) continue;

      const key = String(item.product ?? item.name);
      const entry = products.get(key) ?? {
        product: item.product ?? null,
        name: item.name ?? "",
        unitsSold: 0,
        revenue: 0,
      };

      entry.unitsSold += item.quantity;
      entry.revenue += item.quantity * toAmount(item.price);
      products.set(key, entry);
    }
  }

  return [...products.values()]
    .map((entry) => ({ ...entry, revenue: roundMoney(entry.revenue) }))
    .sort(
      (a, b) =>
        b.unitsSold - a.unitsSold ||
        b.revenue - a.revenue ||
        a.name.localeCompare(b.name)
    )
    .slice(0, limit);
};

// Orders and money per payment method. Cancelled orders are excluded.
export const paymentMethodBreakdown = (orders) => {
  const methods = new Map();

  for (const order of toOrderList(orders)) {
    if (isCancelled(order)) continue;

    const method = order.paymentMethod ?? "unknown";
    const entry = methods.get(method) ?? {
      method,
      orders: 0,
      totalAmount: 0,
      receivedAmount: 0,
    };

    entry.orders += 1;
    entry.totalAmount += toAmount(order.total);

    if (isPaid(order)) {
      entry.receivedAmount += toAmount(order.total);
    }

    methods.set(method, entry);
  }

  return [...methods.values()]
    .map((entry) => ({
      ...entry,
      totalAmount: roundMoney(entry.totalAmount),
      receivedAmount: roundMoney(entry.receivedAmount),
    }))
    .sort((a, b) => b.orders - a.orders || a.method.localeCompare(b.method));
};

export const buildSalesReport = (orders, { topProducts = 5 } = {}) => ({
  summary: summarizeOrders(orders),
  statusBreakdown: orderStatusBreakdown(orders),
  salesByDate: salesByDate(orders),
  bestSellingProducts: bestSellingProducts(orders, topProducts),
  paymentMethods: paymentMethodBreakdown(orders),
});
