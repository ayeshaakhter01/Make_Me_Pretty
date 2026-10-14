/* Default brands shown in the homepage "Brands we carry" strip. Seeded on a
   fresh store; the admin can add logos / edit / reorder / delete from
   Admin → Banners → Brand logos. Text wordmark shows until a logo is uploaded. */

export const DEFAULT_BRANDS = [
  { brand: "CeraVe", description: "Dermatologist barrier care" },
  { brand: "Cetaphil", description: "Gentle daily essentials" },
  { brand: "The Ordinary", description: "Clinical actives" },
  { brand: "Neutrogena", description: "Trusted skincare" },
  { brand: "I’m from", description: "Nature-derived K-beauty" },
  { brand: "COSRX", description: "Snail & blemish care" },
  { brand: "SKIN1004", description: "Centella hydration" },
  { brand: "Anua", description: "Heartleaf soothing" },
  { brand: "AXIS-Y", description: "Glow & spot care" },
  { brand: "Beauty of Joseon", description: "Hanbang rituals" },
  { brand: "CARE:NEL", description: "Everyday K-beauty" },
  { brand: "iUNIK", description: "Minimal formulas" },
  { brand: "MISSHA", description: "K-beauty staple" },
  { brand: "3W Clinic", description: "Value skincare" },
  { brand: "DABO", description: "Korean essentials" },
  { brand: "Simple", description: "Kind to skin" },
];

/* =============================================================================
   BRAND LOGOS (added by Fayeza)
   Put each logo picture in  frontend/media/brands/  using the file name below.
   (If your picture is .jpg or .svg, just change the ending here.)
   A brand whose picture is missing keeps showing its name as text.
============================================================================= */
export const BRAND_LOGOS = {
  "CeraVe": "media/brands/cerave.png",
  "Cetaphil": "media/brands/cetaphil.png",
  "The Ordinary": "media/brands/theordinary.png",
  "Neutrogena": "media/brands/neutrogena.png",
  "I\u2019m from": "media/brands/imfrom.png",
  "COSRX": "media/brands/cosrx.png",
  "SKIN1004": "media/brands/skin1004.png",
  "Anua": "media/brands/anua.png",
  "AXIS-Y": "media/brands/axisy.png",
  "Beauty of Joseon": "media/brands/boj.png",
  "CARE:NEL": "media/brands/carenel.png",
  "iUNIK": "media/brands/iunik.png",
  "MISSHA": "media/brands/missha.png",
  "3W Clinic": "media/brands/3wclinic.png",
  "DABO": "media/brands/dabo.png",
  "Simple": "media/brands/simple.png",
};