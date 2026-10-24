import Coupon from "../../../models/Coupon.js";
import AppError from "../../../utils/AppError.js";
import {
  checkCouponUsable,
  calculateCouponDiscount,
} from "../../../utils/couponCalculator.js";
import { validateCouponValueForType } from "../../../validators/couponValidator.js";

const DUPLICATE_CODE_MESSAGE = "A coupon with this code already exists";

// Customers only see what they need.
const PUBLIC_FIELDS = "code type value note minOrderAmount expiresAt -_id";

const normalizeCode = (code) => code.trim().toUpperCase();

// MongoDB filter: not expired and usage limit not reached.
const buildAvailableFilter = (now) => ({
  $and: [
    { $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }] },
    { $or: [{ usageLimit: null }, { $expr: { $lt: ["$usedCount", "$usageLimit"] } }] },
  ],
});

const throwIfDuplicateCode = (error) => {
  if (error.code === 11000) {
    throw new AppError(DUPLICATE_CODE_MESSAGE, 409);
  }

  throw error;
};

// Public: coupons that can be used right now (for the offers pop-up).
export const getActiveCoupons = async (now = new Date()) => {
  return await Coupon.find({ active: true, ...buildAvailableFilter(now) })
    .sort({ createdAt: -1 })
    .select(PUBLIC_FIELDS);
};

// Admin: everything, including usage numbers.
export const getAllCoupons = async () => {
  return await Coupon.find().sort({ createdAt: -1 }).select("-__v");
};

export const createCoupon = async (couponData) => {
  const code = normalizeCode(couponData.code);

  if (await Coupon.exists({ code })) {
    throw new AppError(DUPLICATE_CODE_MESSAGE, 409);
  }

  try {
    return await Coupon.create({
      code,
      type: couponData.type,
      value: couponData.type === "shipping" ? 0 : couponData.value,
      active: couponData.active ?? true,
      note: couponData.note?.trim() ?? "",
      minOrderAmount: couponData.minOrderAmount ?? 0,
      expiresAt: couponData.expiresAt ?? null,
      usageLimit: couponData.usageLimit ?? null,
    });
  } catch (error) {
    return throwIfDuplicateCode(error);
  }
};

export const updateCoupon = async (id, couponData) => {
  const allowedFields = [
    "code",
    "type",
    "value",
    "active",
    "note",
    "minOrderAmount",
    "expiresAt",
    "usageLimit",
  ];

  const existing = await Coupon.findById(id);

  if (!existing) {
    return null;
  }

  const updates = {};

  for (const field of allowedFields) {
    if (couponData[field] === undefined) continue;

    if (field === "code") {
      updates.code = normalizeCode(couponData.code);
    } else if (field === "note") {
      updates.note = couponData.note.trim();
    } else {
      updates[field] = couponData[field];
    }
  }

  // The value must still fit the type after the update.
  const finalType = updates.type ?? existing.type;
  const finalValue = updates.value ?? existing.value;
  const valueError = validateCouponValueForType(finalType, finalValue);

  if (valueError) {
    throw new AppError(valueError, 400);
  }

  if (finalType === "shipping") {
    updates.value = 0;
  }

  if (
    updates.code &&
    updates.code !== existing.code &&
    (await Coupon.exists({ code: updates.code }))
  ) {
    throw new AppError(DUPLICATE_CODE_MESSAGE, 409);
  }

  try {
    return await Coupon.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).select("-__v");
  } catch (error) {
    return throwIfDuplicateCode(error);
  }
};

export const deleteCoupon = async (id) => {
  return await Coupon.findByIdAndDelete(id);
};

// Used by checkout: is this code OK, and how much does it take off?
// Does NOT change usedCount. Call redeemCoupon after the order is saved.
export const validateCouponForOrder = async (
  { code, subtotal, deliveryCharge = 0 },
  now = new Date()
) => {
  const coupon = await Coupon.findOne({ code: normalizeCode(code) });
  const check = checkCouponUsable(coupon, subtotal, now);

  if (!check.usable) {
    return { valid: false, message: check.reason };
  }

  const discount = calculateCouponDiscount(coupon, subtotal, deliveryCharge);

  return {
    valid: true,
    coupon: {
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      note: coupon.note,
    },
    ...discount,
  };
};

// Used by the order service (Fayeza) AFTER an order is created successfully.
// One atomic step, so two orders cannot both take the last use.
// Returns the coupon, or null when it can no longer be used.
export const redeemCoupon = async (code, now = new Date()) => {
  return await Coupon.findOneAndUpdate(
    {
      code: normalizeCode(code),
      active: true,
      ...buildAvailableFilter(now),
    },
    { $inc: { usedCount: 1 } },
    { new: true }
  );
};
