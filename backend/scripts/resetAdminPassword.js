import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
if (!email || !password || password.length < 12) {
  console.error("Set ADMIN_EMAIL and a new ADMIN_PASSWORD (at least 12 characters) in backend/.env.");
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGODB_URI);
  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new Error("No account found for ADMIN_EMAIL.");
  if (user.role !== "admin") throw new Error("ADMIN_EMAIL belongs to a non-admin account; password was not changed.");
  user.password = password;
  await user.save();
  console.log(`Password reset for the existing admin account ${email}.`);
} catch (error) {
  console.error("Admin password reset failed:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
