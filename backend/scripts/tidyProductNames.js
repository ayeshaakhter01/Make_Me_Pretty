import "dotenv/config";
import mongoose from "mongoose";
import Product from "../models/Product.js";

/* Shortens a few long product names in the database. The page address (slug) is NOT changed, so links keep working.
   Edit the list below to change a name, then run:  node scripts/tidyProductNames.js
   Safe to run again. (You can also rename any product in Admin -> Inventory -> Edit.) */
const NAMES = {
  "anua-heartleaf-77-hydrating-soothing-toner": "Heartleaf 77 Soothing Toner",
  "beauty-of-joseon-relief-sun-rice-niacinamide": "Relief Sun: Rice + Niacinamide SPF50+",
  "neutrogena-hydro-boost-gel-cream-fragrance-free": "Hydro Boost Gel Cream (Fragrance Free)",
  "simple-kind-to-skin-refreshing-facial-gel-wash": "Refreshing Facial Gel Wash",
  "dabo-aloe-vera-tone-up-base-sun-cream": "Aloe Vera Tone-up Sun Cream SPF50 PA+++",
  "lux-black-orchid-juniper-body-wash-245ml": "Black Orchid & Juniper Oil Body Wash",
  "dot-key-vitamin-c-e-sunscreen-spf50-80g": "Vitamin C + E Super Bright Sunscreen SPF 50+",
  "dettol-rose-sakura-body-wash-250ml": "Rose & Sakura Blossom Body Wash",
  "parachute-naturale-nourishing-care-shampoo-160ml": "Nourishing Care Shampoo with Aloe Vera & Coconut Milk",
};

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    let changed = 0;
    for (const [slug, name] of Object.entries(NAMES)) {
      const result = await Product.updateOne({ slug }, { $set: { name } });
      if (result.matchedCount === 0) console.log(`Not found: ${slug}`);
      else if (result.modifiedCount) changed += 1;
    }
    console.log(`Done. ${changed} product name(s) updated.`);
  } catch (error) {
    console.error("Renaming failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};
run();
