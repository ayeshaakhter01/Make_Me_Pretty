import mongoose from "mongoose";

const storeLogoSchema = new mongoose.Schema(
  { key: { type: String, unique: true, default: "storefront" }, src: { type: String, default: "" } },
  { timestamps: true }
);

export default mongoose.model("StoreLogo", storeLogoSchema, "storelogos");
