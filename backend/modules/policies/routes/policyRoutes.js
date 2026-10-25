import express from "express";
import { requireAuth } from "../../../middlewares/authMiddleware.js";
import { requireRole } from "../../../middlewares/roleMiddleware.js";
import { create, getOne, listAdmin, listPublic, remove, update } from "../controllers/policyController.js";

const router = express.Router();
router.get("/", listPublic);
router.get("/admin/all", requireAuth, requireRole("admin"), listAdmin);
router.get("/:slug", getOne);
router.post("/", requireAuth, requireRole("admin"), create);
router.patch("/:id", requireAuth, requireRole("admin"), update);
router.delete("/:id", requireAuth, requireRole("admin"), remove);
export default router;
