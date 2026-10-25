import mongoose from "mongoose";

export const ORDER_STATUSES = ["pending", "confirmed", "shipped", "outForDelivery", "delivered", "cancelled"];
// `unpaid` remains accepted for existing order documents; new payment records use `pending`.
export const ORDER_PAYMENT_STATUSES = ["pending", "unpaid", "paid", "failed", "cancelled", "refunded"];
const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true, sparse: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  idempotencyKey: { type: String, maxlength: 100, select: false },
  requestFingerprint: { type: String, maxlength: 64, select: false },
  deliveryPartner: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
  issue: { type: String, default: "", maxlength: 500 },
  adminSeenAt: { type: Date, default: null },
  partnerSeenAt: { type: Date, default: null },
  isDemo: { type: Boolean, default: false },
  messages: [{ sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, senderName: { type: String, required: true, maxlength: 80 }, role: { type: String, enum: ["admin", "deliveryPartner", "customer"], required: true }, kind: { type: String, enum: ["message", "issue", "location"], default: "message" }, text: { type: String, required: true, maxlength: 1500 }, link: { type: String, default: "", maxlength: 1000 }, at: { type: Date, default: Date.now } }],
  items: [{ product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true }, name: { type: String, required: true }, image: String, quantity: { type: Number, min: 1, required: true }, price: { type: Number, min: 0, required: true } }],
  address: { recipientName: String, phone: String, addressLine: { type: String, required: true }, area: String, city: String },
  subtotal: { type: Number, min: 0, required: true }, deliveryCharge: { type: Number, min: 0, required: true }, discount: { type: Number, min: 0, default: 0 }, couponCode: { type: String, default: "" }, total: { type: Number, min: 0, required: true },
  paymentMethod: { type: String, enum: ["cod", "sslcommerz", "bkash", "card"], required: true }, paymentStatus: { type: String, enum: ORDER_PAYMENT_STATUSES, default: "pending", index: true }, status: { type: String, enum: ORDER_STATUSES, default: "pending", index: true },
}, {
  timestamps: true,
  toJSON: { transform(_document, value) { delete value.idempotencyKey; delete value.requestFingerprint; return value; } },
});
orderSchema.index({ customer: 1, idempotencyKey: 1 }, { unique: true, partialFilterExpression: { idempotencyKey: { $type: "string" } } });
export default mongoose.model("Order", orderSchema);
