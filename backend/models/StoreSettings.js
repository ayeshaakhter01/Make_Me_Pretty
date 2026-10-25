import mongoose from "mongoose";

const storeSettingsSchema = new mongoose.Schema({
  key: { type: String, unique: true, default: "storefront" },
  logo: { type: String, default: "" },
  footer: { type: mongoose.Schema.Types.Mixed, default: () => ({ helpLinks: [], policyLinks: [], socials: [], payments: [] }) },
  about: { type: mongoose.Schema.Types.Mixed, default: () => [] },
  contact: { type: mongoose.Schema.Types.Mixed, default: () => ({}) },
}, { timestamps: true, minimize: false });

export default mongoose.model("StoreSettings", storeSettingsSchema);
