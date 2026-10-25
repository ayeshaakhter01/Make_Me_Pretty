import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import Policy from "../models/Policy.js";
import StoreSettings from "../models/StoreSettings.js";

/* Fills the "policies" collection:
   1. policies you already wrote in the old place (storesettings -> footer.policyPages) are moved over, text and all
   2. the 4 original policies (policies.json) fill anything still missing or empty
   Safe to run again: existing policies are left alone.  Use --force to overwrite all 4 originals with policies.json. */
const force = process.argv.includes("--force");
const original = JSON.parse(fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "policies.json"), "utf8"));

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const settings = await StoreSettings.findOne({ key: "storefront" }).lean();
    const old = Array.isArray(settings?.footer?.policyPages) ? settings.footer.policyPages : [];

    // slug -> { title, content, published } ; text already in the database wins over policies.json
    const wanted = new Map();
    for (const item of old) if (item?.slug) wanted.set(item.slug, { title: item.title, content: String(item.content || ""), published: item.published !== false });
    for (const item of original) {
      const have = wanted.get(item.slug);
      if (!have || !have.content.trim() || force) wanted.set(item.slug, { title: have?.title || item.title, content: item.content, published: have?.published ?? true });
    }

    let created = 0, updated = 0, order = 0;
    for (const [slug, data] of wanted) {
      const existing = await Policy.findOne({ slug });
      if (!existing) { await Policy.create({ slug, ...data, order }); created += 1; }
      else if (force || !existing.content.trim()) { await Policy.updateOne({ _id: existing._id }, { $set: { content: data.content, title: data.title } }); updated += 1; }
      order += 1;
    }
    if (old.length) await StoreSettings.updateOne({ key: "storefront" }, { $unset: { "footer.policyPages": "" } });
    console.log(`Policies collection ready: ${created} created, ${updated} updated, ${await Policy.countDocuments()} in total.`);
  } catch (error) {
    console.error("Seeding policies failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};
run();
