import "dotenv/config";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import { MORE_CATALOG_SAMPLES } from "./moreCatalogSamples.js";

if (!process.env.MONGODB_URI) throw new Error("Set MONGODB_URI in backend/.env.");
await mongoose.connect(process.env.MONGODB_URI);
try {
  let inserted = 0;
  for (const [index, sample] of MORE_CATALOG_SAMPLES.entries()) {
    const existing = await Product.exists({ slug: sample.slug });
    await Product.updateOne({ slug: sample.slug }, {
      $set: { ...sample, id: sample.slug, active: true, badge: "", stock: 12 + ((index * 7) % 20), priceCheckedAt: new Date("2026-10-24T00:00:00Z") },
    }, { upsert: true, runValidators: true });
    if (!existing) inserted += 1;
  }
  console.log(`Published ${MORE_CATALOG_SAMPLES.length} retailer-listed products; inserted ${inserted} new records.`);
  console.log("Prices were checked against the linked Bangladesh retailer pages. Stock quantities are coursework estimates, not a physical count.");
} finally {
  await mongoose.disconnect();
}
