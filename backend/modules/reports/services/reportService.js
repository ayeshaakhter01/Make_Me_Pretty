import Order from "../../../models/Order.js";
import User from "../../../models/User.js";
import Cart from "../../../models/Cart.js";
import Wishlist from "../../../models/Wishlist.js";
import Product from "../../../models/Product.js";
import { buildSalesReport, receivedRevenueOrders, toDateKey, toMonthKey } from "../../../utils/reportCalculator.js";
export async function salesReport() {
  const orders = await Order.find()
    .select("orderNumber customer address status paymentMethod paymentStatus total createdAt items isDemo")
    .populate("customer", "name")
    .lean();
  const realOrders = orders.filter((order) => !order.isDemo);
  const report = buildSalesReport(realOrders);

  return {
    ...report,
    receivedOrders: receivedRevenueOrders(realOrders).map((order) => ({
      id: String(order._id),
      orderNumber: order.orderNumber || String(order._id),
      date: toDateKey(order.createdAt),
      month: toMonthKey(order.createdAt),
      customer: order.customer?.name || order.address?.recipientName || "Customer",
      items: (order.items || []).map((item) => `${item.name} × ${item.quantity}`).join(", "),
      total: order.total,
      paymentMethod: order.paymentMethod,
    })),
  };
}
export async function productReport() {
  const orders = await Order.find({ isDemo: { $ne: true } }).select("status paymentStatus total createdAt items").lean();
  return buildSalesReport(orders).bestSellingProducts;
}
export async function behaviourReport() {
  const [users, orders, carts, wishlists, products] = await Promise.all([
    User.find({ role: "customer", isDemo: { $ne: true } }).select("name email phone addresses createdAt").sort({ createdAt: -1 }).limit(1000).lean(),
    Order.find({ isDemo: { $ne: true } }).select("customer orderNumber status total createdAt items").sort({ createdAt: -1 }).limit(5000).lean(),
    Cart.find().populate("customer", "name email isDemo").populate("items.product", "name").limit(1000).lean(),
    Wishlist.find().populate("customer", "name email isDemo").populate("products", "name").limit(1000).lean(),
    Product.find({ active: true }).select("name price").lean(),
  ]);
  const statusIndex = { pending: 0, confirmed: 1, shipped: 2, outForDelivery: 3, delivered: 4, cancelled: 5 };
  return {
    users: users.map((user) => {
      const address = user.addresses?.find((item) => item.isDefault) || user.addresses?.[0];
      return { id: String(user._id), name: user.name, email: user.email, phone: user.phone || "", role: "Customer", joined: user.createdAt, address: address ? [address.addressLine, address.area, address.city].filter(Boolean).join(", ") : "—" };
    }),
    orders: orders.map((order) => ({ id: String(order._id), customerId: String(order.customer), orderNumber: order.orderNumber, status: statusIndex[order.status] ?? 0, total: order.total, date: order.createdAt, lines: order.items.map((item) => ({ name: item.name, qty: item.quantity })) })),
    carts: carts.filter((cart) => cart.customer && !cart.customer.isDemo).map((cart) => ({ userId: String(cart.customer._id), updatedAt: cart.updatedAt, items: cart.items.filter((item) => item.product).map((item) => ({ id: String(item.product._id), qty: item.quantity })) })),
    wishlists: wishlists.filter((list) => list.customer && !list.customer.isDemo).map((list) => ({ userId: String(list.customer._id), productIds: list.products.filter(Boolean).map((product) => String(product._id)) })),
    products: products.map((product) => ({ id: String(product._id), name: product.name, price: product.price })),
  };
}
