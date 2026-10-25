import Policy from "../../../models/Policy.js";
import AppError from "../../../utils/AppError.js";

// About Us and Contact are designed pages in the frontend, so these addresses are taken.
const RESERVED = new Set(["about-us", "contact"]);
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const slugify = (text) => String(text).toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 70);

// Makes sure the address is free: "shipping-policy", then "shipping-policy-2", ...
async function freeSlug(base) {
  let slug = base || "policy";
  for (let n = 2; RESERVED.has(slug) || (await Policy.exists({ slug })); n += 1) slug = `${base || "policy"}-${n}`;
  return slug;
}

function clean(input, { partial }) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new AppError("Policy data must be an object.", 400);
  const out = {};
  if (!partial || Object.hasOwn(input, "title")) {
    if (typeof input.title !== "string" || !input.title.trim() || input.title.length > 120) throw new AppError("Policy title is required (max 120 characters).", 400);
    out.title = input.title.trim();
  }
  if (!partial || Object.hasOwn(input, "content")) {
    if (typeof input.content !== "string" || !input.content.trim()) throw new AppError("Policy content is required.", 400);
    if (input.content.length > 50000) throw new AppError("Policy content is too long (max 50,000 characters).", 400);
    out.content = input.content.trim();
  }
  if (Object.hasOwn(input, "published")) out.published = input.published !== false;
  return out;
}

export const listPublicPolicies = () => Policy.find({ published: true }).sort({ order: 1, createdAt: 1 }).select("title slug").lean();

export async function getPublicPolicy(slug) {
  const policy = await Policy.findOne({ slug: String(slug).toLowerCase(), published: true }).select("title slug content").lean();
  if (!policy) throw new AppError("Policy not found.", 404);
  return policy;
}

export const listAdminPolicies = () => Policy.find().sort({ order: 1, createdAt: 1 }).lean();

export async function createPolicy(input) {
  const data = clean(input, { partial: false });
  const wanted = typeof input.slug === "string" && input.slug.trim() ? slugify(input.slug) : slugify(data.title);
  if (wanted && !SLUG.test(wanted)) throw new AppError("The page address is invalid.", 400);
  const last = await Policy.findOne().sort({ order: -1 }).select("order").lean();
  return Policy.create({ ...data, slug: await freeSlug(wanted), order: (last?.order ?? -1) + 1 });
}

// The address (slug) never changes after creation, so footer links and bookmarks keep working.
export async function updatePolicy(id, input) {
  const data = clean(input, { partial: true });
  if (!Object.keys(data).length) throw new AppError("Nothing to update.", 400);
  const policy = await Policy.findByIdAndUpdate(id, { $set: data }, { returnDocument: "after", runValidators: true });
  if (!policy) throw new AppError("Policy not found.", 404);
  return policy;
}

export async function deletePolicy(id) {
  const policy = await Policy.findByIdAndDelete(id);
  if (!policy) throw new AppError("Policy not found.", 404);
  return policy;
}
