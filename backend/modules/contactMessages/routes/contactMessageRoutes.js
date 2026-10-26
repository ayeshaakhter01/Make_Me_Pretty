import express from "express";
import { requireAuth } from "../../../middlewares/authMiddleware.js";
import { requireRole } from "../../../middlewares/roleMiddleware.js";
import { listAdminContactMessages, submitContactMessage, updateAdminContactMessage } from "../controllers/contactMessageController.js";

const publicRouter = express.Router();
const adminRouter = express.Router();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_SUBMISSIONS = 5;
const submissionWindows = new Map();

function limitContactSubmissions(req, res, next) {
  // The honeypot is accepted without saving; repeated bot traps should not consume the public form limit.
  if (typeof req.body?.website === "string" && req.body.website.trim()) return next();
  const now = Date.now();
  for (const [ip, window] of submissionWindows) if (now - window.startedAt >= WINDOW_MS) submissionWindows.delete(ip);
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const current = submissionWindows.get(ip);
  if (current && now - current.startedAt < WINDOW_MS && current.count >= MAX_SUBMISSIONS) {
    res.set("Retry-After", String(Math.ceil((WINDOW_MS - (now - current.startedAt)) / 1000)));
    return res.status(429).json({ success: false, message: "Too many messages were submitted. Please try again later." });
  }
  if (!current || now - current.startedAt >= WINDOW_MS) submissionWindows.set(ip, { startedAt: now, count: 1 });
  else current.count += 1;
  return next();
}

publicRouter.post("/", limitContactSubmissions, submitContactMessage);
adminRouter.use(requireAuth, requireRole("admin"));
adminRouter.get("/", listAdminContactMessages);
adminRouter.patch("/:id", updateAdminContactMessage);

export { publicRouter as contactMessageRoutes, adminRouter as adminContactMessageRoutes };
