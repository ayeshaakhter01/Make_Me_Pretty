import express from "express";
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

// Admin: manage slides (all slides, including hidden ones)
// Local development only, same as the blog routes.
// TODO: protect with Akhi's auth + admin role middleware before deployment.
if (process.env.NODE_ENV !== "production") {
  router.get("/admin/all", getAllAdminBanners);
  router.post("/", createBannerRecord);
  router.patch("/:id", updateBannerRecord);
  router.delete("/:id", deleteBannerRecord);
}

export default router;
