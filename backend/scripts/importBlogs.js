
import "dotenv/config";
import mongoose from "mongoose";
import BlogPost from "../models/BlogPost.js";

const generateSlug = (title) => {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "blog-post";
};

const runImport = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");

    // Existing frontend posts will be exported to JSON first.
    // This script reads that JSON file.
    const { default: posts } = await import("./blogPosts.json", {
      with: { type: "json" },
    });

    let imported = 0;
    let skipped = 0;

    for (const [index, post] of posts.entries()) {
      if (!post.title || !Array.isArray(post.body) || post.body.length === 0) {
        console.log(`Skipped invalid post at position ${index + 1}.`);
        skipped++;
        continue;
      }

      const slug = generateSlug(post.title);

      const existing = await BlogPost.findOne({ slug });

      if (existing) {
        console.log(`Already exists: ${post.title}`);
        skipped++;
        continue;
      }

      await BlogPost.create({
        title: post.title,
        slug,
        tag: post.tag || "Tips",
        read: post.read || "3 min read",
        excerpt: post.excerpt || post.body[0],
        body: post.body,
        image: post.image || "",
        status: post.active === false ? "draft" : "published",
        order: index,
        publishedAt: post.active === false ? null : new Date(),
      });

      imported++;
      console.log(`Imported: ${post.title}`);
    }

    console.log(`\nImport complete. Imported: ${imported}; skipped: ${skipped}.`);
  } catch (error) {
    console.error("Blog import failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

runImport();
