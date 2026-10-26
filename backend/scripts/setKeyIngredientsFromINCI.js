import "dotenv/config";
import mongoose from "mongoose";
import Product from "../models/Product.js";

/* Sets 3-4 KEY ingredients on every product from its REAL ingredient list (INCIDecoder.com), nothing guessed.
   Run:  node scripts/setKeyIngredientsFromINCI.js        (add --debug to see which page addresses were tried)
   How: opens incidecoder.com/products/<brand-product-name>, reads the ingredient list in label order, drops the filler
   (water, solvents, preservatives, thickeners, pH adjusters, emulsifiers, fragrance, colour codes) and keeps the first 4 that are left.
   Saves only if 3-4 key ingredients are found; otherwise the product's current ingredients stay as they are and it is listed at the end.
   Printed lists are worth one skim: formulas differ by country, so check the pack when stock arrives. */
const debug = process.argv.includes("--debug");
const UA = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36" };
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const slug = (text) => String(text).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/['’]/g, "").replace(/&/g, " and ").replace(/[+%]/g, " ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const SKIP = /^(aqua|water|eau)\b|glycol$|^propanediol|^pentylene|hexanediol|^butylene|phenoxyethanol|ethylhexylglycerin|benzoate|sorbate|paraben|chlorphenesin|benzyl alcohol|^sodium (hydroxide|chloride|citrate|laureth|lauryl|lauroyl|cocoyl|methyl cocoyl)|citric acid|edta|carbomer|xanthan|acrylates|cellulose|^peg-|polysorbate|cetearyl|ceteareth|glyceryl stearate|stearic acid|^coco-|cocamidopropyl|laureth|trideceth|parfum|fragrance|limonene|linalool|citronellol|geraniol|hexyl cinnamal|^ci \d|^cl? ?\d{5}|may contain|disodium|tetrasodium|trisodium|lactic acid|triethanolamine|^alcohol denat|^cetyl alcohol|^stearyl alcohol|behentrimonium|dimethicone$|cyclopentasiloxane|isododecane|mineral oil|paraffinum|petrolatum$/i;

const variants = (product) => {
  const base = product.name.replace(/\s+\d[\d.,]*\s?(ml|g|sheet)s?$/i, "").replace(/\s*\([^)]*\)\s*$/, "");
  const named = base.toLowerCase().startsWith(product.brand.toLowerCase()) ? base : `${product.brand} ${base}`;
  return [...new Set([slug(named), slug(named.replace(/\s+for\s+.*$/i, "")), slug(named.replace(/\s+(spf|pa)\s?\d.*$/i, ""))])].filter(Boolean);
};

function keyOf(html) {
  const start = Math.max(0, html.indexOf("ingredlist"));
  const seen = [];
  for (const match of html.slice(start).matchAll(/<a[^>]+href="\/ingredients\/[^"]+"[^>]*>\s*([^<]+?)\s*<\/a>/g)) {
    const name = match[1].replace(/&amp;/g, "&").replace(/&#39;/g, "'").trim();
    if (name && !seen.includes(name)) seen.push(name);
    if (seen.length > 60) break;
  }
  return seen.filter((name) => !SKIP.test(name) && name.length <= 80).slice(0, 4);
}

if (!process.env.MONGODB_URI) throw new Error("Set MONGODB_URI in backend/.env.");
await mongoose.connect(process.env.MONGODB_URI);
try {
  const products = await Product.find({}).select("slug name brand ingredients");
  const failed = [];
  let done = 0;
  for (const product of products) {
    let list = [];
    for (const address of variants(product)) {
      try {
        const response = await fetch(`https://incidecoder.com/products/${address}`, { headers: UA, signal: AbortSignal.timeout(20000) });
        if (debug) console.log(`  ${address}: HTTP ${response.status}`);
        if (response.ok) { list = keyOf(await response.text()); if (list.length >= 3) break; }
      } catch (problem) { if (debug) console.log(`  ${address}: ${problem.message}`); }
      await wait(700);
    }
    if (list.length < 3) { failed.push(`${product.name} (${(product.ingredients || []).length} ingredients kept)`); continue; }
    await Product.updateOne({ _id: product._id }, { $set: { ingredients: list } });
    done += 1;
    console.log(`ok: ${product.name}: ${list.join(", ")}`);
  }
  console.log(`\nKey ingredients set: ${done} of ${products.length}. Not found on INCIDecoder: ${failed.length}`);
  failed.forEach((line) => console.log(`  - ${line}`));
} finally {
  await mongoose.disconnect();
}
