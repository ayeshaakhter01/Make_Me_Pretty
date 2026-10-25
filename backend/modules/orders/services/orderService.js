import mongoose from "mongoose";
import Order from "../../../models/Order.js";
import Payment from "../../../models/Payment.js";
import Product from "../../../models/Product.js";
import Coupon from "../../../models/Coupon.js";
import User from "../../../models/User.js";
import AppError from "../../../utils/AppError.js";
import { validateCouponForOrder, redeemCoupon } from "../../coupons/services/couponService.js";
import { calculateOrderTotals, normalizeOrderRequest, paymentStatusAfterFulfillmentChange, validateCodCollection, validateIdempotencyKey } from "./orderHelpers.js";

const makeOrderNumber = () => {
  const day = new Date().toISOString().slice(2, 10).replaceAll("-", "");
  return `MMP-${day}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
};
const legacyOrderNumber = (order) => {
  const day = new Date(order.createdAt).toISOString().slice(2, 10).replaceAll("-", "");
  return `MMP-${day}-${String(order._id).slice(-6).toUpperCase()}`;
};

async function withOptionalTransaction(work) {
  if (mongoose.connection.readyState !== 1) return work(null);
  let session;
  try {
    session = await mongoose.startSession();
    let result;
    await session.withTransaction(async () => { result = await work(session); });
    return result;
  } catch (error) {
    const unsupported = error?.code === 20 || error?.codeName === "IllegalOperation"
      || /transaction numbers are only allowed|does not support transactions/i.test(error?.message || "");
    if (!unsupported) throw error;
    return work(null);
  } finally {
    await session?.endSession();
  }
}
export async function createOrder(customerId, input, rawIdempotencyKey) {
  const idempotencyKey = validateIdempotencyKey(rawIdempotencyKey);
  const { quantities, address, fingerprint, couponCode: requestedCoupon, paymentMethod } = normalizeOrderRequest(input);
  const priorOrder = await Order.findOne({ customer: customerId, idempotencyKey }).select("+requestFingerprint");
  if (priorOrder) {
    if (priorOrder.requestFingerprint !== fingerprint) throw new AppError("This Idempotency-Key was already used for a different order.", 409);
    return priorOrder;
  }
  const products = await Product.find({ _id: { $in: [...quantities.keys()] }, active: true }).lean();
  if (products.length !== quantities.size) throw new AppError("One or more products are unavailable.", 409);
  const byId = new Map(products.map((product) => [product._id.toString(), product]));
  const items = [...quantities].map(([id, quantity]) => {
    const product = byId.get(id);
    if (product.stock < quantity) throw new AppError(`${product.name} does not have enough stock.`, 409);
    return { product: product._id, name: product.name, image: product.images[0] || "", quantity, price: product.price };
  });
  const { subtotal, deliveryCharge } = calculateOrderTotals(items, address.city);
  let discount = 0; let couponCode = "";
  if (requestedCoupon) {
    const coupon = await validateCouponForOrder({ code: requestedCoupon, subtotal, deliveryCharge });
    if (!coupon.valid) throw new AppError(coupon.message, 400);
    discount = coupon.totalDiscount;
    couponCode = coupon.coupon.code;
  }
  const totals = calculateOrderTotals(items, address.city, discount);
  if (paymentMethod === "sslcommerz" && (totals.total < 10 || totals.total > 500000)) {
    throw new AppError("SSLCommerz sandbox payments must be between ৳10 and ৳500,000.", 400);
  }
  const reserved = [];
  let order;
  let payment;
  let couponRedeemed = false;
  try {
    for (const item of items) {
      const updated = await Product.updateOne({ _id: item.product, active: true, stock: { $gte: item.quantity } }, { $inc: { stock: -item.quantity } });
      if (!updated.modifiedCount) throw new AppError(`${item.name} just sold out. Please refresh your cart.`, 409);
      reserved.push(item);
    }
    if (couponCode) {
      if (!(await redeemCoupon(couponCode))) throw new AppError("The coupon has just reached its usage limit.", 409);
      couponRedeemed = true;
    }
    order = await Order.create({ orderNumber: makeOrderNumber(), customer: customerId, items, address, ...totals, couponCode, paymentMethod, paymentStatus: "pending", idempotencyKey, requestFingerprint: fingerprint });
    if (paymentMethod === "cod") payment = await Payment.create({ order: order._id, attemptNumber: 1, customer: customerId, paymentMethod: "cod", amount: order.total, currency: "BDT", status: "pending", gateway: "cod" });
    return order;
  } catch (error) {
    const rollback = [];
    if (payment) rollback.push(Payment.deleteOne({ _id: payment._id }));
    if (order) rollback.push(Order.deleteOne({ _id: order._id }));
    if (reserved.length) rollback.push(Product.bulkWrite(reserved.map((item) => ({ updateOne: { filter: { _id: item.product }, update: { $inc: { stock: item.quantity } } } }))));
    if (couponRedeemed) rollback.push(Coupon.updateOne({ code: couponCode, usedCount: { $gt: 0 } }, { $inc: { usedCount: -1 } }));
    const rollbackResults = await Promise.allSettled(rollback);
    const rollbackErrors = rollbackResults.filter((result) => result.status === "rejected");
    if (rollbackErrors.length) console.error("Order creation rollback was incomplete", { failedOperations: rollbackErrors.length });
    if (error.code === 11000) {
      const existing = await Order.findOne({ customer: customerId, idempotencyKey }).select("+requestFingerprint");
      if (existing?.requestFingerprint === fingerprint) return existing;
      if (existing) throw new AppError("This Idempotency-Key was already used for a different order.", 409);
    }
    throw error;
  }
}
export async function getMyOrders(customerId) {
  const orders = await Order.find({ customer: customerId }).sort({ createdAt: -1 }).lean();
  return orders.map((order) => ({ ...order, messageCount: order.messages?.length || 0, orderNumber: order.orderNumber || legacyOrderNumber(order) }));
}
export async function trackOrder(orderNumber, phone) {
  const order = await Order.findOne({ orderNumber: orderNumber.trim().toUpperCase(), "address.phone": phone.trim() }).select("orderNumber status total createdAt").lean();
  if (!order) throw new AppError("Order not found. Check the tracking number and checkout phone number.", 404);
  return order;
}
export async function getMyOrder(customerId, id) {
  const order = await Order.findOne({ _id: id, customer: customerId }).lean();
  if (!order) throw new AppError("Order not found.", 404);
  return order;
}
export async function getAllOrders() {
  const orders = await Order.find().sort({ createdAt: -1 }).populate("customer", "name email phone").populate("deliveryPartner", "name").lean();
  return orders.map((order) => ({ ...order, orderNumber: order.orderNumber || legacyOrderNumber(order) }));
}
export async function updateOrderStatus(id, status) {
  const allowed = ["confirmed", "shipped", "outForDelivery", "delivered", "cancelled"];
  if (!allowed.includes(status)) throw new AppError(`Status must be one of: ${allowed.join(", ")}.`, 400);
  return withOptionalTransaction(async (session) => {
    const options = session ? { session } : {};
    const order = await Order.findById(id, null, options);
    if (!order) throw new AppError("Order not found.", 404);
    if (status === "cancelled" && order.status === "cancelled" && ["cod", "sslcommerz"].includes(order.paymentMethod) && order.paymentStatus === "cancelled") {
      if (order.paymentMethod === "cod") {
        const payment = await Payment.findOne({ order: order._id, attemptNumber: 1 }, null, options);
        if (payment && ["paid", "refunded"].includes(payment.status)) throw new AppError("A paid order cannot be cancelled until its payment is refunded.", 409);
        if (payment) await Payment.updateOne({ _id: payment._id, status: { $nin: ["paid", "refunded"] } }, { $set: { status: "cancelled" } }, options);
        else await Payment.create([{ order: order._id, attemptNumber: 1, customer: order.customer, paymentMethod: "cod", amount: order.total, currency: "BDT", gateway: "cod", status: "cancelled" }], options);
      } else {
        await Payment.updateMany({ order: order._id, status: "pending" }, { $set: { status: "cancelled" } }, options);
      }
      return order;
    }
    if (["cancelled", "delivered"].includes(order.status)) throw new AppError("This order can no longer change status.", 409);
    const nextPaymentStatus = paymentStatusAfterFulfillmentChange(order, status);
    if (status === "cancelled" && ["cod", "sslcommerz"].includes(order.paymentMethod)
      && await Payment.countDocuments({ order: order._id, status: { $in: ["paid", "refunded"] } }, options)) {
      throw new AppError("A paid order cannot be cancelled until its payment is refunded.", 409);
    }

    let codSnapshot;
    let codCreated = false;
    let sslPaymentsChanged = false;
    let sslPendingPaymentIds = [];
    const restocked = [];
    try {
      if (status === "cancelled" && order.paymentMethod === "cod") {
        codSnapshot = await Payment.findOne({ order: order._id, attemptNumber: 1 }, null, options);
        if (codSnapshot && ["paid", "refunded"].includes(codSnapshot.status)) throw new AppError("A paid order cannot be cancelled until its payment is refunded.", 409);
        if (codSnapshot) {
          const changed = await Payment.updateOne({ _id: codSnapshot._id, status: { $nin: ["paid", "refunded"] } }, { $set: { status: "cancelled" } }, options);
          if (!changed.matchedCount) throw new AppError("The payment changed while the order was being cancelled.", 409);
        } else {
          const created = await Payment.create([{ order: order._id, attemptNumber: 1, customer: order.customer, paymentMethod: "cod", amount: order.total, currency: "BDT", gateway: "cod", status: "cancelled" }], options);
          codSnapshot = created[0];
          codCreated = true;
        }
      } else if (status === "cancelled" && order.paymentMethod === "sslcommerz") {
        const pendingPayments = await Payment.find({ order: order._id, status: "pending" }, "_id", options).lean();
        sslPendingPaymentIds = pendingPayments.map((payment) => payment._id);
        const changed = await Payment.updateMany({ order: order._id, status: "pending" }, { $set: { status: "cancelled" } }, options);
        sslPaymentsChanged = changed.modifiedCount > 0;
      }
      if (status === "cancelled") {
        for (const item of order.items) {
          const result = await Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } }, options);
          if (!result.matchedCount && !result.modifiedCount) throw new AppError("Could not restore stock for the cancelled order.", 500);
          restocked.push(item);
        }
      }
      const savedOrder = await Order.findOneAndUpdate(
        { _id: order._id, status: order.status, paymentStatus: order.paymentStatus },
        { $set: { status, paymentStatus: nextPaymentStatus } },
        { new: true, runValidators: true, ...options },
      );
      if (!savedOrder) throw new AppError("The order changed while this update was being applied. Refresh and try again.", 409);
      return savedOrder;
    } catch (error) {
      if (session) throw error;
      const rollbackTasks = [];
      for (const item of restocked) rollbackTasks.push(Product.updateOne({ _id: item.product }, { $inc: { stock: -item.quantity } }));
      if (order.paymentMethod === "cod" && codSnapshot) {
        rollbackTasks.push(codCreated
          ? Payment.deleteOne({ _id: codSnapshot._id, status: "cancelled" })
          : Payment.updateOne({ _id: codSnapshot._id, status: "cancelled" }, { $set: { status: codSnapshot.status } }));
      } else if (order.paymentMethod === "sslcommerz" && sslPaymentsChanged) {
        rollbackTasks.push(Payment.updateMany({ _id: { $in: sslPendingPaymentIds }, status: "cancelled" }, { $set: { status: "pending" } }));
      }
      const rollbackResults = await Promise.allSettled(rollbackTasks);
      if (rollbackResults.some((result) => result.status === "rejected")) {
        console.error("Order cancellation rollback was incomplete", { orderId: String(order._id), failedOperations: rollbackResults.filter((result) => result.status === "rejected").length });
      }
      throw error;
    }
  });
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
export const getAssignments = (partnerId) => Order.find({ deliveryPartner: partnerId, status: { $nin: ["cancelled", "delivered"] } }).sort({ createdAt: 1 }).populate("customer", "name phone").lean();
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
  order.status = status;
  return order.save();
}
export async function collectCodPayment(partnerId, orderId) {
  return withOptionalTransaction(async (session) => {
    const options = session ? { session } : {};
    const order = await Order.findOne({ _id: orderId, deliveryPartner: partnerId }, null, options);
    validateCodCollection(order, partnerId);
    const payment = await Payment.findOneAndUpdate(
      { order: order._id, attemptNumber: 1 },
      { $setOnInsert: { customer: order.customer, paymentMethod: "cod", amount: order.total, currency: "BDT", gateway: "cod", status: "pending" } },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true, ...options },
    );
    if (payment.paymentMethod !== "cod" || payment.gateway !== "cod" || String(payment.customer) !== String(order.customer)
      || payment.currency !== "BDT" || Number(payment.amount) !== Number(order.total)) {
      throw new AppError("The recorded COD payment does not match this order.", 409);
    }
    if (order.paymentStatus === "paid" && payment.status === "paid") return order;
    if (order.paymentStatus === "refunded" || payment.status === "refunded") throw new AppError("A refunded COD payment cannot be collected.", 409);
    if (payment.status === "paid") {
      const reconciledOrder = await Order.findOneAndUpdate(
        { _id: order._id, deliveryPartner: partnerId, paymentMethod: "cod", paymentStatus: { $in: ["pending", "unpaid"] }, status: { $in: ["outForDelivery", "delivered"] } },
        { $set: { paymentStatus: "paid" } },
        { new: true, runValidators: true, ...options },
      );
      if (reconciledOrder) return reconciledOrder;
      const latestOrder = await Order.findOne({ _id: order._id, deliveryPartner: partnerId }, null, options);
      if (latestOrder?.paymentStatus === "paid") return latestOrder;
      throw new AppError("The paid COD record does not match the current order state.", 409);
    }
    if (payment.status !== "pending") throw new AppError("This COD payment cannot be collected in its current payment state.", 409);

    const paidOrder = await Order.findOneAndUpdate(
      { _id: order._id, deliveryPartner: partnerId, paymentMethod: "cod", paymentStatus: { $in: ["pending", "unpaid"] }, status: { $in: ["outForDelivery", "delivered"] } },
      { $set: { paymentStatus: "paid" } },
      { new: true, runValidators: true, ...options },
    );
    if (!paidOrder) {
      const latestOrder = await Order.findOne({ _id: order._id, deliveryPartner: partnerId }, null, options);
      if (latestOrder?.paymentStatus === "paid") {
        const reconciledPayment = await Payment.findOneAndUpdate(
          { _id: payment._id, status: "pending" },
          { $set: { status: "paid", collectionConfirmedBy: partnerId, collectedAt: new Date() } },
          { new: true, runValidators: true, ...options },
        );
        if (reconciledPayment || (await Payment.findById(payment._id, null, options))?.status === "paid") return latestOrder;
      }
      throw new AppError("COD can be marked paid only after cash has been collected at delivery.", 409);
    }
    try {
      const paidPayment = await Payment.findOneAndUpdate(
        { _id: payment._id, status: "pending" },
        { $set: { status: "paid", collectionConfirmedBy: partnerId, collectedAt: new Date() } },
        { new: true, runValidators: true, ...options },
      );
      if (paidPayment || (await Payment.findById(payment._id, null, options))?.status === "paid") return paidOrder;
      throw new AppError("This COD payment has already changed state.", 409);
    } catch (error) {
      if (session) throw error;
      const latestPayment = await Payment.findById(payment._id).catch(() => null);
      if (latestPayment?.status === "paid") return paidOrder;
      const rollback = await Order.updateOne(
        { _id: order._id, deliveryPartner: partnerId, paymentStatus: "paid" },
        { $set: { paymentStatus: order.paymentStatus } },
      ).catch(() => null);
      if (!rollback?.modifiedCount) console.error("COD payment rollback was incomplete", { orderId: String(order._id) });
      throw error;
    }
  });
}
