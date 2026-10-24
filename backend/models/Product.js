import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  // Kept for compatibility with the original catalog collection's unique id index.
  id: { type: String, unique: true, required: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, required: true, trim: true, maxlength: 160 },
  brand: { type: String, required: true, trim: true, index: true },
  category: { type: String, required: true, trim: true, index: true },
  type: { type: String, required: true, trim: true },
  size: { type: String, trim: true, default: "" },
  sourceUrl: { type: String, trim: true, default: "" },
  priceSourceUrl: { type: String, trim: true, default: "" },
  priceCheckedAt: { type: Date, default: null },
  price: { type: Number, required: function () { return this.active; }, min: 0, default: 0 },
  compareAt: { type: Number, default: null, min: 0 },
  images: { type: [String], default: [] },
  description: { type: String, required: true, trim: true, maxlength: 4000 },
  ingredients: { type: [String], default: [] },
  usage: { type: String, default: "", maxlength: 2000 },
  skin: { type: String, default: "" },
  stock: { type: Number, default: 0, min: 0, validate: Number.isInteger },
  badge: { type: String, default: "" },
  active: { type: Boolean, default: true },
}, { timestamps: true });
productSchema.index({ name: "text", brand: "text", description: "text" });
export default mongoose.model("Product", productSchema);
