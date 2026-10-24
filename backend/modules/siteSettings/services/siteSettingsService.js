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
    { id: "pay-bkash", label: "bKash", src: "/images/payments/bkash.svg" },
    { id: "pay-visa", label: "Visa", src: "/images/payments/visa.png" },
    { id: "pay-cod", label: "Cash on Delivery", src: "/images/payments/cod.png" },
  ],
};
const validMedia = (value) => typeof value === "string" && (/^https:\/\//i.test(value) || value.startsWith("/uploads/") || value.startsWith("/images/"));
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
    payments: payments.map((item) => ({ id: String(item.id || item.label).slice(0, 80), label: item.label.trim().slice(0, 80), src: item.src })),
  };
}
export async function getStoreSettings() {
  const saved = await StoreSettings.findOne({ key: "storefront" }).lean();
  return { logo: saved?.logo || "", footer: saved?.footer || DEFAULT_FOOTER };
}
export async function updateStoreSettings(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new AppError("Settings payload must be an object.", 400);
  const update = {};
  if (Object.hasOwn(input, "logo")) {
    if (input.logo !== "" && !validMedia(input.logo)) throw new AppError("Logo must be an HTTPS URL or an uploaded image path.", 400);
    update.logo = input.logo;
  }
  if (Object.hasOwn(input, "footer")) update.footer = cleanFooter(input.footer);
  if (!Object.keys(update).length) throw new AppError("No supported settings were provided.", 400);
  const saved = await StoreSettings.findOneAndUpdate({ key: "storefront" }, { $set: update, $setOnInsert: { key: "storefront" } }, { new: true, upsert: true, runValidators: true }).lean();
  return { logo: saved.logo || "", footer: saved.footer || DEFAULT_FOOTER };
}
