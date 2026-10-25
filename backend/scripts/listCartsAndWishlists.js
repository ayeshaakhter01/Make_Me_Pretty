// Read-only. Prints customer emails, so only for admin/debug use.
import "dotenv/config";
import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import Wishlist from "../models/Wishlist.js";
import "../models/User.js";
import "../models/Product.js";

const who = (c) => c ? `${c.name} <${c.email}> [${c.role}${c.isDemo ? ", demo" : ""}]` : "(account no longer exists)";
await mongoose.connect(process.env.MONGODB_URI);
try {
  const carts = await Cart.find().populate("customer", "name email role isDemo").populate("items.product", "name").lean();
  console.log("\n=== CARTS ===");
  for (const cart of carts) console.log(`${who(cart.customer)}: ${cart.items.length ? cart.items.map((i) => `${i.product?.name ?? "removed product"} x${i.quantity}`).join("; ") : "(empty)"}`);
  const lists = await Wishlist.find().populate("customer", "name email role isDemo").populate("products", "name").lean();
  console.log("\n=== WISHLISTS ===");
  for (const list of lists) console.log(`${who(list.customer)}: ${list.products.length ? list.products.map((p) => p?.name).join("; ") : "(empty)"}`);
} finally {
  await mongoose.disconnect();
}