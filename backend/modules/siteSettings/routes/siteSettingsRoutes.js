
import express from "express";

import {
  getPublicSettings,
  patchSettings,
  getPolicies,
  postPolicy,
  putPolicy,
  removePolicy,
} from "../controllers/siteSettingsController.js";

import { requireAuth } from "../../../middlewares/authMiddleware.js";
import { requireRole } from "../../../middlewares/roleMiddleware.js";

const router = express.Router();

const adminOnly = [requireAuth, requireRole("admin")];

// Existing footer settings
router.get("/", getPublicSettings);
router.patch("/", ...adminOnly, patchSettings);

// Policy documents
router.get("/policies", getPolicies);
router.post("/policies", ...adminOnly, postPolicy);
router.put("/policies/:id", ...adminOnly, putPolicy);
router.delete("/policies/:id", ...adminOnly, removePolicy);

export default router;
