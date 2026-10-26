import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import Banner from "../models/Banner.js";
import BlogPost from "../models/BlogPost.js";
import Brand from "../models/Brand.js";
import Product from "../models/Product.js";
import Review from "../models/Review.js";
import StoreSettings from "../models/StoreSettings.js";

// Read-only. Lists every image path saved in MongoDB and checks that the file exists.
// Run:  node scripts/checkImagePaths.js           (checks files on disk)
//       node scripts/checkImagePaths.js --online  (also tries every https:// image)
const backendDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(backendDir, "..", "frontend", "public");
const online = process.argv.includes("--online");

const rows = [];
const add = (area, name, value) => { if (value && typeof value === "string") rows.push({ area, name: String(name), value }); };

async function check(value) {
  if (/^data:/i.test(value)) return "ok (inline data)";
  if (/^https?:\/\//i.test(value)) {
    if (!online) return "external (not checked, use --online)";
    try {
      const response = await fetch(value, { headers: { Range: "bytes=0-0", Referer: "http://localhost:5173/" }, signal: AbortSignal.timeout(8000) });
      return response.status < 400 ? "ok (external)" : `BROKEN external (HTTP ${response.status})`;
    } catch (error) {
      return `BROKEN external (${error.name})`;
    }
  }
  const clean = value.split("?")[0].replace(/^\/+/, "");
  const onDisk = clean.startsWith("uploads/") ? path.join(backendDir, clean) : path.join(publicDir, clean);
  return fs.existsSync(onDisk) ? "ok (file found)" : `MISSING FILE (${clean.startsWith("uploads/") ? "backend/" : "frontend/public/"}${clean})`;
}

await mongoose.connect(process.env.MONGODB_URI);
try {
  for (const brand of await Brand.find().lean()) add("Brand logo", brand.name, brand.logo);
  for (const product of await Product.find().select("name images").lean()) (product.images || []).forEach((image) => add("Product image", product.name, image));
  for (const banner of await Banner.find().lean()) add("Banner", banner.title || banner._id, banner.src);
  for (const post of await BlogPost.find().select("title image").lean()) add("Blog image", post.title, post.image);
  for (const review of await Review.find().select("image images").lean()) [review.image, ...(review.images || [])].forEach((image) => add("Review photo", review._id, image));
  const settings = await StoreSettings.findOne().lean();
  add("Site logo", "logo", settings?.logo);
  for (const payment of settings?.footer?.payments || []) add("Footer payment logo", payment.label, payment.src);

  const results = [];
  for (const row of rows) results.push({ ...row, status: await check(row.value) });

  const summary = {};
  for (const row of results) {
    const key = `${row.area}`;
    summary[key] ??= { total: 0, ok: 0, external: 0, broken: 0 };
    summary[key].total += 1;
    if (row.status.startsWith("ok")) summary[key].ok += 1;
    else if (row.status.startsWith("external")) summary[key].external += 1;
    else summary[key].broken += 1;
  }
  console.table(summary);
  const broken = results.filter((row) => row.status.startsWith("MISSING") || row.status.startsWith("BROKEN"));
  console.log(broken.length ? `\n${broken.length} image(s) will NOT show:\n` : "\nEvery checked image is reachable.");
  for (const row of broken) console.log(`- [${row.area}] ${row.name}: ${row.value}  ->  ${row.status}`);
  if (!settings?.footer) console.log("\nNote: no footer saved in the database, so the default payment logos in /uploads/payment-logos are used.");
} finally {
  await mongoose.disconnect();
}