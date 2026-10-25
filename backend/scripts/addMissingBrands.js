import "dotenv/config";
import fs from "fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import Brand from "../models/Brand.js";

/* Adds the 38 brands that have no card in "Brands we carry" (name + short description + logo).  Run:  node scripts/addMissingBrands.js
   Logo: downloaded from each brand's own website (apple-touch-icon -> Google icon service -> og:image), saved in backend/uploads/ like an admin upload.
   Brands that already exist are left alone, except that a missing logo is filled in. A brand whose logo can't be found is listed at the end -> upload it in Admin -> Brands. */
const BRANDS = [
  ["Aveeno", "aveeno.com", "Oat-based gentle skincare"],
  ["Bioderma", "bioderma.com", "Dermatologist micellar care"],
  ["Cantu", "cantubeauty.com", "Shea butter textured hair care"],
  ["Clear", "clearhair.com", "Anti-dandruff scalp care"],
  ["Dabur", "dabur.com", "Ayurvedic hair and body care"],
  ["Dove", "dove.com", "Gentle moisturizing care"],
  ["Essence", "essence.eu", "Affordable everyday makeup"],
  ["Fiama", "fiama.in", "Fragrant shower gels"],
  ["Garnier", "garnier.com", "Naturally inspired beauty"],
  ["Head & Shoulders", "headandshoulders.com", "Dandruff-control shampoo"],
  ["Himalaya", "himalayawellness.com", "Herbal personal care"],
  ["Indulekha", "indulekha.in", "Ayurvedic hair oil"],
  ["Innisfree", "innisfree.com", "Nature-based K-beauty"],
  ["Johnson's", "johnsonsbaby.com", "Gentle baby care"],
  ["L'Oréal Paris", "lorealparis.com", "Makeup, hair and skincare"],
  ["La Roche-Posay", "laroche-posay.us", "Dermatologist skincare"],
  ["Lakmé", "lakmeindia.com", "Everyday makeup essentials"],
  ["Laneige", "laneige.com", "Hydration-focused K-beauty"],
  ["Mamaearth", "mamaearth.in", "Toxin-free natural care"],
  ["Maybelline", "maybelline.com", "Makeup for every day"],
  ["Mediheal", "mediheal.com", "Sheet masks and skin care"],
  ["NYX Professional Makeup", "nyxcosmetics.com", "Bold professional makeup"],
  ["Nivea", "nivea.com", "Trusted skin and body care"],
  ["OGX", "ogxbeauty.com", "Nourishing hair care"],
  ["Olay", "olay.com", "Anti-ageing skincare"],
  ["Palmolive", "palmolive.com", "Fragrant body wash"],
  ["Pantene", "pantene.com", "Strong, healthy-looking hair"],
  ["Parachute", "parachuteadvansed.com", "Pure coconut hair oil"],
  ["Revlon", "revlon.com", "Classic colour cosmetics"],
  ["Rimmel London", "rimmellondon.com", "London-inspired makeup"],
  ["Round Lab", "roundlab.us", "Gentle Korean skincare"],
  ["Schwarzkopf", "schwarzkopf.com", "Professional hair care"],
  ["Some By Mi", "somebymi.com", "Targeted K-beauty actives"],
  ["Sunsilk", "sunsilk.com", "Shiny, manageable hair"],
  ["TRESemmé", "tresemme.com", "Salon-quality hair care"],
  ["The Body Shop", "thebodyshop.com", "Ethical body and skin care"],
  ["Vaseline", "vaseline.com", "Moisture and skin repair"],
  ["Wet n Wild", "wetnwildbeauty.com", "Budget-friendly colour"],
];

const UA = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36", "Accept-Language": "en-US,en;q=0.9" };
const uploadDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../uploads");
const EXT = { "image/png": ".png", "image/jpeg": ".jpg", "image/webp": ".webp" };
const decode = (t) => t.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'");

async function download(url) {
  try {
    const r = await fetch(url, { headers: UA, redirect: "follow", signal: AbortSignal.timeout(15000) });
    const type = (r.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
    if (!r.ok || !EXT[type]) return null;
    const bytes = Buffer.from(await r.arrayBuffer());
    return bytes.length > 1500 && bytes.length < 5_000_000 ? { bytes, ext: EXT[type] } : null;
  } catch { return null; }
}

async function candidates(domain) {
  const list = [];
  let og = "";
  try {
    const r = await fetch(`https://${domain}`, { headers: UA, redirect: "follow", signal: AbortSignal.timeout(15000) });
    const html = await r.text();
    const icons = [...html.matchAll(/<link[^>]+rel=["'][^"']*apple-touch-icon[^"']*["'][^>]*>/gi)].map((m) => m[0]);
    for (const tag of icons) { const href = decode(tag.match(/href=["']([^"']+)["']/i)?.[1] || ""); if (href) list.push(new URL(href, r.url).href); }
    og = decode(html.match(/<meta[^>]+property=["']og:image["'][^>]*>/i)?.[0]?.match(/content=["']([^"']+)["']/i)?.[1] || "");
    if (og) og = new URL(og, r.url).href;
  } catch { /* site blocked: fall back to the icon service */ }
  list.push(`https://www.google.com/s2/favicons?domain=${domain}&sz=256`);
  if (og) list.push(og);
  return list;
}

async function fetchLogo(name, domain) {
  for (const url of await candidates(domain)) {
    const file = await download(url);
    if (!file) continue;
    const fileName = `brand-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}${file.ext}`;
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, fileName), file.bytes);
    return `/uploads/${fileName}`;
  }
  return "";
}

if (!process.env.MONGODB_URI) throw new Error("Set MONGODB_URI in backend/.env.");
await mongoose.connect(process.env.MONGODB_URI);
try {
  const noLogo = [];
  let created = 0, updated = 0, order = 100;
  for (const [name, domain, description] of BRANDS) {
    order += 1;
    const existing = await Brand.findOne({ name });
    if (existing?.logo) { console.log(`skip (already has logo): ${name}`); continue; }
    const logo = await fetchLogo(name, domain);
    if (existing) { if (logo) { existing.logo = logo; await existing.save(); updated += 1; } }
    else { await Brand.create({ name, description, logo, order, active: true }); created += 1; }
    console.log(`${existing ? "updated" : "added"}: ${name} ${logo ? `-> ${logo}` : "(NO LOGO FOUND)"}`);
    if (!logo) noLogo.push(name);
  }
  console.log(`\nCreated ${created}, logo added to ${updated} existing.`);
  if (noLogo.length) console.log(`No logo found for (upload in Admin -> Brands):\n  ${noLogo.join("\n  ")}`);
} finally {
  await mongoose.disconnect();
}
