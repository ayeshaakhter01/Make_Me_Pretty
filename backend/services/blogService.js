
import BlogPost from "../models/BlogPost.js";


const generateSlug = (title) => {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "blog-post";
};

const generateUniqueSlug = async (title) => {
  const baseSlug = generateSlug(title);
  let slug = baseSlug;
  let suffix = 2;

  while (await BlogPost.exists({ slug })) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
};

export const getPublishedBlogs = async () => {
  return await BlogPost.find({ status: "published" })
    .sort({ order: 1, publishedAt: -1, createdAt: -1 })
    .select("-__v");
};

export const getAllBlogs = async () => {
  return await BlogPost.find()
    .sort({ order: 1, createdAt: -1 })
    .select("-__v");
};

export const getPublishedBlogBySlug = async (slug) => {
  return await BlogPost.findOne({
    slug,
    status: "published",
  }).select("-__v");
};

export const createBlog = async (blogData) => {
  const {
    title,
    slug,
    tag,
    read,
    excerpt,
    body,
    image,
    status,
    order,
  } = blogData;

  const blogStatus = status ?? "published";

  const blogSlug = slug?.trim()
  ? slug.trim().toLowerCase()
  : await generateUniqueSlug(title);

  return await BlogPost.create({
    title: title.trim(),
    slug: blogSlug,
    tag: tag?.trim() || "Tips",
    read: read?.trim() || "3 min read",
    excerpt: excerpt.trim(),
    body: body.map((paragraph) => paragraph.trim()),
    image: image?.trim() ?? "",
    status: blogStatus,
    order: order ?? 0,
    publishedAt: blogStatus === "published" ? new Date() : null,
  });
};

export const updateBlog = async (id, blogData) => {
  const allowedFields = [
    "title",
    "slug",
    "tag",
    "read",
    "excerpt",
    "body",
    "image",
    "status",
    "order",
  ];

  const updates = {};

  for (const field of allowedFields) {
    if (blogData[field] !== undefined) {
      const value = blogData[field];

      if (field === "slug" && typeof value === "string") {
        updates[field] = value.trim().toLowerCase();
      } else if (typeof value === "string") {
        updates[field] = value.trim();
      } else if (field === "body" && Array.isArray(value)) {
        updates[field] = value.map((paragraph) => paragraph.trim());
      } else {
        updates[field] = value;
      }
    }
  }

  const existingBlog = await BlogPost.findById(id);

  if (!existingBlog) {
    return null;
  }

  if (
    updates.status === "published" &&
    existingBlog.status !== "published"
  ) {
    updates.publishedAt = new Date();
  }

  if (updates.status === "draft") {
    updates.publishedAt = null;
  }

  return await BlogPost.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  }).select("-__v");
};

export const deleteBlog = async (id) => {
  return await BlogPost.findByIdAndDelete(id);
};
