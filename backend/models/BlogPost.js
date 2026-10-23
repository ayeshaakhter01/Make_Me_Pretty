
import mongoose from "mongoose";

const blogPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    tag: {
      type: String,
      required: true,
      trim: true,
      default: "Tips",
    },
    read: {
      type: String,
      default: "3 min read",
      trim: true,
    },
    excerpt: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: [String],
      required: true,
      validate: {
        validator: (paragraphs) =>
          paragraphs.length > 0 &&
          paragraphs.every((paragraph) => paragraph.trim().length > 0),
        message: "A blog post must contain at least one non-empty paragraph",
      },
    },
    image: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
    },
    order: {
      type: Number,
      default: 0,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const BlogPost = mongoose.model("BlogPost", blogPostSchema);

export default BlogPost;
