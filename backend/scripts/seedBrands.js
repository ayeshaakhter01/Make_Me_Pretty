import "dotenv/config";
import mongoose from "mongoose";
import Brand from "../models/Brand.js";
import Product from "../models/Product.js";
// One-time copy of the old hard-coded brand list into the database.
import { BRAND_LOGOS, DEFAULT_BRANDS } from "../../frontend/src/data/brandSource.js";

const logoPath = (value) => (!value ? "" : /^https:\/\//i.test(value) ? value : value.startsWith("/") ? value : `/${value}`);

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const names = new Set([...DEFAULT_BRANDS.map((b) => b.brand), ...Object.keys(BRAND_LOGOS), ...(await Product.distinct("brand")).filter(Boolean)]);
    let created = 0;
    for (const name of names) {
      const index = DEFAULT_BRANDS.findIndex((b) => b.brand === name);
      const result = await Brand.updateOne({ name }, { $setOnInsert: {
        name,
        description: DEFAULT_BRANDS[index]?.description || "",
        logo: logoPath(BRAND_LOGOS[name]),
        order: index >= 0 ? index : 100,
        active: true,
      } }, { upsert: true });
      if (result.upsertedCount) created += 1;
    }
    console.log(`Brands seeded. Created ${created}, already existed ${names.size - created}.`);
  } catch (error) {
    console.error("Seeding brands failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};
run();
