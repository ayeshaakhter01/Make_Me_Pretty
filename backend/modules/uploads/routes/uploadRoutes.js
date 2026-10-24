import express from "express";
import { uploadImage } from "../controllers/uploadController.js";
import { requireAuth } from "../../../middlewares/authMiddleware.js";
import { requireRole } from "../../../middlewares/roleMiddleware.js";

const router = express.Router();
router.post("/images", requireAuth, requireRole("admin"), express.raw({ type: ["image/jpeg", "image/png", "image/webp"], limit: "10mb" }), uploadImage);
export default router;
