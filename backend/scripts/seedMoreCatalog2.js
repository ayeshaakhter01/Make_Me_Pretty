import "dotenv/config";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import { MORE_CATALOG_SAMPLES_2 } from "./moreCatalogSamples2.js";

if (!process.env.MONGODB_URI) throw new Error("Set MONGODB_URI in backend/.env.");
await mongoose.connect(process.env.MONGODB_URI);
try {
  let inserted = 0;
  for (const sample of MORE_CATALOG_SAMPLES_2) {
        const { name, ...rest } = sample;
    // Only the name is refreshed on existing products (brand + name + size). Price, stock, photos and other edits are kept.
    const result = await Product.updateOne({ slug: sample.slug }, { $set: { name }, $setOnInsert: { ...rest, id: sample.slug, badge: "", priceCheckedAt: null } }, { upsert: true, runValidators: true });
    if (result.upsertedCount) inserted += 1;
  }
  console.log(`Processed ${MORE_CATALOG_SAMPLES_2.length} products; inserted ${inserted} new (rest already existed).`);
  console.log("Prices are estimates except where a source link is set. Add photos and verify prices in Admin -> Inventory.");
} finally {
  await mongoose.disconnect();
}
