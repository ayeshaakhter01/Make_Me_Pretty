import express from "express";
import {
  addAddress,
  deleteAddress,
  getAddresses,
  updateAddress
} from "../controllers/addressController.js";
import {
  getProfile,
  updateProfile
} from "../controllers/userController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/me", requireAuth, getProfile);
router.patch("/me", requireAuth, updateProfile);

router.get("/me/addresses", requireAuth, getAddresses);
router.post("/me/addresses", requireAuth, addAddress);
router.patch("/me/addresses/:addressId", requireAuth, updateAddress);
router.delete("/me/addresses/:addressId", requireAuth, deleteAddress);

export default router;