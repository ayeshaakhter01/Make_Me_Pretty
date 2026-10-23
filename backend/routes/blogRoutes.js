
import express from "express";
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

// Admin: all posts, including drafts
// Keep this route BEFORE "/:slug".
if (process.env.NODE_ENV !== "production") {
  router.get("/admin/all", getAllAdminBlogs);

  // Local development only — protect before deployment.
  router.post("/", createBlogPost);
  router.patch("/:id", updateBlogPost);
  router.delete("/:id", deleteBlogPost);
}

// Public: one published post by slug
router.get("/:slug", getBlogBySlug);

export default router;
