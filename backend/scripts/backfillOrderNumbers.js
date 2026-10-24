import "dotenv/config";
import mongoose from "mongoose";
import Order from "../models/Order.js";

if (!process.env.MONGODB_URI) throw new Error("Set MONGODB_URI in backend/.env.");
await mongoose.connect(process.env.MONGODB_URI);
try {
  const orders = await Order.find({ $or: [{ orderNumber: { $exists: false } }, { orderNumber: "" }] }).select("_id createdAt orderNumber").lean();
  let updated = 0;
  for (const order of orders) {
    const day = new Date(order.createdAt).toISOString().slice(2, 10).replaceAll("-", "");
    const orderNumber = `MMP-${day}-${String(order._id).slice(-6).toUpperCase()}`;
    const result = await Order.updateOne({ _id: order._id, $or: [{ orderNumber: { $exists: false } }, { orderNumber: "" }] }, { $set: { orderNumber } });
    updated += result.modifiedCount;
  }
  console.log(`Orders checked: ${orders.length}; tracking numbers assigned: ${updated}.`);
} finally {
  await mongoose.disconnect();
}
