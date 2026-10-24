import express from "express";
import { requireAuth } from "../../../middlewares/authMiddleware.js";
import { requireRole } from "../../../middlewares/roleMiddleware.js";
import {
  getBanners,
  getAllAdminBanners,
  createBannerRecord,
  updateBannerRecord,
  deleteBannerRecord,
} from "../controllers/bannerController.js";

const router = express.Router();

// Public: homepage slides that are switched on
router.get("/", getBanners);

// Admin endpoints are always protected, including in development.
router.use(requireAuth, requireRole("admin"));
router.get("/admin/all", getAllAdminBanners);
router.post("/", createBannerRecord);
router.patch("/:id", updateBannerRecord);
router.delete("/:id", deleteBannerRecord);

export default router;
