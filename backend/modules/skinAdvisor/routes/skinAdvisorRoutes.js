import express from "express";
import { recommendations } from "../controllers/skinAdvisorController.js";
const router = express.Router();
router.post("/recommendations", recommendations);
export default router;
