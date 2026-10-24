import express from "express";
import { getBehaviourReport, getProductReport, getSalesReport } from "../controllers/reportController.js";
const router = express.Router();
router.get("/sales", getSalesReport);
router.get("/products", getProductReport);
router.get("/behaviour", getBehaviourReport);
export default router;
