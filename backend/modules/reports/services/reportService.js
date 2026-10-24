import Order from "../../../models/Order.js";
import User from "../../../models/User.js";
import Cart from "../../../models/Cart.js";
import Wishlist from "../../../models/Wishlist.js";
import Product from "../../../models/Product.js";
import { buildSalesReport } from "../../../utils/reportCalculator.js";
export async function salesReport() { return buildSalesReport(await Order.find().select("status paymentMethod paymentStatus total createdAt items").lean()); }
export async function productReport() { return buildSalesReport(await Order.find().select("status paymentStatus total createdAt items").lean()).bestSellingProducts; }
export async function behaviourReport() {
  const [users, orders, carts, wishlists, products] = await Promise.all([
    User.find({ role: "customer" }).select("name email phone addresses createdAt").sort({ createdAt: -1 }).limit(1000).lean(),
    Order.find().select("customer orderNumber status total createdAt items").sort({ createdAt: -1 }).limit(5000).lean(),
    Cart.find().populate("customer", "name email").populate("items.product", "name").limit(1000).lean(),
    Wishlist.find().populate("customer", "name email").populate("products", "name").limit(1000).lean(),
    Product.find({ active: true }).select("name price").lean(),
  ]);
  const statusIndex = { pending: 0, confirmed: 1, shipped: 2, outForDelivery: 3, delivered: 4, cancelled: 5 };
  return {
    users: users.map((user) => {
      const address = user.addresses?.find((item) => item.isDefault) || user.addresses?.[0];
      return { id: String(user._id), name: user.name, email: user.email, phone: user.phone || "", role: "Customer", joined: user.createdAt, address: address ? [address.addressLine, address.area, address.city].filter(Boolean).join(", ") : "—" };
    }),
    orders: orders.map((order) => ({ id: String(order._id), customerId: String(order.customer), orderNumber: order.orderNumber, status: statusIndex[order.status] ?? 0, total: order.total, date: order.createdAt, lines: order.items.map((item) => ({ name: item.name, qty: item.quantity })) })),
    carts: carts.filter((cart) => cart.customer).map((cart) => ({ userId: String(cart.customer._id), updatedAt: cart.updatedAt, items: cart.items.filter((item) => item.product).map((item) => ({ id: String(item.product._id), qty: item.quantity })) })),
    wishlists: wishlists.filter((list) => list.customer).map((list) => ({ userId: String(list.customer._id), productIds: list.products.filter(Boolean).map((product) => String(product._id)) })),
    products: products.map((product) => ({ id: String(product._id), name: product.name, price: product.price })),
  };
}
