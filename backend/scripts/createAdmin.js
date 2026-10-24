import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";

if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD || !process.env.ADMIN_NAME) {
  console.error("Set ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_NAME in backend/.env first.");
  process.exit(1);
}
if (process.env.ADMIN_PASSWORD.length < 12) {
  console.error("Use an admin password with at least 12 characters.");
  process.exit(1);
}
try {
  await mongoose.connect(process.env.MONGODB_URI);
  const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role !== "admin") throw new Error("That email already belongs to a non-admin account; choose another address.");
    console.log("Admin account already exists.");
  } else {
    await User.create({ name: process.env.ADMIN_NAME.trim(), email, password: process.env.ADMIN_PASSWORD, role: "admin" });
    console.log(`Admin account created for ${email}.`);
  }
} catch (error) {
  console.error("Admin setup failed:", error.message);
  process.exitCode = 1;
} finally { await mongoose.disconnect(); }
