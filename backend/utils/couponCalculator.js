// Pure coupon logic (no database), so it is easy to unit test.
// The backend always calculates discounts itself. Never trust totals from React.

export const COUPON_TYPES = ["percent", "fixed", "shipping"];

const toSafeAmount = (amount) =>
  Number.isFinite(amount) && amount > 0 ? amount : 0;

// Can this coupon be used right now for this order subtotal?
export const checkCouponUsable = (coupon, subtotal, now = new Date()) => {
  if (!coupon) {
    return { usable: false, reason: "This coupon code is not valid" };
  }

  if (!coupon.active) {
    return { usable: false, reason: "This coupon is not active" };
  }

  if (coupon.expiresAt && new Date(coupon.expiresAt) <= now) {
    return { usable: false, reason: "This coupon has expired" };
  }

  const hasLimit = coupon.usageLimit !== null && coupon.usageLimit !== undefined;

  if (hasLimit && (coupon.usedCount ?? 0) >= coupon.usageLimit) {
    return { usable: false, reason: "This coupon has reached its usage limit" };
  }

  const minimum = coupon.minOrderAmount ?? 0;

  if (toSafeAmount(subtotal) < minimum) {
    return {
      usable: false,
      reason: `Minimum order amount for this coupon is ৳${minimum}`,
    };
  }

  return { usable: true, reason: "" };
};

// itemDiscount     = money taken off the products
// deliveryDiscount = money taken off the delivery charge (free-delivery coupon)
export const calculateCouponDiscount = (coupon, subtotal, deliveryCharge = 0) => {
  const safeSubtotal = toSafeAmount(subtotal);
  const safeDelivery = toSafeAmount(deliveryCharge);

  let itemDiscount = 0;
  let deliveryDiscount = 0;

  if (coupon.type === "percent") {
    itemDiscount = Math.round((safeSubtotal * coupon.value) / 100);
  } else if (coupon.type === "fixed") {
    itemDiscount = coupon.value;
  } else if (coupon.type === "shipping") {
    deliveryDiscount = safeDelivery;
  }

  // A discount can never be more than the products cost.
  itemDiscount = Math.min(Math.max(itemDiscount, 0), safeSubtotal);

  return {
    itemDiscount,
    deliveryDiscount,
    totalDiscount: itemDiscount + deliveryDiscount,
  };
};
