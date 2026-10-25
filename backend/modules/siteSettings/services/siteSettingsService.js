import StoreSettings from "../../../models/StoreSettings.js";
import AppError from "../../../utils/AppError.js";

export const DEFAULT_FOOTER = {
  helpLinks: [{ id: "help-contact", label: "Contact", href: "/p/contact" }, { id: "help-about", label: "About Us", href: "/p/about-us" }],
  policyLinks: [
    { id: "policy-refund", label: "Refund & Return Policy", href: "/p/refund-return" },
    { id: "policy-privacy", label: "Privacy Policy", href: "/p/privacy" },
    { id: "policy-delivery", label: "Delivery Policy", href: "/p/delivery" },
    { id: "policy-terms", label: "Terms & Condition", href: "/p/terms" },
  ],
  socials: [
    { name: "Facebook", href: "https://www.facebook.com/share/1GzwwLRMqB/?mibextid=wwXIfr", active: true },
    { name: "Instagram", href: "https://www.instagram.com/makemepretty24", active: true },
    { name: "WhatsApp", href: "https://wa.me/", active: true },
    { name: "TikTok", href: "https://www.tiktok.com/@make_me_pretty9", active: true },
    { name: "LinkedIn", href: "https://www.linkedin.com/in/make-me-pretty-773652376", active: true },
  ],
  payments: [
    { id: "pay-bkash", label: "bKash", src: "/uploads/payment-logos/bkash.svg" },
    { id: "pay-visa", label: "Visa", src: "/uploads/payment-logos/visa.png" },
    { id: "pay-cod", label: "Cash on Delivery", src: "/uploads/payment-logos/cod.png" },
  ],
};
const DEFAULT_FOUNDER_STORY = "As the Founder of Make Me Pretty, my vision has always been simple — to make authentic skincare accessible and trustworthy for everyone. What started as a small dream in June 2021 has grown with the love and trust of our customers. Every order we send carries care, honesty, and gratitude. Thank you for being part of our journey 💜";
export const DEFAULT_ABOUT = [
  { id: "about-ayesha", name: "Ayesha Akhter", text: DEFAULT_FOUNDER_STORY, image: "" },
  { id: "about-sadman", name: "MD Sadman Hasan", text: DEFAULT_FOUNDER_STORY, image: "" },
];
export const DEFAULT_CONTACT = {
  title: "Contact Us",
  subtitle: "Questions about an order or a product? We’d love to hear from you.",
  introTitle: "Let’s connect!",
  introText: "Whether it’s about an order, a product, or your skin’s next favourite ritual — call us, WhatsApp us, or drop a note here. We reply within a day.",
  phone: "01644611916",
  whatsapp: "01622736644",
  address: "Block-G, Halishahar, Chittagong",
};
const validMedia = (value) => typeof value === "string" && (/^https:\/\//i.test(value) || value.startsWith("/uploads/") || value.startsWith("/images/"));
const normalizePaymentImagePath = (src) => src.replace(/^\/images\/payments\//, "/uploads/payment-logos/");
const cleanLinks = (list, label) => {
  if (!Array.isArray(list) || list.length > 30) throw new AppError(`${label} must be a list of up to 30 entries.`, 400);
  return list.map((item) => {
    if (!item || typeof item.label !== "string" || typeof item.href !== "string" || !item.label.trim() || !item.href.trim()) throw new AppError(`${label} entries need a label and link.`, 400);
    if (!item.href.startsWith("/") && !/^https:\/\//i.test(item.href)) throw new AppError("Footer links must be site paths or HTTPS URLs.", 400);
    return { id: String(item.id || item.label).slice(0, 80), label: item.label.trim().slice(0, 100), href: item.href.trim().slice(0, 500) };
  });
};
function cleanFooter(footer) {
  if (!footer || typeof footer !== "object" || Array.isArray(footer)) throw new AppError("Footer settings must be an object.", 400);
  const socials = footer.socials ?? [];
  const payments = footer.payments ?? [];
  if (!Array.isArray(socials) || socials.length > 20 || socials.some((item) => typeof item.name !== "string" || typeof item.href !== "string" || !/^https:\/\//i.test(item.href))) throw new AppError("Social links must use HTTPS URLs.", 400);
  if (!Array.isArray(payments) || payments.length > 20 || payments.some((item) => typeof item.label !== "string" || !validMedia(item.src))) throw new AppError("Payment logos must use HTTPS or uploaded image paths.", 400);
  return {
    helpLinks: cleanLinks(footer.helpLinks ?? [], "Help links"),
    policyLinks: cleanLinks(footer.policyLinks ?? [], "Policy links"),
    socials: socials.map((item) => ({ name: item.name.slice(0, 40), href: item.href.slice(0, 500), active: item.active !== false })),
    payments: payments.map((item) => ({ id: String(item.id || item.label).slice(0, 80), label: item.label.trim().slice(0, 80), src: normalizePaymentImagePath(item.src) })),
  };
}
function cleanAbout(about) {
  if (!Array.isArray(about) || about.length > 20) throw new AppError("About page sections must be a list of up to 20 entries.", 400);
  return about.map((item) => {
    if (!item || typeof item.name !== "string" || !item.name.trim() || typeof item.text !== "string" || typeof item.image !== "string") {
      throw new AppError("About page sections need a title, text, and image path.", 400);
    }
    if (item.image && !validMedia(item.image)) throw new AppError("About page images must be HTTPS or uploaded image paths.", 400);
    if (item.name.length > 100 || item.text.length > 5000) throw new AppError("About page title or text is too long.", 400);
    return { id: String(item.id || item.name).slice(0, 80), name: item.name.trim(), text: item.text.trim(), image: item.image };
  });
}
function cleanContact(contact) {
  const fields = Object.keys(DEFAULT_CONTACT);
  if (!contact || typeof contact !== "object" || Array.isArray(contact) || fields.some((field) => typeof contact[field] !== "string")) {
    throw new AppError("Contact settings must include valid text fields.", 400);
  }
  if (fields.some((field) => contact[field].length > (field.endsWith("Text") || field === "subtitle" ? 1000 : 300))) {
    throw new AppError("Contact text is too long.", 400);
  }
  for (const field of ["phone", "whatsapp"]) {
    if (contact[field] && !/^[0-9+()\s-]{7,30}$/.test(contact[field])) throw new AppError("Contact phone numbers have an invalid format.", 400);
  }
  return Object.fromEntries(fields.map((field) => [field, contact[field].trim()]));
}
export async function getStoreSettings() {
  const saved = await StoreSettings.findOne({ key: "storefront" }).lean();
  const storedFooter = saved?.footer || DEFAULT_FOOTER;
  const footer = {
    ...storedFooter,
    payments: (Array.isArray(storedFooter.payments) ? storedFooter.payments : []).map((payment) => ({
      ...payment,
      src: typeof payment.src === "string" ? normalizePaymentImagePath(payment.src) : payment.src,
    })),
  };
  return { logo: saved?.logo || "", footer, about: saved?.about ?? DEFAULT_ABOUT, contact: saved?.contact ?? DEFAULT_CONTACT };
}
export async function updateStoreSettings(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new AppError("Settings payload must be an object.", 400);
  const update = {};
  if (Object.hasOwn(input, "logo")) {
    if (input.logo !== "" && !validMedia(input.logo)) throw new AppError("Logo must be an HTTPS URL or an uploaded image path.", 400);
    update.logo = input.logo;
  }
  if (Object.hasOwn(input, "footer")) update.footer = cleanFooter(input.footer);
  if (Object.hasOwn(input, "about")) update.about = cleanAbout(input.about);
  if (Object.hasOwn(input, "contact")) update.contact = cleanContact(input.contact);
  if (!Object.keys(update).length) throw new AppError("No supported settings were provided.", 400);
  const saved = await StoreSettings.findOneAndUpdate({ key: "storefront" }, { $set: update, $setOnInsert: { key: "storefront" } }, { new: true, upsert: true, runValidators: true }).lean();
  return { logo: saved.logo || "", footer: saved.footer || DEFAULT_FOOTER, about: saved.about ?? DEFAULT_ABOUT, contact: saved.contact ?? DEFAULT_CONTACT };
}
