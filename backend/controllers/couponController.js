import {
  getActiveCoupons,
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCouponForOrder,
} from "../services/couponService.js";

import validateCoupon, { validateCouponCheck } from "../validators/couponValidator.js";
import { sendValidationError, sendNotFound } from "../utils/responseHelpers.js";

export const getCoupons = async (req, res, next) => {
  try {
    const coupons = await getActiveCoupons();

    res.status(200).json({
      success: true,
      count: coupons.length,
      data: coupons,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllAdminCoupons = async (req, res, next) => {
  try {
    const coupons = await getAllCoupons();

    res.status(200).json({
      success: true,
      count: coupons.length,
      data: coupons,
    });
  } catch (error) {
    next(error);
  }
};

export const validateCouponCode = async (req, res, next) => {
  try {
    const validation = validateCouponCheck(req.body);

    if (!validation.isValid) {
      return sendValidationError(res, "Coupon check failed", validation.errors);
    }

    const result = await validateCouponForOrder(req.body);

    if (!result.valid) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    const { valid, ...data } = result;

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const createCouponRecord = async (req, res, next) => {
  try {
    const validation = validateCoupon(req.body);

    if (!validation.isValid) {
      return sendValidationError(res, "Coupon validation failed", validation.errors);
    }

    const coupon = await createCoupon(req.body);

    res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      data: coupon,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCouponRecord = async (req, res, next) => {
  try {
    const validation = validateCoupon(req.body, true);

    if (!validation.isValid) {
      return sendValidationError(res, "Coupon validation failed", validation.errors);
    }

    const coupon = await updateCoupon(req.params.id, req.body);

    if (!coupon) {
      return sendNotFound(res, "Coupon not found");
    }

    res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      data: coupon,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCouponRecord = async (req, res, next) => {
  try {
    const coupon = await deleteCoupon(req.params.id);

    if (!coupon) {
      return sendNotFound(res, "Coupon not found");
    }

    res.status(200).json({
      success: true,
      message: "Coupon deleted successfully",
      data: coupon,
    });
  } catch (error) {
    next(error);
  }
};
