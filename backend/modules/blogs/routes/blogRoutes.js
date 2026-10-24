
import express from "express";
import { requireAuth } from "../../../middlewares/authMiddleware.js";
import { requireRole } from "../../../middlewares/roleMiddleware.js";
import {
  getBlogs,
  getBlogBySlug,
  getAllAdminBlogs,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
} from "../controllers/blogController.js";

const router = express.Router();

// Public: published blog posts only
router.get("/", getBlogs);
// Public: one published post by slug. Declare before the protected admin block.
router.get("/:slug", getBlogBySlug);

// Admin: all posts, including drafts. Keep this route before "/:slug".
router.use(requireAuth, requireRole("admin"));
router.get("/admin/all", getAllAdminBlogs);
router.post("/", createBlogPost);
router.patch("/:id", updateBlogPost);
router.delete("/:id", deleteBlogPost);

export default router;
