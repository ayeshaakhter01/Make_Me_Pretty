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
  reorderBlogPosts,
} from "../controllers/blogController.js";

const router = express.Router();

// Public: published blog posts only
router.get("/", getBlogs);
// Public: one published post by slug (one path segment, so it never clashes with /admin/all)
router.get("/:slug", getBlogBySlug);

// Everything below this line needs an admin login
router.use(requireAuth, requireRole("admin"));
router.get("/admin/all", getAllAdminBlogs);
router.post("/", createBlogPost);
// "/reorder" must stay ABOVE "/:id", otherwise Express reads "reorder" as an id
router.patch("/reorder", reorderBlogPosts);
router.patch("/:id", updateBlogPost);
router.delete("/:id", deleteBlogPost);

export default router;