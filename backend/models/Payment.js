import mongoose from "mongoose";
import { randomUUID } from "node:crypto";

export const PAYMENT_METHODS = ["cod", "sslcommerz"];
export const PAYMENT_STATUSES = ["pending", "paid", "failed", "cancelled", "refunded"];
export const PAYMENT_GATEWAYS = ["cod", "sslcommerz"];

const verificationSchema = new mongoose.Schema({
  verified: { type: Boolean, default: false },
  verifiedAt: { type: Date, default: null },
  validationId: { type: String, default: "", maxlength: 120 },
  bankTransactionId: { type: String, default: "", maxlength: 120 },
  responseCode: { type: String, default: "", maxlength: 40 },
  riskLevel: { type: String, enum: ["", "0", "1"], default: "" },
}, { _id: false });

const paymentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, index: true },
  attemptNumber: { type: Number, min: 1, default: 1, required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  idempotencyKey: { type: String, maxlength: 100, select: false },
  paymentMethod: { type: String, enum: PAYMENT_METHODS, required: true },
  amount: { type: Number, min: 0, required: true },
  currency: { type: String, enum: ["BDT"], default: "BDT", required: true },
  status: { type: String, enum: PAYMENT_STATUSES, default: "pending", required: true, index: true },
  gateway: { type: String, enum: PAYMENT_GATEWAYS, required: true },
  collectionConfirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  collectedAt: { type: Date, default: null },
  // Internal reference used for reconciliation. Never use or store card credentials here.
  transactionId: { type: String, required: true, unique: true, default: () => `MMP-${randomUUID()}`, maxlength: 80 },
  gatewayTransactionId: { type: String, default: undefined, maxlength: 120 },
  gatewayPageUrl: { type: String, default: "", maxlength: 1000, select: false },
  gatewayInitializationToken: { type: String, default: "", maxlength: 64, select: false },
  gatewayInitializationUntil: { type: Date, default: null, select: false },
  verificationDetails: { type: verificationSchema, default: () => ({}) },
}, { timestamps: true });

paymentSchema.index({ order: 1, attemptNumber: 1 }, { unique: true });
paymentSchema.index({ order: 1 }, { unique: true, partialFilterExpression: { status: "pending" }, name: "one_pending_payment_attempt_per_order" });
paymentSchema.index({ order: 1, idempotencyKey: 1 }, { unique: true, partialFilterExpression: { idempotencyKey: { $type: "string" } } });
paymentSchema.index({ gateway: 1, gatewayTransactionId: 1 }, {
  unique: true,
  partialFilterExpression: { gatewayTransactionId: { $type: "string" } },
});
paymentSchema.index({ customer: 1, createdAt: -1 });
paymentSchema.pre("validate", function validateGatewayMethod() {
  if (this.paymentMethod !== this.gateway) {
    this.invalidate("gateway", "Gateway must match the selected payment method.");
  }
});

export default mongoose.model("Payment", paymentSchema);
