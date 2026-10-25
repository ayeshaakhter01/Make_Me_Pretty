import express from "express";
import { uploadImage } from "../controllers/uploadController.js";
import { requireAuth } from "../../../middlewares/authMiddleware.js";
import { requireRole } from "../../../middlewares/roleMiddleware.js";

const router = express.Router();

// Admin: product, banner and blog pictures (up to 10 MB).
router.post("/images", requireAuth, requireRole("admin"), express.raw({ type: ["image/jpeg", "image/png", "image/webp"], limit: "10mb" }), uploadImage);

// Any signed-in user: a photo for a product review. Smaller (3 MB) and limited
// to 5 uploads per user every 10 minutes so nobody can fill the server disk.
const recentUploads = new Map();
function limitReviewUploads(req, res, next) {
  const key = String(req.user._id);
  const now = Date.now();
  const recent = (recentUploads.get(key) || []).filter((time) => now - time < 10 * 60 * 1000);
  if (recent.length >= 12) {
    return res.status(429).json({ success: false, message: "Too many photo uploads. Please try again in a few minutes." });
  }
  recent.push(now);
  recentUploads.set(key, recent);
  return next();
}
router.post("/review-images", requireAuth, limitReviewUploads, express.raw({ type: ["image/jpeg", "image/png", "image/webp"], limit: "3mb" }), uploadImage);

export default router;
