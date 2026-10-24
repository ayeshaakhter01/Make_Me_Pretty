import Product from "../../../models/Product.js";
import Order from "../../../models/Order.js";
import AppError from "../../../utils/AppError.js";

const publicFilter = { active: true };
export async function listProducts(query) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(60, Math.max(1, Number.parseInt(query.limit, 10) || 24));
  const filter = { ...publicFilter };
  for (const key of ["category", "brand", "type"]) if (query[key]) filter[key] = query[key];
  if (query.minPrice || query.maxPrice) filter.price = { ...(query.minPrice ? { $gte: Number(query.minPrice) } : {}), ...(query.maxPrice ? { $lte: Number(query.maxPrice) } : {}) };
  if (query.q?.trim()) filter.$text = { $search: query.q.trim() };
  const sort = ({ price_asc: { price: 1 }, price_desc: { price: -1 }, newest: { createdAt: -1 }, name: { name: 1 } })[query.sort] || { createdAt: -1 };
  const [data, total] = await Promise.all([Product.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).select("-__v").lean(), Product.countDocuments(filter)]);
  return { data, count: total, page, pages: Math.ceil(total / limit) };
}
export async function listBestSellers() {
  const ranked = await Order.aggregate([
    { $match: { status: { $ne: "cancelled" } } },
    { $unwind: "$items" },
    { $group: { _id: "$items.product", unitsSold: { $sum: "$items.quantity" } } },
    { $sort: { unitsSold: -1, _id: 1 } },
    { $limit: 12 },
  ]);
  if (!ranked.length) return [];
  const products = await Product.find({ _id: { $in: ranked.map((item) => item._id) }, active: true }).select("-__v").lean();
  const byId = new Map(products.map((product) => [String(product._id), product]));
  return ranked.map((item) => byId.get(String(item._id))).filter(Boolean);
}
export async function listAdminProducts() {
  return Product.find().sort({ active: -1, brand: 1, name: 1 }).select("-__v").lean();
}
export async function getProduct(id) {
  const product = await Product.findOne({ $or: [{ _id: id.match(/^[\da-f]{24}$/i) ? id : null }, { slug: id }], active: true }).select("-__v").lean();
  if (!product) throw new AppError("Product not found.", 404);
  return product;
}
const cleanProductData = (data, partial = false) => {
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new AppError("Product data must be an object.", 400);
  const allowed = ["slug", "name", "brand", "category", "type", "size", "sourceUrl", "price", "compareAt", "images", "description", "ingredients", "usage", "skin", "stock", "badge", "active"];
  const unknown = Object.keys(data).filter((key) => !allowed.includes(key));
  if (unknown.length) throw new AppError(`Unsupported product fields: ${unknown.join(", ")}.`, 400);
  const active = data.active !== false;
  for (const key of ["name", "brand", "category", "type"]) if ((!partial || data[key] !== undefined) && (data[key] === undefined || data[key] === "")) throw new AppError(`${key} is required.`, 400);
  if (active) for (const key of ["price", "description", "usage"]) if (data[key] === undefined || data[key] === "") throw new AppError(`${key} is required for an active product.`, 400);
  if (data.price !== undefined && (!Number.isFinite(Number(data.price)) || Number(data.price) < 0 || (active && Number(data.price) <= 0))) throw new AppError("An active product needs a price greater than zero.", 400);
  if (data.stock !== undefined && (!Number.isInteger(Number(data.stock)) || Number(data.stock) < 0)) throw new AppError("Stock must be a non-negative whole number.", 400);
  if (data.images !== undefined && (!Array.isArray(data.images) || data.images.length > 8 || data.images.some((image) => typeof image !== "string" || !(/^(https:\/\/|\/uploads\/|\/media\/)/i).test(image)))) throw new AppError("Images must be HTTPS URLs or app upload/media paths (up to 8).", 400);
  if (data.ingredients !== undefined && (!Array.isArray(data.ingredients) || data.ingredients.length > 40 || data.ingredients.some((item) => typeof item !== "string" || item.length > 120))) throw new AppError("Ingredients must be a list of up to 40 text items.", 400);
  if (data.usage !== undefined && typeof data.usage !== "string") throw new AppError("Usage instructions must be text.", 400);
  return data;
};
export async function createProduct(rawData) {
  const data = cleanProductData(rawData);
  const slug = data.slug?.trim().toLowerCase() || data.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return Product.create({ ...data, id: data.id || slug, slug, brand: data.brand.trim(), category: data.category.trim(), type: data.type.trim() });
}
export async function updateProduct(id, data) {
  const existing = await Product.findById(id);
  if (!existing) throw new AppError("Product not found.", 404);
  const allowed = ["slug", "name", "brand", "category", "type", "size", "sourceUrl", "price", "compareAt", "images", "description", "ingredients", "usage", "skin", "stock", "badge", "active"];
  const merged = Object.fromEntries(allowed.map((key) => [key, data[key] === undefined ? existing[key] : data[key]]));
  const update = cleanProductData(merged);
  if (!Object.keys(data).length) throw new AppError("Provide product fields to update.", 400);
  const product = await Product.findByIdAndUpdate(id, update, { new: true, runValidators: true }).select("-__v");
  if (!product) throw new AppError("Product not found.", 404);
  return product;
}
export async function deleteProduct(id) {
  const product = await Product.findByIdAndUpdate(id, { active: false }, { new: true }).select("-__v");
  if (!product) throw new AppError("Product not found.", 404);
  return product;
}
export async function listCategories() { return Product.distinct("category", publicFilter); }
export async function listBrands() { return Product.distinct("brand", publicFilter); }
