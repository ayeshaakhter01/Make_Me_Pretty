import Cart from "../../../models/Cart.js";
import Wishlist from "../../../models/Wishlist.js";
import Product from "../../../models/Product.js";
import AppError from "../../../utils/AppError.js";

const validId = (id) => /^[\da-f]{24}$/i.test(id || "");
async function availableProduct(productId) {
  if (!validId(productId)) throw new AppError("Invalid product id.", 400);
  const product = await Product.findOne({ _id: productId, active: true });
  if (!product) throw new AppError("Product not found.", 404);
  return product;
}
export async function getCart(customer) {
  const cart = await Cart.findOne({ customer }).populate("items.product", "name price images stock active").lean();
  return cart || { items: [] };
}
export async function addCartItem(customer, { productId, quantity = 1 }) {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) throw new AppError("Quantity must be between 1 and 99.", 400);
  const product = await availableProduct(productId);
  const cart = await Cart.findOne({ customer }) || new Cart({ customer, items: [] });
  const item = cart.items.find((entry) => entry.product.toString() === productId);
  const nextQuantity = (item?.quantity || 0) + quantity;
  if (nextQuantity > product.stock) throw new AppError("Requested quantity is not available.", 409);
  if (item) item.quantity = nextQuantity; else cart.items.push({ product: product._id, quantity });
  await cart.save();
  return getCart(customer);
}
export async function setCartItem(customer, productId, quantity) {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) throw new AppError("Quantity must be between 1 and 99.", 400);
  const product = await availableProduct(productId);
  if (quantity > product.stock) throw new AppError("Requested quantity is not available.", 409);
  const cart = await Cart.findOne({ customer });
  const item = cart?.items.find((entry) => entry.product.toString() === productId);
  if (!item) throw new AppError("Cart item not found.", 404);
  item.quantity = quantity;
  await cart.save();
  return getCart(customer);
}
export async function removeCartItem(customer, productId) {
  const cart = await Cart.findOne({ customer });
  if (cart) { cart.items = cart.items.filter((entry) => entry.product.toString() !== productId); await cart.save(); }
  return getCart(customer);
}
export async function clearCart(customer) {
  await Cart.updateOne({ customer }, { $set: { items: [] } }, { upsert: true });
  return { items: [] };
}
export async function getWishlist(customer) {
  const wishlist = await Wishlist.findOne({ customer }).populate("products", "name price images stock active").lean();
  return wishlist || { products: [] };
}
export async function addWishlistItem(customer, productId) {
  const product = await availableProduct(productId);
  await Wishlist.updateOne({ customer }, { $addToSet: { products: product._id } }, { upsert: true });
  return getWishlist(customer);
}
export async function removeWishlistItem(customer, productId) {
  if (!validId(productId)) throw new AppError("Invalid product id.", 400);
  await Wishlist.updateOne({ customer }, { $pull: { products: productId } });
  return getWishlist(customer);
}
