import mongoose from "mongoose";
import { COUPON_TYPES } from "../utils/couponCalculator.js";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: COUPON_TYPES,
      required: true,
    },
    // percent: 1-100, fixed: amount in taka, shipping: always 0
    value: {
      type: Number,
      default: 0,
      min: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
    note: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200,
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    // null = unlimited uses
    usageLimit: {
      type: Number,
      default: null,
      min: 1,
    },
    // Controlled by the server only (see redeemCoupon).
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

const Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon;
