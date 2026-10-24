import "dotenv/config";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import { OFFICIAL_CATALOG_SAMPLES } from "./catalogSamples.js";

const demoNames = [
  "Rose Dew Cleanser", "Silk Barrier Moisturizer", "Niacinamide 10% Serum", "Vitamin C Glow Drops",
  "Ceramide Night Cream", "Hydra Mist Toner", "Clay Petal Face Mask", "SPF 50 Silk Shield",
  "Rice Glow Essence", "Almond Milk Body Wash", "Shea Comfort Body Lotion", "Rose Sugar Body Scrub",
  "Velvet Hand Cream", "Gentle Rice Shampoo", "Silk Slip Conditioner", "Amla Root Hair Oil",
  "Deep Repair Hair Mask", "Petal Tint Lip Balm", "Skin Veil Tinted Serum", "Soft Cheek Cream Blush",
  "Feather Brow Gel",
];

if (!process.env.MONGODB_URI) throw new Error("Set MONGODB_URI in backend/.env.");
await mongoose.connect(process.env.MONGODB_URI);
try {
  const hidden = await Product.updateMany({ name: { $in: demoNames } }, { $set: { active: false } });
  await Product.updateOne({ slug: "3w-clinic-lab-scalp-refresh-shampoo" }, { $set: { active: false } });
  let added = 0;
  const researchedPrices = {
    "cerave-hydrating-facial-cleanser": [1245, "https://cerave.com.bd/product/cerave-hydrating-facial-cleanser-for-normal-to-dry-skin-237ml"],
    "cetaphil-gentle-skin-cleanser": [3299, "https://cetaphil.com.bd/products"],
    "the-ordinary-niacinamide-10-zinc-1": [1250, "https://ordinary.com.bd/products/the-ordinary-niacinamide-10zinc1-30ml"],
    "anua-heartleaf-77-hydrating-soothing-toner": [2100, "https://e-mart.com.bd/shop/anua-heartleaf-77-soothing-toner-250ml"],
    "cosrx-advanced-snail-96-mucin-power-essence": [1520, "https://thecocia.com/products/cosrx-advanced-snail-96-mucin-power-essence-100-ml"],
    "skin1004-madagascar-centella-ampoule": [2069, "https://koreanmartbd.com/product/skin1004-madagascar-centella-ampoule-100ml"],
    "beauty-of-joseon-relief-sun-rice-niacinamide": [1490, "https://bdbeautyprice.com/blog/beauty-of-joseon-relief-sun-price-bangladesh-review/"],
    "im-from-rice-toner": [1920, "https://tokbd.com/brands/im-from"],
    "axis-y-dark-spot-correcting-glow-serum": [1080, "https://florabeauty.com.bd/brands/axis-y"],
    "neutrogena-hydro-boost-gel-cream-fragrance-free": [1890, "https://www.skinpurebd.com/product/neutrogena-hydro-boost-fragrance-free-gel-cream-50ml/"],
    "simple-kind-to-skin-refreshing-facial-gel-wash": [760, "https://www.arogga.com/brand/100442/simple"],
    "iunik-tea-tree-relief-serum": [1500, "https://price.bnblush.com/p/16075-iunik-tea-tree-relief-serum-50ml/"],
    "missha-m-perfect-cover-bb-cream": [1250, "https://www.gotimoy.com/collections/missha"],
    "carenel-berry-lip-night-mask": [403, "https://medeasy.health/medicines/-care-nel-lip-night-mask-berry-5g"],
    "cetaphil-moisturizing-lotion": [3550, "https://price.bnblush.com/p/16548-cetaphil-moisturising-lotion-for-normal-to-dry-sensitive-skin-473ml/"],
    "3w-clinic-the-calming-therapy-shampoo": [1500, "https://aromyeo.com/products/3w-clinic-the-calming-therapy-shampoo-500ml"],
    "dabo-aloe-vera-tone-up-base-sun-cream": [518, "https://medeasy.health/bn/medicines/dabo-aloe-vera-tone-up-base-sun-cream-spf50-70ml"],
    "cosrx-low-ph-good-morning-gel-cleanser": [950, "https://e-mart.com.bd/shop/cosrx-low-ph-good-morning-gel-cleanser-150ml"],
    "cerave-moisturizing-cream": [3445, "https://cerave.com.bd/product/cerave-moisturizing-cream-for-normal-to-dry-skin-453g-pump"],
    "the-ordinary-multi-peptide-serum-hair-density": [3790, "https://price.bnblush.com/p/40222-the-ordinary-multi-peptide-hair-serum-for-hair-density-60ml/"],
    "cerave-daily-moisturizing-lotion": [1060, "https://cerave.com.bd/product/cerave-daily-moisturizing-lotion-for-normal-to-dry-skin-87ml"],
    "cetaphil-moisturizing-cream": [3250, "https://www.florabeauty.com.bd/blog/cetaphil-moisturizing-cream-price-in-bangladesh-which-size"]
  };
  const productImages = {
    "cerave-hydrating-facial-cleanser": "https://klassy.com.bd/_next/image?q=75&url=https%3A%2F%2Fcdn.klassy.com.bd%2Fuploads%2Fproducts%2Fproducts%2FI40DJ7jSMDB8fe5oqu2vhxSPJJOTaqA6tgF9bESj.webp&w=3840",
    "cetaphil-gentle-skin-cleanser": "https://media.allure.com/photos/5ec2dc046687dd0008ee5501/master/w_1024%2Cc_limit/cetaphil-gentle-skin-cleanser-white.jpg",
    "the-ordinary-niacinamide-10-zinc-1": "https://down-my.img.susercontent.com/file/sg-11134207-7reoh-m2h0w083p9t6c5",
    "anua-heartleaf-77-hydrating-soothing-toner": "https://harumiglobal.com/cdn/shop/files/DSC08464.jpg?v=1742843604",
    "cosrx-advanced-snail-96-mucin-power-essence": "https://thealoy.com/public/uploads/product/1777549317-cosrx-advanced-snail-96-mucin-power-essence-100-ml-2.png",
    "skin1004-madagascar-centella-ampoule": "https://d33ur1yh5ph6b5.cloudfront.net/fc5e06bb-f8c7-41fc-9c1f-e44efb387536",
    "beauty-of-joseon-relief-sun-rice-niacinamide": "https://beautyofjoseon.com/cdn/shop/files/Untitl2ed-1.jpg?v=1704077869&width=2000",
    "im-from-rice-toner": "https://kaneen.com/media/catalog/product/I/_/I_m-from-Rice-Toner-White-150-ml-1-3bb41d39.webp",
    "axis-y-dark-spot-correcting-glow-serum": "https://http2.mlstatic.com/D_NQ_NP_716259-MLA90219856832_082025-O.webp",
    "neutrogena-hydro-boost-gel-cream-fragrance-free": "https://m.media-amazon.com/images/I/71%2BO9eVdxxL.jpg",
    "simple-kind-to-skin-refreshing-facial-gel-wash": "https://down-th.img.susercontent.com/file/th-11134207-81zte-mlnosucxkmio0d",
    "iunik-tea-tree-relief-serum": "https://bk.shajgoj.com/storage/2024/05/iUNIK-Tea-Tree-Relief-Serum1.jpg",
    "missha-m-perfect-cover-bb-cream": "https://shop.r10s.jp/chinju/cabinet/missha/new/cosme-missha-1m.jpg",
    "carenel-berry-lip-night-mask": "https://product.hstatic.net/200000551679/product/f79571932bf9925d08da44be8188b186_6ecd16a91bf849f5bcf6a2fa535bc3cc_1024x1024.png",
    "cetaphil-moisturizing-lotion": "https://cdn-tp2.mozu.com/28945-47379/cms/47379/files/8dec5b48-8380-4364-8b72-d836368f4658",
    "3w-clinic-the-calming-therapy-shampoo": "https://d2vvo9h1swbzur.cloudfront.net/products/1756132606954",
    "dabo-aloe-vera-tone-up-base-sun-cream": "https://pibukor.com/web/image/product.template/778/image",
    "cosrx-low-ph-good-morning-gel-cleanser": "https://regularneed.com/backend/img/category/1774720118_69c81476dcde0.jpg",
    "cerave-moisturizing-cream": "https://d1puc9h291tp0h.cloudfront.net/uploads/all/GiKxVVpslpc5NpKZDP6lDbYzD9mIs5VYszTX6drC.jpg",
    "the-ordinary-multi-peptide-serum-hair-density": "https://cdn.beautybooth.com.bd/uploads/all/s8SAjsDAz8zpqL9d7Frq66RAqcjYctJMy4u3vx7j.jpeg",
    "cerave-daily-moisturizing-lotion": "https://choicelegacy.com.bd/cdn/shop/files/CeraVeDailyMoisturizingLotion87ml_USA_-1.jpg?v=1763725851",
    "cetaphil-moisturizing-cream": "https://cosmetics.lk/cdn/shop/files/CET14_1_Related_1.webp?v=1772708440&width=1445"
  };
  const featuredSlugs = new Set([
    "cerave-hydrating-facial-cleanser", "the-ordinary-niacinamide-10-zinc-1",
    "cosrx-advanced-snail-96-mucin-power-essence", "beauty-of-joseon-relief-sun-rice-niacinamide",
    "missha-m-perfect-cover-bb-cream", "cetaphil-moisturizing-lotion",
    "the-ordinary-multi-peptide-serum-hair-density", "cosrx-low-ph-good-morning-gel-cleanser"
  ]);
  for (const [index, product] of OFFICIAL_CATALOG_SAMPLES.entries()) {
    const [price, priceSourceUrl] = researchedPrices[product.slug] || [1890 + index * 30, ""];
    if (product.slug === "3w-clinic-the-calming-therapy-shampoo") {
      const [legacy, duplicate] = await Promise.all([
        Product.findOne({ slug: "3w-clinic-lab-scalp-refresh-shampoo" }).select("_id").lean(),
        Product.findOne({ slug: product.slug }).select("_id").lean(),
      ]);
      if (legacy && duplicate && String(legacy._id) !== String(duplicate._id)) {
        await Product.deleteOne({ _id: duplicate._id });
        await Product.updateOne({ _id: legacy._id }, {
          $set: { ...product, id: product.slug, price, priceSourceUrl, priceCheckedAt: new Date("2026-10-24T00:00:00Z"), compareAt: null, stock: 12 + ((index * 7) % 29), images: productImages[product.slug] ? [productImages[product.slug]] : [], active: true, badge: featuredSlugs.has(product.slug) ? "Featured" : "" },
        }, { runValidators: true });
        continue;
      }
    }
    const result = await Product.updateOne({ slug: product.slug }, {
      $set: { ...product, id: product.slug, price, priceSourceUrl, priceCheckedAt: new Date("2026-10-24T00:00:00Z"), compareAt: null, stock: 12 + ((index * 7) % 29), images: productImages[product.slug] ? [productImages[product.slug]] : [], active: true, badge: featuredSlugs.has(product.slug) ? "Featured" : "" },
    }, { upsert: true, runValidators: true });
    if (result.upsertedCount) added += 1;
  }
  console.log(`Published catalog items: ${OFFICIAL_CATALOG_SAMPLES.length}; new records: ${added}; fictional demo records hidden: ${hidden.modifiedCount}.`);
  console.log("Published sourced product listings. Verify retailer prices, stock, package formulas, and product photos before accepting real sales.");
} finally {
  await mongoose.disconnect();
}
