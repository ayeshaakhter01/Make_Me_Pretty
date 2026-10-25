import "dotenv/config";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import { OFFICIAL_NAMES } from "./officialNames.js";

if (!process.env.MONGODB_URI) throw new Error("Set MONGODB_URI in backend/.env.");
await mongoose.connect(process.env.MONGODB_URI);
try {
  let changed = 0;
  for (const [slug, name] of Object.entries(OFFICIAL_NAMES)) {
    const result = await Product.updateOne({ slug }, { $set: { name } });
    if (result.modifiedCount) { changed += 1; console.log(`renamed: ${slug} -> ${name}`); }
    else if (!result.matchedCount) console.log(`not found: ${slug}`);
  }
  console.log(`Done. ${changed} product name(s) updated. Slugs and links are unchanged.`);
} finally {
  await mongoose.disconnect();
}
