import express from "express";
import { requireAuth } from "../../../middlewares/authMiddleware.js";
import { requireRole } from "../../../middlewares/roleMiddleware.js";
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

router.use(requireAuth, requireRole("admin"));
router.get("/admin/all", getAllAdminCoupons);
router.post("/", createCouponRecord);
router.patch("/:id", updateCouponRecord);
router.delete("/:id", deleteCouponRecord);

export default router;
