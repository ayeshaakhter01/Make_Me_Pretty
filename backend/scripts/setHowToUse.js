import "dotenv/config";
import fs from "fs";
import mongoose from "mongoose";
import Product from "../models/Product.js";

/* Writes "How to use" (3-4 lines each) into every product's `usage` field.  Run:  node scripts/setHowToUse.js
   Your old usage text is first saved to backend/usage-backup.json.
   Instructions are general directions for the product type - always check the pack of the actual product. */
const shampoo = (x) => ["Wet hair thoroughly.", "Massage a small amount into the scalp and lengths until it lathers.", x, "Rinse well and follow with conditioner. Avoid contact with eyes."];
const conditioner = (x) => ["After shampooing, squeeze out excess water.", "Apply from mid-lengths to ends, avoiding the scalp.", x, "Rinse thoroughly with water."];
const wash = (x) => ["Wet your skin and put a small amount on your hands or a sponge.", "Lather and massage over the body.", x, "Rinse well and pat dry. Avoid contact with eyes."];
const lotion = (x) => ["Apply to clean, dry skin.", "Massage in until fully absorbed.", x, "Use daily, especially after bathing."];
const handcream = (x) => ["Take a small amount and massage into hands and cuticles.", x, "Reapply after washing hands.", "Use as often as needed."];
const hairoil = (x) => ["Take a small amount of oil in your palm.", x, "Leave on for at least 30 minutes, or overnight for deep nourishment.", "Wash out with shampoo."];
const cleanser = (x) => ["Wet your face with lukewarm water.", "Massage a small amount onto skin for about 30 seconds.", x, "Rinse well and pat dry. Use morning and night."];
const toner = (x) => ["After cleansing, pour a little onto a cotton pad or your palms.", x, "Let it absorb before the next step.", "Follow with serum and moisturizer."];
const serum = (x) => ["After cleansing and toning, take a few drops.", x, "Follow with moisturizer.", "Use morning and/or night as directed on the pack."];
const sun = (x) => ["Apply as the last step of your morning skincare.", x, "Wait a few minutes before makeup.", "Reapply every 2 hours when outdoors; remove with cleanser at night."];
const lip = (x) => ["Apply directly to clean, dry lips.", x, "Reapply whenever needed.", "Close the cap tightly after use."];
const mascara = (x) => ["Curl lashes first if you like.", x, "Add a second coat once the first is dry.", "Remove with makeup remover at night."];

const USAGE = {
"3w-clinic-the-calming-therapy-shampoo": shampoo("Leave on the scalp for 1–2 minutes to soothe and cleanse."),
"axis-y-dark-spot-correcting-glow-serum": serum("Pat gently over the face, focusing on dark spots, until absorbed."),
"anua-heartleaf-77-hydrating-soothing-toner": toner("Pat over face and neck; layer 2–3 times if skin feels dry."),
"aveeno-daily-moisturizing-lotion-354-ml": lotion("Pay extra attention to dry areas such as elbows, knees and hands."),
"beauty-of-joseon-relief-sun-rice-niacinamide": sun("Use about two finger-lengths for face and neck and spread evenly."),
"bioderma-sensibio-h2o-micellar-water-250-ml": ["Soak a cotton pad with the micellar water.", "Gently wipe over face, eyes and lips without rubbing.", "Repeat until the pad comes away clean.", "Rinsing is optional; follow with your usual moisturizer."],
"carenel-berry-lip-night-mask": ["Apply a thick layer to clean lips before bed.", "Leave on overnight.", "Gently wipe off any excess in the morning.", "Use daily, or whenever lips feel dry."],
"cosrx-advanced-snail-96-mucin-power-essence": ["After toner, dispense a small amount into your palm.", "Gently pat into face and neck until absorbed.", "Follow with moisturizer.", "Use morning and night."],
"cosrx-aloe-soothing-sun-cream-spf50-pa-50-ml": sun("Apply generously to face and neck about 15 minutes before sun exposure."),
"cosrx-bha-blackhead-power-liquid-100-ml": ["After cleansing, apply with a cotton pad to blackhead-prone areas like nose and chin.", "Do not rinse off.", "Start 2–3 times a week and increase slowly as skin allows.", "Always use sunscreen in the daytime."],
"cosrx-low-ph-good-morning-gel-cleanser": cleanser("The gentle low-pH gel foams lightly, so a small amount is enough."),
"cantu-shea-butter-leave-in-conditioning-repair-cream-340-g": ["After washing, apply a small scoop to damp hair.", "Work through mid-lengths to ends with your fingers.", "Do not rinse; style as usual.", "Start with a little and add more if hair needs it."],
"cerave-daily-moisturizing-lotion": lotion("A small amount is enough for the face; use more for the body."),
"cerave-foaming-facial-cleanser-236-ml": cleanser("Works best on normal to oily skin; avoid the eye area."),
"cerave-hydrating-facial-cleanser": cleanser("Gentle enough for dry or normal skin; rinse with lukewarm water."),
"cerave-moisturizing-cream": ["Pump out a small amount onto clean skin.", "Massage over face and body until absorbed.", "Best applied right after bathing while skin is still slightly damp.", "Reapply to very dry areas as needed."],
"cetaphil-daily-advance-ultra-hydrating-lotion-226-g": lotion("Apply morning and night for long-lasting hydration."),
"cetaphil-gentle-skin-cleanser": ["Apply to wet or dry skin and massage gently.", "Rinse with lukewarm water, or wipe off with a soft cloth.", "Pat skin dry.", "Use morning and night."],
"cetaphil-moisturizing-cream": ["Apply liberally to clean skin.", "Massage until absorbed.", "Focus on very dry areas such as hands, elbows and feet.", "Reapply as needed through the day."],
"cetaphil-moisturizing-lotion": lotion("Suitable for face and body; reapply to dry areas as needed."),
"cetaphil-oily-skin-cleanser-235-ml": cleanser("Helps remove excess oil without over-drying."),
"clear-anti-dandruff-shampoo-cool-sport-menthol-330-ml": shampoo("Leave on the scalp for 1–2 minutes so it can work on dandruff."),
"dabo-aloe-vera-tone-up-base-sun-cream": sun("Blend evenly over face and neck; it also works as a tone-up base."),
"dabur-amla-hair-oil-200-ml": hairoil("Massage gently into the scalp and spread through the length of hair."),
"dabur-vatika-enriched-coconut-hair-oil-300-ml": hairoil("Massage into the scalp with fingertips and comb through to the ends."),
"dettol-rose-sakura-body-wash-250ml": wash("Use daily for a fresh, clean feel."),
"dot-key-vitamin-c-e-sunscreen-spf50-80g": sun("Use enough to cover face and neck evenly; blend well."),
"dove-men-care-clean-comfort-body-wash-250-ml": ["Put a small amount on wet hands or a soft sponge.", "Lather gently over baby's body and hair.", "Rinse thoroughly with warm water.", "Avoid contact with eyes and keep out of children's reach when not in use."],
"dove-deeply-nourishing-body-wash-250-ml": wash("Use daily; a shower puff gives a richer lather."),
"dove-exfoliating-body-polish-macadamia-and-rice-milk-225-g": ["Apply to damp skin after washing.", "Massage in gentle circular motions, avoiding the face.", "Rinse well and pat dry.", "Use 1–2 times a week, then moisturize."],
"dove-intense-repair-conditioner-180-ml": conditioner("Leave on for 1–2 minutes for repair care."),
"dove-intense-repair-shampoo-340-ml": shampoo("Focus on the scalp and let the lather run through the lengths."),
"essence-lash-princess-mascara-12-ml": mascara("Wiggle the brush from the roots to the tips for volume."),
"fiama-magnetic-attraction-shower-gel-250-ml": wash("Enjoy the fragrance; use daily."),
"garnier-bright-complete-vitamin-c-booster-serum-30-ml": ["After cleansing, take 2–3 drops of serum.", "Pat gently onto face and neck.", "Follow with moisturizer.", "Use morning and apply sunscreen in the daytime."],
"garnier-fructis-hair-food-banana-hair-mask-350-ml": ["After shampooing, squeeze out excess water.", "Apply the mask to mid-lengths and ends.", "Leave on for the time stated on the pack, then rinse well.", "Use once or twice a week."],
"garnier-ultra-doux-argan-and-camellia-shampoo-400-ml": shampoo("Work through to the ends for a smooth, soft finish."),
"head-and-shoulders-classic-clean-shampoo-330-ml": shampoo("Leave on for 1–2 minutes before rinsing for best dandruff control."),
"himalaya-cocoa-butter-intensive-body-lotion-200-ml": lotion("Pay attention to rough, dry areas like elbows and knees."),
"himalaya-nourishing-body-lotion-400-ml": lotion("A small amount covers a large area; reapply to dry spots."),
"himalaya-protein-shampoo-400-ml": shampoo("Use regularly for stronger-feeling hair."),
"himalaya-purifying-neem-face-wash-100-ml": cleanser("Avoid the eye area; use twice a day."),
"indulekha-bringha-hair-oil-100-ml": ["Part your hair and apply the oil to the scalp with fingertips.", "Massage gently for about 5 minutes.", "Leave on for at least an hour, or overnight.", "Wash off with shampoo."],
"innisfree-green-tea-seed-serum-80-ml": serum("Press gently into skin until absorbed."),
"im-from-rice-toner": toner("Pat into skin with your hands to boost hydration and glow."),
"johnson-s-baby-lotion-200-ml": ["After bath, pat baby's skin dry.", "Apply a small amount and massage gently.", "Avoid the eyes and any broken skin.", "Keep out of children's reach."],
"johnson-s-baby-shampoo-200-ml": ["Wet baby's hair with warm water.", "Apply a small amount and lather gently.", "Rinse thoroughly, avoiding the eyes.", "Keep out of children's reach."],
"l-oreal-paris-color-riche-matte-lipstick-3-6-g": lip("Start at the centre of your upper lip and glide outward; repeat on the lower lip."),
"l-oreal-paris-elvive-dream-lengths-shampoo-400-ml": shampoo("Pay special attention to long lengths to keep them smooth."),
"l-oreal-paris-elvive-extraordinary-oil-100-ml": ["Put a few drops on your palms.", "Smooth over mid-lengths and ends of damp or dry hair.", "Style as usual; do not rinse out.", "Start with a little and add more only if needed."],
"l-oreal-paris-elvive-total-repair-5-mask-300-ml": ["After shampooing, squeeze out excess water.", "Apply the mask from mid-lengths to ends.", "Leave on for a few minutes as directed on the pack, then rinse.", "Use once or twice a week."],
"l-oreal-paris-elvive-total-repair-5-shampoo-400-ml": shampoo("Follow with Total Repair 5 conditioner or mask."),
"l-oreal-paris-infallible-24h-fresh-wear-foundation-30-ml": ["Prep skin with moisturizer and primer.", "Dot a small amount on the face and blend outward with a brush or sponge.", "Build coverage in thin layers where needed.", "Set with powder for longer wear; remove with makeup remover."],
"lux-black-orchid-juniper-body-wash-245ml": wash("Use daily for lasting fragrance."),
"lux-velvet-touch-body-wash-245-ml": wash("Use daily for soft, fragrant skin."),
"la-roche-posay-effaclar-purifying-foaming-gel-200-ml": cleanser("Avoid the eye area; suited to oily, blemish-prone skin."),
"lakme-eyeconic-kajal-0-35-g": ["Twist up a little product.", "Draw along the lash line from the inner to the outer corner.", "Smudge with a brush or fingertip if you like a softer look.", "Remove with makeup remover at night."],
"laneige-water-sleeping-mask-70-ml": ["After your night skincare, take a thin, even layer.", "Spread over face, avoiding the eye area.", "Leave on overnight.", "Rinse with water the next morning."],
"livon-anti-frizz-serum-18ml": ["Take 1–2 drops on your palms and rub together.", "Apply to damp or dry hair from mid-lengths to ends, avoiding the roots.", "Style as usual.", "Do not rinse out."],
"livon-silky-potion-hair-serum-100-ml": ["Take 1–2 pumps or drops on your palms.", "Smooth through damp or dry hair from mid-lengths to ends.", "Avoid the roots and scalp.", "Do not rinse out; style as usual."],
"missha-m-perfect-cover-bb-cream": ["After skincare and sunscreen, dot BB cream across the face.", "Blend with fingers or a sponge from the centre outward.", "Layer thinly to build coverage.", "Remove with cleanser or makeup remover at night."],
"mamaearth-onion-hair-oil-150-ml": hairoil("Massage into the scalp for a few minutes and spread to the ends."),
"mamaearth-onion-shampoo-250-ml": shampoo("Use regularly for best results."),
"mamaearth-ubtan-face-wash-100-ml": cleanser("Avoid the eye area."),
"maybelline-brow-ultra-slim-pencil-0-85-g": ["Brush your brows upward first.", "Fill in sparse areas with light, hair-like strokes.", "Define the tail for shape.", "Brush through with a spoolie to blend."],
"maybelline-colossal-kajal-0-35-g": ["Apply along the upper and lower lash line.", "Smudge with a brush or fingertip if needed.", "Allow to set for lasting colour.", "Remove with makeup remover at night."],
"maybelline-fit-me-blush-4-5-g": ["Swirl a brush in the blush and tap off excess.", "Smile and sweep onto the apples of the cheeks toward the temples.", "Blend well so there are no hard edges.", "Layer for a stronger colour."],
"maybelline-fit-me-concealer-6-8-ml": ["Apply under the eyes, around the nose and on blemishes.", "Pat gently with a finger or sponge to blend.", "Set with a little powder if needed.", "Remove with makeup remover."],
"maybelline-fit-me-matte-poreless-foundation-30-ml": ["Shake well and moisturize your skin first.", "Dot on the face and blend outward with a brush or sponge.", "Build coverage in thin layers.", "Remove with makeup remover at night."],
"maybelline-lash-sensational-mascara-9-5-ml": mascara("Wiggle the brush at the roots and sweep up to the tips."),
"maybelline-lash-sensational-sky-high-mascara-7-2-ml": mascara("Start at the roots and sweep upward to lengthen lashes."),
"maybelline-lasting-drama-gel-eyeliner-3-g": ["Dip a thin brush into the gel.", "Draw along the upper lash line from the inner to outer corner.", "Add a small wing if you like.", "Let it dry; remove with makeup remover."],
"maybelline-superstay-matte-ink-liquid-lipstick-5-ml": ["Apply from the centre of the lips outward.", "Let it dry for about a minute without pressing lips together.", "Avoid rubbing for lasting wear.", "Remove with an oil-based makeup remover."],
"maybelline-the-nudes-eyeshadow-palette-9-6-g": ["Apply a light shade all over the lid as a base.", "Blend a mid-tone into the crease.", "Add a deeper shade at the outer corner.", "Tap off excess and blend well; remove with makeup remover."],
"mediheal-n-m-f-aquaring-ampoule-sheet-mask-1-sheet": ["Cleanse and tone your face.", "Unfold the mask and place it on the face.", "Leave on for 10–20 minutes.", "Remove, pat in the leftover essence; no rinsing needed."],
"nyx-professional-makeup-butter-gloss-8-ml": lip("Wear alone or over lipstick for extra shine."),
"nyx-professional-makeup-matte-finish-setting-spray-60-ml": ["Finish your makeup, then close your eyes.", "Hold the bottle about 20 cm from the face.", "Spray in an X and T motion.", "Let it dry naturally."],
"nyx-professional-makeup-soft-matte-lip-cream-8-ml": lip("Start at the centre and blend outward for a soft matte finish."),
"neutrogena-hydro-boost-gel-cream-fragrance-free": ["After cleansing, take a small amount.", "Apply to face and neck.", "Use morning and night.", "Apply sunscreen after it in the daytime."],
"neutrogena-norwegian-formula-hand-cream-56-g": handcream("Rich formula, so a small amount is enough."),
"neutrogena-oil-free-acne-wash-175-ml": cleanser("Avoid the eye area; if skin feels dry, use once a day."),
"nivea-creme-care-hand-cream-75-ml": handcream("Massage until absorbed."),
"nivea-express-hydration-body-lotion-400-ml": lotion("Quick-absorbing; suitable for use all over the body."),
"nivea-frangipani-and-oil-shower-gel-250-ml": wash("Use daily for fresh, scented skin."),
"nivea-men-deep-clean-shower-gel-250-ml": wash("Can also be used on the hair if you like."),
"nivea-original-care-lip-balm-4-8-g": lip("Use before bed and before going outdoors for extra protection."),
"nivea-soft-moisturising-cream-200-ml": ["Take a small amount of cream.", "Massage into face, hands or body until absorbed.", "Use daily.", "Reapply to dry areas as needed."],
"ogx-argan-oil-of-morocco-shampoo-385-ml": shampoo("Follow with a conditioner or mask from the same range."),
"olay-regenerist-micro-sculpting-cream-50-g": ["Apply to clean face and neck.", "Smooth in upward strokes until absorbed.", "Use morning and night.", "Apply sunscreen in the daytime."],
"palmolive-aroma-sensual-body-wash-250-ml": wash("Enjoy the fragrance; use daily."),
"pantene-hair-fall-control-shampoo-340-ml": shampoo("Follow with Pantene conditioner for best results."),
"parachute-advansed-coconut-hair-oil-200-ml": hairoil("Massage gently into the scalp and comb through the hair."),
"parachute-naturale-nourishing-care-shampoo-160ml": shampoo("Use as often as needed."),
"ponds-hydra-miracle-super-light-gel-100g": ["Apply a small amount to clean face and neck.", "Spread evenly and pat until absorbed.", "Use morning and night.", "Apply sunscreen in the daytime."],
"revlon-colorstay-longwear-foundation-30-ml": ["Moisturize skin first.", "Apply a small amount and blend outward from the centre of the face.", "Build coverage in thin layers.", "Set with powder; remove with makeup remover."],
"revlon-super-lustrous-lipstick-4-2-g": lip("Glide from the centre outward; blot and reapply for deeper colour."),
"rimmel-london-stay-matte-pressed-powder-14-g": ["Apply after foundation.", "Press lightly onto the T-zone with the puff or a brush.", "Build only where shine shows.", "Touch up during the day as needed."],
"round-lab-1025-dokdo-toner-200-ml": toner("Pat gently into skin; layer for extra moisture."),
"skin1004-madagascar-centella-ampoule": serum("Press gently into skin to soothe and hydrate."),
"schwarzkopf-gliss-ultimate-repair-shampoo-370-ml": shampoo("Use with Gliss repair conditioner for best results."),
"sesa-strong-roots-herbal-hair-oil-110ml": hairoil("Massage gently into the scalp, focusing on the roots."),
"simple-hydrating-light-moisturiser-125-ml": ["Apply to clean face and neck.", "Massage gently until absorbed.", "Use morning and night.", "Works well as a base under makeup."],
"simple-kind-to-skin-refreshing-facial-gel-wash": cleanser("Avoid the eye area."),
"skin-cafe-rosavera-shower-gel": wash("Use daily; a little goes a long way."),
"some-by-mi-aha-bha-pha-30-days-miracle-toner-150-ml": ["After cleansing, wipe over face with a cotton pad.", "Avoid the eye area.", "Start a few times a week, then increase as skin tolerates.", "Always use sunscreen in the daytime."],
"sunsilk-black-shine-shampoo-350-ml": shampoo("Use with Sunsilk conditioner for extra shine."),
"tresemme-hair-fall-defense-shampoo-340-ml": shampoo("Follow with a conditioner for extra strength."),
"tresemme-keratin-smooth-conditioner-340-ml": conditioner("Leave on for 1–2 minutes for a smooth finish."),
"tresemme-keratin-smooth-shampoo-340-ml": shampoo("Follow with Keratin Smooth conditioner."),
"the-body-shop-coconut-body-scrub-250-ml": ["Apply to damp skin in the shower.", "Massage in gentle circular motions, avoiding the face.", "Rinse well and pat dry.", "Use 1–2 times a week, then moisturize."],
"the-body-shop-shea-body-butter-200-ml": ["Scoop a small amount after bathing.", "Warm between your palms and massage into skin.", "Focus on dry areas such as elbows, knees and feet.", "Use daily for rich moisture."],
"the-ordinary-glycolic-acid-7-toning-solution-240-ml": ["Use in the evening only, after cleansing.", "Apply to a cotton pad and wipe over face, avoiding the eye area.", "Start with 1–2 nights a week and build up slowly.", "Use sunscreen the next day."],
"the-ordinary-hyaluronic-acid-2-b5-serum-30-ml": serum("Apply before heavier creams so moisture is locked in."),
"the-ordinary-multi-peptide-serum-hair-density": ["Use on a clean scalp that is dry or towel-dried.", "Apply with the dropper along the hair partings.", "Massage in gently with fingertips.", "Do not rinse out; use as directed on the pack."],
"the-ordinary-niacinamide-10-zinc-1": serum("Apply before heavier creams; avoid the eye area."),
"vaseline-healthy-bright-daily-brightening-lotion-400-ml": lotion("Use daily for a brighter, healthier look."),
"vaseline-healthy-bright-gluta-hya-flawless-glow-lotion-200-ml": lotion("Use daily for a smooth, glowing look."),
"vaseline-intensive-care-cocoa-glow-body-lotion-400-ml": lotion("Cocoa butter keeps dry skin soft and glowing."),
"vaseline-original-petroleum-jelly-100-ml": ["Clean and dry the skin.", "Apply a thin layer to dry areas such as lips, cuticles, elbows and heels.", "Reapply as needed.", "Do not use on deep cuts or burns."],
"wet-n-wild-megaglo-highlighting-powder-5-4-g": ["Use a soft brush to pick up a small amount.", "Sweep onto cheekbones, the nose bridge and cupid's bow.", "Blend well and build only if you want more glow.", "Close the compact after use."],
"iunik-tea-tree-relief-serum": serum("Pat gently into skin; do a small patch test first."),
};

if (!process.env.MONGODB_URI) throw new Error("Set MONGODB_URI in backend/.env.");
await mongoose.connect(process.env.MONGODB_URI);
try {
  const slugs = Object.keys(USAGE);
  const found = await Product.find({ slug: { $in: slugs } }).select("slug usage").lean();
  fs.writeFileSync(new URL("../usage-backup.json", import.meta.url), JSON.stringify(Object.fromEntries(found.map((p) => [p.slug, p.usage])), null, 2), "utf8");
  let done = 0;
  const known = new Set(found.map((p) => p.slug));
  for (const slug of slugs) {
    if (!known.has(slug)) continue;
    await Product.updateOne({ slug }, { $set: { usage: USAGE[slug].join("\n") } });
    done += 1;
  }
  console.log(`How to use set for ${done} of ${slugs.length} products. (Old text saved in backend/usage-backup.json)`);
  const missing = slugs.filter((s) => !known.has(s));
  if (missing.length) console.log(`Slugs not found in database:\n  ${missing.join("\n  ")}`);
  const untouched = await Product.find({ slug: { $nin: slugs } }).select("slug").lean();
  if (untouched.length) console.log(`Products with no entry in this script:\n  ${untouched.map((p) => p.slug).join("\n  ")}`);
} finally {
  await mongoose.disconnect();
}
