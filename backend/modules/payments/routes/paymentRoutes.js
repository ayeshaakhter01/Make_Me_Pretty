import express from "express";
import { config, failure, initiate, ipn, parseGatewayForm, success, cancellation } from "../controllers/paymentController.js";
import { requireAuth } from "../../../middlewares/authMiddleware.js";
import { requireRole } from "../../../middlewares/roleMiddleware.js";

const router = express.Router();
router.get("/config", config);
router.post("/sslcommerz/success", parseGatewayForm, success);
router.post("/sslcommerz/fail", parseGatewayForm, failure);
router.post("/sslcommerz/cancel", parseGatewayForm, cancellation);
router.post("/sslcommerz/ipn", parseGatewayForm, ipn);
router.post("/sslcommerz/initiate", requireAuth, requireRole("customer"), initiate);
export default router;
