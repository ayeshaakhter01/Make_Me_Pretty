import "dotenv/config";
import mongoose from "mongoose";
import Coupon from "../models/Coupon.js";
import Banner from "../models/Banner.js";

// Starting data copied from the frontend sample data
// (SEED_COUPONS in ordersSource.js and SEED_HERO_SLIDES in siteContent.js).
const coupons = [
  { code: "GLOW20", type: "percent", value: 20, active: true, note: "Monsoon Glow Sale — all serums" },
  { code: "WELCOME10", type: "percent", value: 10, active: true, note: "First order discount" },
  { code: "FREESHIP", type: "shipping", value: 0, active: false, note: "Free delivery, any order" },
];

const banners = [
  { type: "video", src: "/media/hero/MPM.mp4", title: "", subtitle: "", href: "/shop", active: true },
  { type: "image", src: "/media/hero/brand.png", title: "Glow, delivered", subtitle: "Skincare you will love", href: "/shop", active: true },
  { type: "image", src: "/media/hero/photo2.jpg", title: "New in Makeup", subtitle: "Colour for every mood", href: "/makeup", active: true },
  { type: "image", src: "/media/hero/offers.png", title: "Glow for less", subtitle: "Our favourite skincare at special prices", href: "/offers", active: true },
];

const runSeed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");

    let created = 0;
    let skipped = 0;

    for (const coupon of coupons) {
      if (await Coupon.exists({ code: coupon.code })) {
        console.log(`Coupon already exists: ${coupon.code}`);
        skipped++;
        continue;
      }

      await Coupon.create(coupon);
      console.log(`Created coupon: ${coupon.code}`);
      created++;
    }

    for (const [index, banner] of banners.entries()) {
      if (await Banner.exists({ src: banner.src })) {
        console.log(`Banner already exists: ${banner.src}`);
        skipped++;
        continue;
      }

      await Banner.create({ ...banner, order: index });
      console.log(`Created banner: ${banner.src}`);
      created++;
    }

    console.log(`\nSeed complete. Created: ${created}; skipped: ${skipped}.`);
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

runSeed();
