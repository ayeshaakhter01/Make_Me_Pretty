import express from "express";
import {
  addStaffUser,
  deleteUser,
  getUsers,
  updateUserRole,
  addAddressForUser,
  deleteAddressForUser,
  editAddressForUser,
  editUserDetails
} from "../controllers/adminUserController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.get("/users", requireAuth, requireRole("admin"), getUsers);
router.post("/users", requireAuth, requireRole("admin"), addStaffUser);
router.patch("/users/:userId/role", requireAuth, requireRole("admin"), updateUserRole);
router.delete("/users/:userId", requireAuth, requireRole("admin"), deleteUser);
router.patch("/users/:userId", requireAuth, requireRole("admin"), editUserDetails);
router.post("/users/:userId/addresses", requireAuth, requireRole("admin"), addAddressForUser);
router.patch("/users/:userId/addresses/:addressId", requireAuth, requireRole("admin"), editAddressForUser);
router.delete("/users/:userId/addresses/:addressId", requireAuth, requireRole("admin"), deleteAddressForUser);

export default router;