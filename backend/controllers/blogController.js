
import {
  getPublishedBlogs,
  getPublishedBlogBySlug,
  getAllBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
} from "../services/blogService.js";

import validateBlog from "../validators/blogValidator.js";

export const getBlogs = async (req, res, next) => {
  try {
    const blogs = await getPublishedBlogs();

    res.status(200).json({
      success: true,
      count: blogs.length,
      data: blogs,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllAdminBlogs = async (req, res, next) => {
  try {
    const blogs = await getAllBlogs();

    res.status(200).json({
      success: true,
      count: blogs.length,
      data: blogs,
    });
  } catch (error) {
    next(error);
  }
};

export const getBlogBySlug = async (req, res, next) => {
  try {
    const blog = await getPublishedBlogBySlug(req.params.slug);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    res.status(200).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    next(error);
  }
};

export const createBlogPost = async (req, res, next) => {
  try {
    const validation = validateBlog(req.body);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Blog validation failed",
        errors: validation.errors,
      });
    }

    const blog = await createBlog(req.body);

    res.status(201).json({
      success: true,
      message: "Blog post created successfully",
      data: blog,
    });
  } catch (error) {
    next(error);
  }
};

export const updateBlogPost = async (req, res, next) => {
  try {
    const validation = validateBlog(req.body, true);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Blog validation failed",
        errors: validation.errors,
      });
    }

    const blog = await updateBlog(req.params.id, req.body);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Blog post updated successfully",
      data: blog,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBlogPost = async (req, res, next) => {
  try {
    const blog = await deleteBlog(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Blog post deleted successfully",
      data: blog,
    });
  } catch (error) {
    next(error);
  }
};
