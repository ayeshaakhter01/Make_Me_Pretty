import "dotenv/config";
import mongoose from "mongoose";
import Order from "../models/Order.js";
import { makeOrderNumber } from "../modules/orders/services/orderService.js";

if (!process.env.MONGODB_URI) throw new Error("Set MONGODB_URI in backend/.env.");
await mongoose.connect(process.env.MONGODB_URI);
try {
  const orders = await Order.find({ orderNumber: /^MMP-DEMO-/i }).select("_id createdAt").lean();
  let renamed = 0;
  for (const order of orders) {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        await Order.updateOne({ _id: order._id }, { $set: { orderNumber: makeOrderNumber(new Date(order.createdAt)) } });
        renamed += 1;
        break;
      } catch (error) {
        if (error.code !== 11000) throw error;
      }
    }
  }
  console.log(`Sample orders found: ${orders.length}; renamed: ${renamed}.`);
} finally {
  await mongoose.disconnect();
}