
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { BLOG_POSTS } from "../src/data/blogSource.js";

const outputPath = resolve("../backend/scripts/blogPosts.json");

await writeFile(
  outputPath,
  JSON.stringify(BLOG_POSTS, null, 2),
  "utf8"
);

console.log(`Successfully exported ${BLOG_POSTS.length} blog posts.`);
console.log(`Saved to: ${outputPath}`);
