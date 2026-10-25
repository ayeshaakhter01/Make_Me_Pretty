import Brand from "../../../models/Brand.js";
import Product from "../../../models/Product.js";
import AppError from "../../../utils/AppError.js";

const validLogo = (value) => value === "" || (typeof value === "string" && (/^https:\/\//i.test(value) || value.startsWith("/uploads/") || value.startsWith("/media/")));

// Validates the admin's input. Only the fields that were sent are returned.
function clean(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new AppError("Brand data must be an object.", 400);
  const out = {};
  if (Object.hasOwn(input, "name")) {
    if (typeof input.name !== "string" || !input.name.trim() || input.name.length > 80) throw new AppError("Brand name is required (max 80 characters).", 400);
    out.name = input.name.trim();
  }
  if (Object.hasOwn(input, "description")) {
    if (typeof input.description !== "string" || input.description.length > 160) throw new AppError("Description must be text up to 160 characters.", 400);
    out.description = input.description.trim();
  }
  if (Object.hasOwn(input, "logo")) {
    if (!validLogo(input.logo)) throw new AppError("Logo must be an HTTPS URL or an uploaded image path.", 400);
    out.logo = input.logo;
  }
  if (Object.hasOwn(input, "order")) {
    const order = Number(input.order);
    if (!Number.isFinite(order)) throw new AppError("Order must be a number.", 400);
    out.order = order;
  }
  if (Object.hasOwn(input, "active")) out.active = input.active !== false;
  return out;
}

const countsByBrand = async () => new Map((await Product.aggregate([
  { $match: { active: true } },
  { $group: { _id: "$brand", n: { $sum: 1 } } },
])).map((row) => [row._id, row.n]));

// PUBLIC: brands that are switched on AND have at least one active product.
// A product brand that has no Brand record yet still appears (name only), so nothing disappears by accident.
export async function listPublicBrands() {
  const [all, counts] = await Promise.all([Brand.find().sort({ order: 1, name: 1 }).lean(), countsByBrand()]);
  const known = new Set(all.map((brand) => brand.name));
  const listed = all
    .filter((brand) => brand.active && counts.get(brand.name))
    .map((brand) => ({ id: String(brand._id), name: brand.name, description: brand.description, logo: brand.logo, productCount: counts.get(brand.name) }));
  const extras = [...counts.keys()]
    .filter((name) => name && !known.has(name))
    .sort()
    .map((name) => ({ id: `auto-${name}`, name, description: "", logo: "", productCount: counts.get(name) }));
  return [...listed, ...extras];
}

// ADMIN: every brand, including hidden ones.
export async function listAdminBrands() {
  const [all, counts] = await Promise.all([Brand.find().sort({ order: 1, name: 1 }).lean(), countsByBrand()]);
  return all.map((brand) => ({ ...brand, id: String(brand._id), productCount: counts.get(brand.name) || 0 }));
}

const duplicate = (error) => (error?.code === 11000 ? new AppError("A brand with this name already exists.", 409) : error);

export async function createBrand(input) {
  const data = clean(input);
  if (!data.name) throw new AppError("Brand name is required.", 400);
  try { return await Brand.create(data); } catch (error) { throw duplicate(error); }
}

export async function updateBrand(id, input) {
  const data = clean(input);
  if (!Object.keys(data).length) throw new AppError("Nothing to update.", 400);
  const before = await Brand.findById(id);
  if (!before) throw new AppError("Brand not found.", 404);
  const oldName = before.name;
  try {
    const saved = await Brand.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
    // Keep products linked: if the brand was renamed, rename it on its products too.
    if (data.name && data.name !== oldName) await Product.updateMany({ brand: oldName }, { $set: { brand: data.name } });
    return saved;
  } catch (error) { throw duplicate(error); }
}

// Deleting a brand only removes its logo/description card. Products keep their brand text.
export async function deleteBrand(id) {
  const brand = await Brand.findByIdAndDelete(id);
  if (!brand) throw new AppError("Brand not found.", 404);
  return brand;
}
