import "dotenv/config";
import mongoose from "mongoose";
import Product from "../models/Product.js";

/* Fills in product photos.  Run:  node scripts/setProductImages.js     (add --force to replace photos that already exist)
   For each product WITHOUT a photo it uses, in this order:
     1. the page link in PAGES below (reads the page's main picture), or the product's own sourceUrl
     2. Bing Images search (any website)
     3. search inside public online beauty shops (Shopify stores: choicelegacy.com.bd, swadesii.com, cosmetics.lk, ohsogo.com ...) via their open product-search JSON
   Add --debug to see why a product was skipped.
   A photo is only accepted if the image's title contains the brand and part of the product name, and the image link really opens.
   Products it can't find are listed at the end so you can fix them by hand (PAGES below, or Admin -> Inventory -> Edit). */
const PAGES = {
  // "dove-deeply-nourishing-body-wash-250-ml": "https://...",   (page link: reads its og:image)
  // or a direct image link ending in .jpg/.png/.webp also works
};

const only = process.argv.find((a) => a.startsWith("--only="))?.slice(7).split(",").filter(Boolean) || []; // e.g. --only=fiama-magnetic-attraction-shower-gel-250-ml
const nameArg = process.argv.find((a) => a.startsWith("--name="))?.slice(7); // e.g. --name=vaseline  (redo every product whose name contains this)
const broken = process.argv.includes("--broken"); // redo products whose saved photo no longer loads
const force = process.argv.includes("--force");
const UA = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36", "Accept-Language": "en-US,en;q=0.9" };
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const plain = (text) => String(text || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
const decode = (text) => text.replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const BAD_HOSTS = /(fbcdn|instagram|lookaside|tiktok|pinimg|alicdn|aliexpress)/i;
const metaOf = (html, key) => decode(html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]*>`, "i"))?.[0]?.match(/content=["']([^"']*)["']/i)?.[1] || "");

async function opensAsImage(url, referer) {
  try {
    const response = await fetch(url, { headers: { ...UA, Referer: referer || new URL(url).origin }, redirect: "follow", signal: AbortSignal.timeout(12000) });
    if (!response.ok || !/^image\//i.test(response.headers.get("content-type") || "")) return false;
    return (await response.arrayBuffer()).byteLength > 3000;
  } catch { return false; }
}

const debug = process.argv.includes("--debug");
let bingBlocked = false;
async function fromBingImages(product) {
  const query = `${product.name}`;
  const response = await fetch(`https://www.bing.com/images/search?q=${encodeURIComponent(query)}&form=HDRSC2&first=1&setlang=en`, { headers: UA, signal: AbortSignal.timeout(20000) });
  const html = await response.text();
  const items = [...html.matchAll(/class="iusc"[^>]*\sm="([^"]+)"/g)].map((match) => { try { return JSON.parse(decode(match[1])); } catch { return null; } }).filter(Boolean);
  if (!items.length) { bingBlocked = true; console.log(`(Bing stopped answering: HTTP ${response.status}, ${html.length} bytes, no image results. Using the shop search only from now on.)`); return null; }
  let passed = 0, opened = 0;
  const brandWords = plain(product.brand).split(" ").filter((word) => word.length > 1);
  const nameWords = plain(product.name.replace(product.brand, "")).split(" ").filter((word) => word.length > 3 && !/^\d/.test(word));
  for (const item of items.slice(0, 12)) {
    const title = plain(item.t);
    const brandOk = brandWords.some((word) => title.includes(word));
    const nameHits = nameWords.filter((word) => title.includes(word)).length;
    if (!item.murl || !/^https:\/\//i.test(item.murl) || BAD_HOSTS.test(item.murl) || !brandOk || nameHits < Math.min(1, nameWords.length)) continue;
    passed += 1;
    if (await opensAsImage(item.murl)) return { image: item.murl };
    opened += 1;
  }
  if (debug) console.log(`  bing: ${items.length} results, ${passed} matched title, ${opened} did not open as image`);
  return null;
}

const SHOPS = ["choicelegacy.com.bd", "swadesii.com", "cosmetics.lk", "ohsogo.com", "harumiglobal.com", "peachandlily.com", "sokoglam.com", "beautyofjoseon.com", "wetnwildbeauty.com", "mamaearth.in", "glowrecipe.com", "kbeautyglow.com", "stylevana.com", "kpopmart.com", "bdshopbd.com", "skincarebd.com", "gorgeousbd.com", "somebymi.com", "himalayawellness.in", "garnierindia.com"];
async function fromShops(product) {
  const brandWords = plain(product.brand).split(" ").filter((word) => word.length > 1);
  const nameWords = plain(product.name.replace(product.brand, "")).split(" ").filter((word) => word.length > 3 && !/^\d/.test(word));
  const queries = [...new Set([`${product.brand} ${nameWords.slice(0, 4).join(" ")}`, `${product.brand} ${nameWords.slice(0, 2).join(" ")}`, `${product.brand} ${nameWords[0] || ""}`].map((q) => q.trim()))];
  for (const level of [Math.min(2, nameWords.length), Math.min(1, nameWords.length)]) { // strict, then relaxed
    for (const query of queries) {
      for (const shop of SHOPS) {
        try {
          const response = await fetch(`https://${shop}/search/suggest.json?q=${encodeURIComponent(query)}&resources[type]=product&resources[limit]=10`, { headers: UA, signal: AbortSignal.timeout(15000) });
          if (!response.ok) { if (debug) console.log(`  ${shop}: HTTP ${response.status}`); continue; }
          const products = (await response.json())?.resources?.results?.products || [];
          for (const item of products) {
            const title = plain(item.title);
            const raw = item.featured_image?.url || item.image || "";
            if (!raw || !brandWords.some((word) => title.includes(word)) || nameWords.filter((word) => title.includes(word)).length < level) continue;
            const image = raw.startsWith("//") ? `https:${raw}` : raw;
            if (await opensAsImage(image)) return { image };
          }
        } catch (problem) { if (debug) console.log(`  ${shop}: ${problem.message}`); }
        await wait(250);
      }
    }
  }
  return null;
}

/* Open Beauty Facts: free public product database with front photos (no blocking, no key). */
async function fromOpenBeautyFacts(product) {
  const nameWords = plain(product.name.replace(product.brand, "")).split(" ").filter((word) => word.length > 3 && !/^\d/.test(word));
  const brandWords = plain(product.brand).split(" ").filter((word) => word.length > 1);
  for (const query of [`${product.brand} ${nameWords.slice(0, 3).join(" ")}`, `${product.brand} ${nameWords[0] || ""}`]) {
    try {
      const response = await fetch(`https://world.openbeautyfacts.org/cgi/search.pl?search_simple=1&action=process&json=1&page_size=12&search_terms=${encodeURIComponent(query.trim())}`, { headers: UA, signal: AbortSignal.timeout(20000) });
      if (!response.ok) { if (debug) console.log(`  openbeautyfacts: HTTP ${response.status}`); continue; }
      for (const item of (await response.json())?.products || []) {
        const title = plain(`${item.brands || ""} ${item.product_name || ""}`);
        const image = item.image_front_url || item.image_url || "";
        if (!image || !brandWords.some((word) => title.includes(word)) || nameWords.filter((word) => title.includes(word)).length < Math.min(1, nameWords.length)) continue;
        if (await opensAsImage(image)) return { image };
      }
    } catch (problem) { if (debug) console.log(`  openbeautyfacts: ${problem.message}`); }
  }
  return null;
}

/* DuckDuckGo images: used when Bing is blocked. */
let ddgBlocked = false;
async function fromDuckDuckGo(product) {
  const brandWords = plain(product.brand).split(" ").filter((word) => word.length > 1);
  const nameWords = plain(product.name.replace(product.brand, "")).split(" ").filter((word) => word.length > 3 && !/^\d/.test(word));
  const query = `${product.name} product`;
  try {
    const home = await (await fetch(`https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`, { headers: UA, signal: AbortSignal.timeout(20000) })).text();
    const vqd = home.match(/vqd=["']?([\d-]+)["']?/)?.[1];
    if (!vqd) { ddgBlocked = true; console.log("(DuckDuckGo gave no token, skipping it from now on.)"); return null; }
    const response = await fetch(`https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(query)}&vqd=${vqd}&f=,,,,,&p=1`, { headers: { ...UA, Referer: "https://duckduckgo.com/" }, signal: AbortSignal.timeout(20000) });
    if (!response.ok) { ddgBlocked = true; console.log(`(DuckDuckGo HTTP ${response.status}, skipping it from now on.)`); return null; }
    for (const item of (await response.json())?.results?.slice(0, 15) || []) {
      const title = plain(item.title);
      if (!item.image || !/^https:\/\//i.test(item.image) || BAD_HOSTS.test(item.image) || !brandWords.some((word) => title.includes(word)) || nameWords.filter((word) => title.includes(word)).length < Math.min(1, nameWords.length)) continue;
      if (await opensAsImage(item.image)) return { image: item.image };
    }
  } catch (problem) { if (debug) console.log(`  duckduckgo: ${problem.message}`); }
  return null;
}

async function fromPage(page) {
  if (/\.(jpe?g|png|webp|avif)(\?|$)/i.test(page)) return page;
  const response = await fetch(page, { headers: UA, redirect: "follow", signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const html = await response.text();
  const image = metaOf(html, "og:image") || metaOf(html, "twitter:image");
  if (!image) throw new Error("no image on that page");
  return new URL(image, response.url).href;
}

if (!process.env.MONGODB_URI) throw new Error("Set MONGODB_URI in backend/.env.");
await mongoose.connect(process.env.MONGODB_URI);
try {
  let products = await Product.find(nameArg ? { name: new RegExp(nameArg.replace(/[^a-z0-9 ]/gi, "."), "i") } : only.length ? { slug: { $in: only } } : force ? {} : { $or: [{ images: { $size: 0 } }, { images: { $exists: false } }] }).select("slug name brand sourceUrl images");
  if (broken) {
    products = await Product.find({ "images.0": { $exists: true } }).select("slug name brand sourceUrl images");
    const bad = [];
    for (const p of products) {
      const url = p.images[0];
      let ok = false;
      try { const r = await fetch(url, { headers: { ...UA, Referer: "http://localhost:5173/" }, signal: AbortSignal.timeout(12000) }); ok = r.ok && /^image\//i.test(r.headers.get("content-type") || ""); } catch {}
      if (!ok) { bad.push(p); console.log(`broken: ${p.slug} -> ${url}`); }
    }
    products = bad;
  }
  // Manual override:  node scripts/setProductImages.js --set=<slug>=<direct image url>   (saves it as-is, no searching)
  const manual = process.argv.find((a) => a.startsWith("--set="));
  if (manual) {
    const [slug, ...rest] = manual.slice(6).split("=");
    const url = rest.join("=");
    const result = await Product.updateOne({ slug }, { $set: { images: [url] } });
    console.log(result.matchedCount ? `ok: ${slug} -> ${url}` : `no product with slug "${slug}"`);
    process.exit(0);
  }
  const failed = [];
  let done = 0;
  for (const product of products) {
    try {
      const page = PAGES[product.slug] || product.sourceUrl;
      let image = "";
      if (page) {
        // sourceUrl is often a price/source page (e.g. epharma) whose picture is hotlink-blocked in the browser -> only accept it if it loads with a localhost referer, else search elsewhere.
        try { image = await fromPage(page); } catch (problem) { if (debug) console.log(`  page: ${problem.message}`); }
        if (image && (/epharma\.com\.bd/i.test(image) || !(await opensAsImage(image, "http://localhost:5173/")))) { if (debug) console.log(`  page image rejected: ${image}`); image = ""; }
      }
      if (!image) {
        if (!bingBlocked) { image = (await fromBingImages(product).catch(() => null))?.image || ""; await wait(2500); }
        if (!image) image = (await fromShops(product))?.image || "";
        if (!image) image = (await fromOpenBeautyFacts(product))?.image || "";
        if (!image && !ddgBlocked) { image = (await fromDuckDuckGo(product))?.image || ""; await wait(1500); }
      }
      if (!image) { failed.push(`${product.slug} (no matching image found)`); continue; }
      await Product.updateOne({ _id: product._id }, { $set: { images: [image] } });
      done += 1;
      console.log(`ok: ${product.slug} -> ${image}`);
    } catch (problem) { failed.push(`${product.slug} (${problem.message})`); }
  }
  console.log(`\nPhotos set: ${done}. Still without a photo: ${failed.length}`);
  failed.forEach((line) => console.log(`  - ${line}`));
} finally {
  await mongoose.disconnect();
}
