import express from "express";
import { getMe, login, register, resendVerificationEmail, verifyEmailLink } from "../controllers/authController.js";
import { requireAuth } from "../../../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify-email", verifyEmailLink);
router.post("/resend-verification", resendVerificationEmail);
router.get("/me", requireAuth, getMe);

export default router;
