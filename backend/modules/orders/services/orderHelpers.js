import { createHash } from "node:crypto";
import AppError from "../../../utils/AppError.js";

export function normalizeOrderRequest(input) {
  input = input ?? {};
  if (!Array.isArray(input.items) || input.items.length === 0 || input.items.length > 50) throw new AppError("Add at least one item to your order.", 400);
  if (!input.address || typeof input.address.recipientName !== "string" || !input.address.recipientName.trim() || typeof input.address.addressLine !== "string" || !input.address.addressLine.trim() || input.address.addressLine.trim().length > 1000 || typeof input.address.area !== "string" || !input.address.area.trim() || typeof input.address.city !== "string" || !input.address.city.trim() || typeof input.address.phone !== "string" || !/^[0-9+() -]{8,30}$/.test(input.address.phone.trim())) {
    throw new AppError("A recipient name, valid phone number, district, area, and delivery address are required.", 400);
  }
  if (!["cod", "sslcommerz"].includes(input.paymentMethod)) throw new AppError("Choose Cash on Delivery or SSLCommerz.", 400);

  const quantities = new Map();
  for (const item of input.items) {
    if (!item || typeof item.productId !== "string" || !/^[\da-f]{24}$/i.test(item.productId) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) throw new AppError("Each item needs a valid product and quantity (1–99).", 400);
    const productId = item.productId.toLowerCase();
    quantities.set(productId, (quantities.get(productId) || 0) + item.quantity);
  }
  if ([...quantities.values()].some((quantity) => quantity > 99)) throw new AppError("Each item needs a valid product and quantity (1–99).", 400);
  const address = Object.fromEntries(["recipientName", "phone", "addressLine", "area", "city"].map((key) => [key, typeof input.address[key] === "string" ? input.address[key].trim() : ""]));
  const couponCode = typeof input.couponCode === "string" ? input.couponCode.trim().toUpperCase() : "";
  const canonical = { items: [...quantities].sort(([a], [b]) => a.localeCompare(b)), address, couponCode, paymentMethod: input.paymentMethod };
  const fingerprint = createHash("sha256").update(JSON.stringify(canonical)).digest("hex");
  return { quantities, address, fingerprint, couponCode, paymentMethod: input.paymentMethod };
}

export function validateIdempotencyKey(value) {
  if (typeof value !== "string" || value.length < 16 || value.length > 100 || !/^[A-Za-z0-9._-]+$/.test(value)) throw new AppError("A valid Idempotency-Key header is required.", 400);
  return value;
}

export function deliveryFee(subtotal, city) {
  return subtotal >= 3000 || subtotal === 0 ? 0 : city?.trim().toLowerCase() === "chattogram" ? 60 : 120;
}

export function calculateOrderTotals(items, city, discount = 0) {
  if (!Array.isArray(items) || items.length === 0 || items.some((item) => !Number.isFinite(item.price) || item.price < 0 || !Number.isInteger(item.quantity) || item.quantity < 1)) {
    throw new AppError("Order items contain invalid server-side prices or quantities.", 400);
  }
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryCharge = deliveryFee(subtotal, city);
  if (!Number.isFinite(discount) || discount < 0 || discount > subtotal + deliveryCharge) throw new AppError("The order discount is invalid.", 400);
  return { subtotal, deliveryCharge, discount, total: subtotal + deliveryCharge - discount };
}

export function validateCodCollection(order, partnerId) {
  if (!order || String(order.deliveryPartner) !== String(partnerId)) throw new AppError("Delivery assignment not found.", 404);
  if (order.paymentMethod !== "cod" || !["pending", "unpaid", "paid"].includes(order.paymentStatus) || !["outForDelivery", "delivered"].includes(order.status)) throw new AppError("COD can be marked paid only after cash has been collected at delivery.", 409);
}

export function paymentStatusAfterFulfillmentChange(order, nextOrderStatus) {
  if (nextOrderStatus !== "cancelled") return order.paymentStatus;
  if (order.paymentStatus === "paid") throw new AppError("A paid order cannot be cancelled until its payment is refunded.", 409);
  if (["cod", "sslcommerz"].includes(order.paymentMethod) && ["pending", "unpaid", "failed"].includes(order.paymentStatus)) return "cancelled";
  return order.paymentStatus;
}
