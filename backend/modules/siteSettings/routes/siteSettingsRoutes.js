import express from "express";
import { getPublicSettings, patchSettings } from "../controllers/siteSettingsController.js";
import { requireAuth } from "../../../middlewares/authMiddleware.js";
import { requireRole } from "../../../middlewares/roleMiddleware.js";
const router = express.Router();
router.get("/", getPublicSettings);
router.patch("/", requireAuth, requireRole("admin"), patchSettings);
export default router;
