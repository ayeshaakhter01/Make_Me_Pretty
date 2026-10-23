import express from "express";
import {
  getCoupons,
  getAllAdminCoupons,
  validateCouponCode,
  createCouponRecord,
  updateCouponRecord,
  deleteCouponRecord,
} from "../controllers/couponController.js";

const router = express.Router();

// Public: coupons that can be used right now
router.get("/", getCoupons);

// Public: checkout asks "is this code valid, and how much does it take off?"
router.post("/validate", validateCouponCode);

// Admin: manage coupons
// Local development only, same as the blog routes.
// TODO: protect with Akhi's auth + admin role middleware before deployment.
if (process.env.NODE_ENV !== "production") {
  router.get("/admin/all", getAllAdminCoupons);
  router.post("/", createCouponRecord);
  router.patch("/:id", updateCouponRecord);
  router.delete("/:id", deleteCouponRecord);
}

export default router;
