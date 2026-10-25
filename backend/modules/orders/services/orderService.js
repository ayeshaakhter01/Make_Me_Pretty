import Order from "../../../models/Order.js";
import Product from "../../../models/Product.js";
import Coupon from "../../../models/Coupon.js";
import Cart from "../../../models/Cart.js";
import User from "../../../models/User.js";
import AppError from "../../../utils/AppError.js";
import { validateCouponForOrder, redeemCoupon } from "../../coupons/services/couponService.js";

const deliveryFee = (subtotal, city) => subtotal >= 3000 || subtotal === 0 ? 0 : ["chattogram", "chittagong"].includes(city?.trim().toLowerCase()) ? 60 : 120;
const ORDER_CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const dhakaDay = (date) => date.toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" }).slice(2).replaceAll("-", "");
export const makeOrderNumber = (date = new Date()) => {
  const day = dhakaDay(date);
  let code = "";
  for (let i = 0; i < 6; i += 1) code += ORDER_CODE_CHARS[Math.floor(Math.random() * ORDER_CODE_CHARS.length)];
  return `MMP-${day}-${code}`;
};
const legacyOrderNumber = (order) => {
  const day = new Date(order.createdAt).toISOString().slice(2, 10).replaceAll("-", "");
  return `MMP-${day}-${String(order._id).slice(-6).toUpperCase()}`;
};
export async function createOrder(customerId, input) {
  if (!Array.isArray(input.items) || input.items.length === 0 || input.items.length > 50) throw new AppError("Add at least one item to your order.", 400);
  if (!input.address || typeof input.address.addressLine !== "string" || !input.address.addressLine.trim() || !input.address.phone?.trim() || !input.address.recipientName?.trim()) throw new AppError("A recipient name, delivery address and phone number are required.", 400);
  if (input.paymentMethod !== "cod") throw new AppError("Online payments are not configured yet. Choose Cash on Delivery.", 400);
  const quantities = new Map();
  for (const item of input.items) {
    if (!/^[\da-f]{24}$/i.test(item.productId || "") || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) throw new AppError("Each item needs a valid product and quantity (1–99).", 400);
    quantities.set(item.productId, (quantities.get(item.productId) || 0) + item.quantity);
  }
  const products = await Product.find({ _id: { $in: [...quantities.keys()] }, active: true }).lean();
  if (products.length !== quantities.size) throw new AppError("One or more products are unavailable.", 409);
  const byId = new Map(products.map((product) => [product._id.toString(), product]));
  const items = [...quantities].map(([id, quantity]) => {
    const product = byId.get(id);
    if (product.stock < quantity) throw new AppError(`${product.name} does not have enough stock.`, 409);
    return { product: product._id, name: product.name, image: product.images[0] || "", quantity, price: product.price };
  });
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryCharge = deliveryFee(subtotal, input.address.city);
  let discount = 0; let couponCode = "";
  if (input.couponCode?.trim()) {
    const coupon = await validateCouponForOrder({ code: input.couponCode, subtotal, deliveryCharge });
    if (!coupon.valid) throw new AppError(coupon.message, 400);
    discount = coupon.totalDiscount;
    couponCode = coupon.coupon.code;
  }
  const reserved = [];
  try {
    for (const item of items) {
      const updated = await Product.updateOne({ _id: item.product, active: true, stock: { $gte: item.quantity } }, { $inc: { stock: -item.quantity } });
      if (!updated.modifiedCount) throw new AppError(`${item.name} just sold out. Please refresh your cart.`, 409);
      reserved.push(item);
    }
    if (couponCode && !(await redeemCoupon(couponCode))) throw new AppError("The coupon has just reached its usage limit.", 409);
    const address = Object.fromEntries(["recipientName", "phone", "addressLine", "area", "city"].map((key) => [key, input.address[key]?.trim() || ""]));
    const order = await Order.create({ orderNumber: makeOrderNumber(), customer: customerId, items, address, subtotal, deliveryCharge, discount, couponCode, total: subtotal + deliveryCharge - discount, paymentMethod: "cod", paymentStatus: "unpaid" });
    // The order is saved, so empty the saved cart. If this fails, the order must still stay.
    await Cart.updateOne({ customer: customerId }, { $set: { items: [] } }).catch(() => undefined);
    return order;
  } catch (error) {
    if (reserved.length) await Product.bulkWrite(reserved.map((item) => ({ updateOne: { filter: { _id: item.product }, update: { $inc: { stock: item.quantity } } } })));
    // A failed order save after coupon redemption restores one use.
    if (couponCode && error.name !== "AppError") await Coupon.updateOne({ code: couponCode, usedCount: { $gt: 0 } }, { $inc: { usedCount: -1 } });
    throw error;
  }
}
export async function getMyOrders(customerId) {
  const orders = await Order.find({ customer: customerId }).sort({ createdAt: -1 }).lean();
  return orders.map((order) => ({ ...order, messageCount: order.messages?.length || 0, orderNumber: order.orderNumber || legacyOrderNumber(order) }));
}
export async function getMyOrder(customerId, id) {
  const order = await Order.findOne({ _id: id, customer: customerId }).lean();
  if (!order) throw new AppError("Order not found.", 404);
  return order;
}
export async function getAllOrders() {
  const orders = await Order.find().sort({ createdAt: -1 }).populate("customer", "name email phone").populate("deliveryPartner", "name").lean();
  return orders.map((order) => ({ ...order, orderNumber: order.orderNumber || legacyOrderNumber(order), unreadForAdmin: unreadCount(order, "admin"), unreadForPartner: unreadCount(order, "deliveryPartner") }));
}
export async function updateOrderStatus(id, status) {
  const allowed = ["confirmed", "cancelled"];
  if (!allowed.includes(status)) throw new AppError(`Status must be one of: ${allowed.join(", ")}.`, 400);
  const order = await Order.findById(id).select("status paymentStatus");
  if (!order) throw new AppError("Order not found.", 404);
  if (["cancelled", "delivered"].includes(order.status)) throw new AppError("This order can no longer change status.", 409);
  if (status === "confirmed") {
    const confirmed = await Order.findOneAndUpdate({ _id: id, status: "pending" }, { $set: { status: "confirmed" } }, { new: true });
    if (!confirmed) throw new AppError("Only pending orders can be confirmed.", 409);
    return confirmed;
  }
  if (order.paymentStatus === "paid") throw new AppError("Cash was already collected for this order, so it cannot be cancelled.", 409);
  const cancelled = await cancelOrder({ _id: id }, ["pending", "confirmed", "shipped", "outForDelivery"]);
  if (!cancelled) throw new AppError("This order can no longer be cancelled.", 409);
  return cancelled;
}
export async function assignDeliveryPartner(orderId, userId) {
  if (!/^[\da-f]{24}$/i.test(userId || "")) throw new AppError("A valid delivery partner id is required.", 400);
  const [order, partner] = await Promise.all([Order.findById(orderId), User.findOne({ _id: userId, role: "deliveryPartner" })]);
  if (!order) throw new AppError("Order not found.", 404);
  if (!partner) throw new AppError("Delivery partner account not found.", 404);
  if (["cancelled", "delivered"].includes(order.status)) throw new AppError("This order cannot be assigned.", 409);
  order.deliveryPartner = partner._id;
  if (order.status === "pending") order.status = "confirmed";
  return order.save();
}
export async function getAssignments(partnerId) {
  const orders = await Order.find({ deliveryPartner: partnerId, status: { $ne: "cancelled" } }).sort({ createdAt: 1 }).populate("customer", "name phone").lean();
  return orders.map((order) => ({ ...order, orderNumber: order.orderNumber || legacyOrderNumber(order), unreadForAdmin: unreadCount(order, "admin"), unreadForPartner: unreadCount(order, "deliveryPartner") }));
}
export async function getAssignment(partnerId, orderId) {
  const order = await Order.findOne({ _id: orderId, deliveryPartner: partnerId }).populate("customer", "name phone").lean();
  if (!order) throw new AppError("Delivery assignment not found.", 404);
  return order;
}
function authorizedForOrder(order, user) {
  return user.role === "admin" || String(order.deliveryPartner) === String(user._id) || String(order.customer) === String(user._id);
}
export async function listOrderMessages(user, orderId) {
  const order = await Order.findById(orderId).select("customer deliveryPartner messages").lean();
  if (!order || !authorizedForOrder(order, user)) throw new AppError("Order not found or unavailable to this account.", 404);
  const seenField = user.role === "admin" ? "adminSeenAt" : user.role === "deliveryPartner" ? "partnerSeenAt" : null;
  if (seenField) await Order.updateOne({ _id: orderId }, { $set: { [seenField]: new Date() } });
  return order.messages || [];
}
export async function createOrderMessage(user, orderId, input) {
  const kind = input?.kind || "message";
  const text = typeof input?.text === "string" ? input.text.trim() : "";
  const link = typeof input?.link === "string" ? input.link.trim() : "";
  if (!text || text.length > 1500 || !["message", "issue", "location"].includes(kind)) throw new AppError("Enter a message up to 1500 characters.", 400);
  if (link && !/^https:\/\//i.test(link)) throw new AppError("Message links must use HTTPS.", 400);
  const order = await Order.findById(orderId);
  if (!order || !authorizedForOrder(order, user)) throw new AppError("Order not found or unavailable to this account.", 404);
  if (user.role === "deliveryPartner" && String(order.deliveryPartner) !== String(user._id)) throw new AppError("This order is not assigned to your account.", 403);
  const message = { sender: user._id, senderName: user.name, role: user.role, kind, text, link, at: new Date() };
  order.messages.push(message);
  if (kind === "issue") order.issue = text.slice(0, 500);
  await order.save();
  return order.messages[order.messages.length - 1];
}
export async function resolveOrderIssue(orderId) {
  const order = await Order.findById(orderId);
  if (!order) throw new AppError("Order not found.", 404);
  order.issue = "";
  await order.save();
  return order;
}
export async function updateDeliveryStatus(partnerId, orderId, status) {
  const next = { confirmed: "shipped", shipped: "outForDelivery", outForDelivery: "delivered" };
  const order = await Order.findOne({ _id: orderId, deliveryPartner: partnerId });
  if (!order) throw new AppError("Delivery assignment not found.", 404);
  if (!next[order.status] || next[order.status] !== status) throw new AppError("This status change is not allowed for the current delivery stage.", 409);
  if (status === "delivered" && order.paymentMethod === "cod" && order.paymentStatus !== "paid") throw new AppError("Collect the cash before marking this order delivered.", 409);
  order.status = status;
  return order.save();
}
export async function collectCodPayment(partnerId, orderId) {
  const order = await Order.findOne({ _id: orderId, deliveryPartner: partnerId });
  if (!order) throw new AppError("Delivery assignment not found.", 404);
  if (order.paymentMethod !== "cod" || order.paymentStatus !== "unpaid" || !["outForDelivery", "delivered"].includes(order.status)) throw new AppError("COD can be marked paid only after cash has been collected at delivery.", 409);
  order.paymentStatus = "paid";
  return order.save();
}
function unreadCount(order, viewerRole) {
  const seen = viewerRole === "admin" ? order.adminSeenAt : order.partnerSeenAt;
  return (order.messages || []).filter((message) => message.role !== viewerRole && (!seen || new Date(message.at) > new Date(seen))).length;
}
export async function hasDeliveredOrderWithProduct(customerId, productId) {
  return Boolean(await Order.exists({ customer: customerId, status: "delivered", "items.product": productId }));
}
// Gives stock (and the coupon use) back for a cancelled order. Used by both cancel paths.
async function restoreReservedStock(order) {
  await Product.bulkWrite(order.items.map((item) => ({ updateOne: { filter: { _id: item.product }, update: { $inc: { stock: item.quantity } } } })));
  if (order.couponCode) await Coupon.updateOne({ code: order.couponCode, usedCount: { $gt: 0 } }, { $inc: { usedCount: -1 } });
}

// Cancels only if the order is STILL in an allowed status and unpaid.
// Check and change happen in one database step, so a double click cannot restore stock twice.
// Returns null if someone else changed the order first.
async function cancelOrder(filter, allowedStatuses) {
  const order = await Order.findOneAndUpdate({ ...filter, status: { $in: allowedStatuses }, paymentStatus: { $ne: "paid" } }, { $set: { status: "cancelled" } }, { new: true });
  if (order) await restoreReservedStock(order);
  return order;
}

export async function cancelMyOrder(customerId, orderId) {
  if (!/^[\da-f]{24}$/i.test(orderId || "")) throw new AppError("Order not found.", 404);
  const order = await cancelOrder({ _id: orderId, customer: customerId }, ["pending"]);
  if (!order) throw new AppError("Only orders that are still pending can be cancelled here. Please contact the shop for confirmed orders.", 409);
  return order;
}